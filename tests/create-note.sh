#!/usr/bin/env bash
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
mkdir "$work/bin"

cat > "$work/bin/curl" <<'CURL'
#!/usr/bin/env bash
set -euo pipefail
output= data= url=
: > "$CAPTURE_HEADERS"
while (($#)); do
  case $1 in
    -o|--output) output=$2; shift 2 ;;
    --data-binary) data=$2; shift 2 ;;
    -H|--header) printf '%s\n' "$2" >> "$CAPTURE_HEADERS"; shift 2 ;;
    -X|--request|-w|--write-out) shift 2 ;;
    -sS|--silent|--show-error) shift ;;
    *) url=$1; shift ;;
  esac
done
printf '%s' "$url" > "$CAPTURE_URL"
if [[ $data == @* ]]; then
  cp "${data#@}" "$CAPTURE_JSON"
fi
if [[ ${FAKE_TRANSPORT_FAIL:-false} == true ]]; then
  printf '000'
  exit 7
fi
printf '%s' "${FAKE_BODY:-{\"id\":\"abc123\"}}" > "$output"
printf '%s' "${FAKE_STATUS:-200}"
CURL
chmod +x "$work/bin/curl"

export PATH="$work/bin:$PATH"
export CAPTURE_HEADERS="$work/headers" CAPTURE_URL="$work/url" CAPTURE_JSON="$work/request.json"

fail() { printf 'FAIL: %s\n' "$*" >&2; exit 1; }
assert_eq() { [[ $1 == "$2" ]] || fail "expected [$2], got [$1]"; }
run() {
  local name=$1
  shift
  "test_$name" "$@"
  printf 'PASS %s\n' "$name"
}

test_help() {
  "$root/scripts/create-note.sh" --help > "$work/out"
  [[ -s $work/out ]] || fail 'help did not print usage'
}

test_empty() {
  : > "$work/empty"
  local rc=0
  "$root/scripts/create-note.sh" "$work/empty" > "$work/out" 2> "$work/err" || rc=$?
  assert_eq "$rc" 2
  [[ ! -e $CAPTURE_JSON ]] || fail 'empty note was posted'
}

test_seed() {
  printf 'hello' > "$work/note"
  local rc=0
  "$root/scripts/create-note.sh" --seed bad "$work/note" > "$work/out" 2> "$work/err" || rc=$?
  [[ $rc -ne 0 ]] || fail 'invalid seed accepted'
  [[ ! -e $CAPTURE_JSON ]] || fail 'invalid seed was posted'
  rc=0
  "$root/scripts/create-note.sh" --seed 'AAECAwQFBgcICQoLDA0ODw==' "$work/note" > "$work/out" 2> "$work/err" || rc=$?
  [[ $rc -ne 0 ]] || fail 'non-32-byte seed accepted'
  [[ ! -e $CAPTURE_JSON ]] || fail 'non-32-byte seed was posted'
  rc=0
  "$root/scripts/create-note.sh" --seed '' "$work/note" > "$work/out" 2> "$work/err" || rc=$?
  [[ $rc -ne 0 ]] || fail 'explicit empty seed accepted'
  [[ ! -e $CAPTURE_JSON ]] || fail 'empty seed was posted'
}

test_output_and_seed_url() {
  printf 'note' > "$work/note"
  local seed='+/////////////////////////////////////////8='
  local output
  output=$("$root/scripts/create-note.sh" --seed "$seed" "$work/note")
  [[ $output == "ID    abc123"$'\n'"Seed  $seed"$'\n''URL   https://not-th.re/q/abc123#'* ]] || fail 'normal output missing fields'
  [[ $output == *"cURL  curl https://raw.githubusercontent.com/not-three/main/refs/heads/main/scripts/decrypt-note.sh | bash -s https://api.not-th.re/note/abc123/raw $seed" ]] || fail 'cURL line wrong'
  local url=${output#*URL   }
  url=${url%%$'\n'*}
  local fragment
  fragment=$(printf '%s' "${url#*#}" | base64 -d)
  [[ $fragment == k=%2B%2F*%3D && $fragment != *'&s='* ]] || fail "seed URL encoding or default server omission wrong: $fragment"
}

test_env_precedence() {
  printf 'note' > "$work/note"
  NOT3_SERVER=https://wrong.example NOT3_UI=https://wrong.example NOT3_PASSWORD=wrong NOT3_SEED=bad \
    "$root/scripts/create-note.sh" --server http://localhost:3000 --ui https://right.example/ --password right \
      --seed AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8= --quiet "$work/note" > "$work/out"
  [[ $(<"$work/out") == https://right.example/q/abc123#* ]] || fail 'CLI UI did not override environment'
  assert_eq "$(<"$CAPTURE_URL")" 'http://localhost:3000/note/json'
  [[ $(<"$CAPTURE_HEADERS") == *'Authorization: Bearer right'* ]] || fail 'CLI password did not override environment'
}

test_roundtrip() {
  printf 'Grüße ☃\n' > "$work/note"
  printf '\200\377\201\n' >> "$work/note"
  local seed='AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8='
  local url
  url=$("$root/scripts/create-note.sh" --seed "$seed" --quiet "$work/note")
  assert_eq "$(<"$CAPTURE_URL")" 'https://api.not-th.re/note/json'
  [[ $url == "https://not-th.re/q/abc123#"* ]] || fail "unexpected URL: $url"
  local fragment=${url#*#}
  assert_eq "$(printf '%s' "$fragment" | base64 -d)" 'k=AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8%3D'
  [[ $(<"$CAPTURE_JSON") == *'"expiresIn":86400,"selfDestruct":false,"mime":"text/plain"'* ]] || fail 'default JSON fields wrong'
  sed -n 's/^.*"content":"\([^"]*\)".*$/\1/p' "$CAPTURE_JSON" > "$work/blob"
  bash "$root/scripts/decrypt-note.sh" "$work/blob" "$seed" > "$work/decrypted"
  cmp "$work/note" "$work/decrypted" || fail 'note bytes changed'
}

test_stdin_options() {
  printf 'stdin payload' > "$work/note"
  local seed='AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8='
  local url
  url=$("$root/scripts/create-note.sh" --server http://localhost:3000 --ui https://elsewhere.example/app --password secret --seed "$seed" --expires 17 --self-destruct --mime $'text/x-"quoted"\\path\n' --quiet - < "$work/note")
  assert_eq "$(<"$CAPTURE_URL")" 'http://localhost:3000/note/json'
  local decoded
  decoded=$(printf '%s' "${url#*#}" | base64 -d)
  [[ $decoded == *'&s=http%3A%2F%2Flocalhost%3A3000%2F&d=1' ]] || fail "fragment wrong: $decoded"
  [[ $(<"$CAPTURE_JSON") == *'"expiresIn":17,"selfDestruct":true,"mime":"text/x-\"quoted\"\\path\n"'* ]] || fail 'custom JSON fields wrong'
  assert_eq "$(<"$CAPTURE_HEADERS")" $'Content-Type: application/json\nAuthorization: Bearer secret'
  [[ $url == 'https://elsewhere.example/app/q/abc123#'* ]] || fail "UI normalization wrong: $url"
  [[ $decoded == 'k=AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8%3D&'* ]] || fail "seed encoding wrong: $decoded"
  sed -n 's/^.*"content":"\([^"]*\)".*$/\1/p' "$CAPTURE_JSON" > "$work/blob"
  bash "$root/scripts/decrypt-note.sh" "$work/blob" "$seed" > "$work/decrypted"
  cmp "$work/note" "$work/decrypted" || fail 'stdin bytes changed'
}

test_api_error() {
  printf 'note' > "$work/note"
  local rc=0
  FAKE_STATUS=403 FAKE_BODY='denied' "$root/scripts/create-note.sh" "$work/note" > "$work/out" 2> "$work/err" || rc=$?
  [[ $rc -ne 0 ]] || fail 'HTTP error accepted'
  [[ $(<"$work/err") == *403*denied* ]] || fail 'HTTP status/body missing'
}

test_bad_response() {
  printf 'note' > "$work/note"
  local rc=0
  FAKE_BODY='{"bad":"id"}' "$root/scripts/create-note.sh" "$work/note" > "$work/out" 2> "$work/err" || rc=$?
  [[ $rc -ne 0 ]] || fail 'missing id accepted'
  [[ $(<"$work/err") == *200*'{"bad":"id"}'* ]] || fail 'malformed response status/body missing'
}

test_transport_error() {
  printf 'note' > "$work/note"
  local rc=0
  FAKE_TRANSPORT_FAIL=true "$root/scripts/create-note.sh" "$work/note" > "$work/out" 2> "$work/err" || rc=$?
  [[ $rc -ne 0 ]] || fail 'transport error accepted'
  [[ $(<"$work/err") == *'HTTP 000'* ]] || fail 'transport error status missing'
}

test_missing_dependency() {
  printf 'note' > "$work/note"
  local rc=0
  PATH="$work/empty-path" /usr/bin/bash "$root/scripts/create-note.sh" "$work/note" > "$work/out" 2> "$work/err" || rc=$?
  [[ $rc -ne 0 ]] || fail 'missing dependency accepted'
  [[ $(<"$work/err") == *curl* ]] || fail 'missing dependency not named'
}

case ${1:-all} in
  all) for name in help empty seed roundtrip stdin_options output_and_seed_url env_precedence api_error bad_response transport_error missing_dependency; do run "$name"; done ;;
  *) run "$1" ;;
esac
