#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: create-note.sh [options] [file]
Read a note from file or standard input and print its encrypted share URL.

Options:
  --server URL       API URL (default: https://api.not-th.re)
  --ui URL           UI URL (default: https://not-th.re/)
  --password VALUE   API instance password
  --seed BASE64      32-byte encryption seed in standard padded base64
  --expires SECONDS  Lifetime in seconds (default: 86400)
  --self-destruct    Delete after the first read
  --mime TYPE        Note MIME type (default: text/plain)
  --quiet            Print only the share URL
  --help             Show this help

Environment: NOT3_SERVER, NOT3_UI, NOT3_PASSWORD, NOT3_SEED.
EOF
}

error() { printf '%s\n' "$*" >&2; exit 2; }

server=${NOT3_SERVER:-https://api.not-th.re}
ui=${NOT3_UI:-https://not-th.re/}
password=${NOT3_PASSWORD:-}
seed=${NOT3_SEED:-}
seed_supplied=${NOT3_SEED+x}
expires=86400
self_destruct=false
mime=text/plain
quiet=false
file=-
file_seen=false

while (($#)); do
  case $1 in
    --help) usage; exit 0 ;;
    --server|--ui|--password|--seed|--expires|--mime)
      (($# >= 2)) || error "Missing value for $1"
      case $1 in
        --server) server=$2 ;;
        --ui) ui=$2 ;;
        --password) password=$2 ;;
        --seed) seed=$2; seed_supplied=true ;;
        --expires) expires=$2 ;;
        --mime) mime=$2 ;;
      esac
      shift 2 ;;
    --self-destruct) self_destruct=true; shift ;;
    --quiet) quiet=true; shift ;;
    --) shift; break ;;
    -*) [[ $1 == - ]] || error "Unknown option: $1"
        [[ $file_seen == false ]] || error 'Only one input file is allowed'
        file=$1; file_seen=true; shift ;;
    *)  [[ $file_seen == false ]] || error 'Only one input file is allowed'
        file=$1; file_seen=true; shift ;;
  esac
done
if (($#)); then
  [[ $file_seen == false && $# == 1 ]] || error 'Only one input file is allowed'
  file=$1
fi

for dependency in curl openssl base64 xxd sha256sum head tail; do
  command -v "$dependency" >/dev/null 2>&1 || error "Missing dependency: $dependency"
done

[[ $expires =~ ^[0-9]+$ ]] || error '--expires must be a nonnegative integer'
[[ -n $server && -n $ui ]] || error 'Server and UI URLs must be nonempty'
while [[ $server == */ ]]; do server=${server%/}; done
while [[ $ui == */ ]]; do ui=${ui%/}; done
server+=/
ui+=/

umask 077
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

if [[ $file == - ]]; then
  tail -c +1 > "$tmp/note"
else
  [[ -f $file && -r $file ]] || error "Cannot read note: $file"
  tail -c +1 -- "$file" > "$tmp/note"
fi
[[ -s $tmp/note ]] || error 'Note is empty'

if [[ -z $seed_supplied ]]; then
  seed=$(openssl rand -base64 32)
fi
[[ $seed =~ ^[A-Za-z0-9+/]{43}=$ ]] || error 'Seed must be standard padded base64 of 32 bytes'
printf '%s' "$seed" | base64 -d > "$tmp/key" 2>/dev/null || error 'Invalid base64 seed'
key_hex=$(xxd -p -c 256 "$tmp/key")
[[ ${#key_hex} == 64 && $(base64 -w 0 "$tmp/key") == "$seed" ]] || error 'Seed must decode to exactly 32 bytes'

digest=$(sha256sum "$tmp/note")
printf '%s' "${digest:0:64}" | xxd -r -p > "$tmp/plain"
tail -c +1 "$tmp/note" >> "$tmp/plain"
iv_hex=$(openssl rand -hex 16)
openssl enc -aes-256-cbc -K "$key_hex" -iv "$iv_hex" -in "$tmp/plain" -out "$tmp/cipher"
printf '%s' "$iv_hex" | xxd -r -p > "$tmp/blob"
tail -c +1 "$tmp/cipher" >> "$tmp/blob"
base64 -w 0 "$tmp/blob" > "$tmp/content"

json_escape() {
  local LC_ALL=C value=$1 char escaped='' ord hex i
  for ((i=0; i<${#value}; i++)); do
    char=${value:i:1}
    case $char in
      '"') escaped+='\"' ;;
      '\') escaped+='\\' ;;
      $'\b') escaped+='\b' ;;
      $'\f') escaped+='\f' ;;
      $'\n') escaped+='\n' ;;
      $'\r') escaped+='\r' ;;
      $'\t') escaped+='\t' ;;
      *)  printf -v ord '%d' "'$char"
          if ((ord < 32)); then
            printf -v hex '%02X' "$ord"
            escaped+="\\u00$hex"
          else
            escaped+=$char
          fi ;;
    esac
  done
  printf '%s' "$escaped"
}

escaped_mime=$(json_escape "$mime")
printf '{"content":"%s","expiresIn":%s,"selfDestruct":%s,"mime":"%s"}' \
  "$(<"$tmp/content")" "$expires" "$self_destruct" "$escaped_mime" > "$tmp/request"

curl_args=(-sS -o "$tmp/response" -w '%{http_code}' -X POST
  -H 'Content-Type: application/json')
if [[ -n $password ]]; then
  curl_args+=(-H "Authorization: Bearer $password")
fi
curl_args+=(--data-binary "@$tmp/request" "${server}note/json")
status=000
: > "$tmp/response"
if ! status=$(curl "${curl_args[@]}"); then
  printf 'API request failed (HTTP %s): %s\n' "$status" "$(<"$tmp/response")" >&2
  exit 1
fi
if [[ ! $status =~ ^2[0-9][0-9]$ ]]; then
  printf 'API request failed (HTTP %s): %s\n' "$status" "$(<"$tmp/response")" >&2
  exit 1
fi

response=$(<"$tmp/response")
id_pattern='"id"[[:space:]]*:[[:space:]]*"([A-Za-z0-9_-]+)"'
[[ $response =~ $id_pattern ]] || { printf 'API response missing a valid id (HTTP %s): %s\n' "$status" "$response" >&2; exit 1; }
id=${BASH_REMATCH[1]}

urlencode() {
  local LC_ALL=C value=$1 char result='' hex i
  for ((i=0; i<${#value}; i++)); do
    char=${value:i:1}
    case $char in
      [a-zA-Z0-9._~-]) result+=$char ;;
      ' ') result+='+' ;;
      *) printf -v hex '%02X' "'$char"
         result+="%$hex" ;;
    esac
  done
  printf '%s' "$result"
}

fragment="k=$(urlencode "$seed")"
if [[ $server != 'https://api.not-th.re/' ]]; then
  fragment+="&s=$(urlencode "$server")"
fi
if [[ $self_destruct == true ]]; then
  fragment+='&d=1'
fi
fragment=$(printf '%s' "$fragment" | base64 -w 0)
url="${ui}q/${id}#${fragment}"
if [[ $quiet == true ]]; then
  printf '%s\n' "$url"
else
  printf 'ID    %s\nSeed  %s\nURL   %s\ncURL  curl https://raw.githubusercontent.com/not-three/main/refs/heads/main/scripts/decrypt-note.sh | bash -s %snote/%s/raw %s\n' \
    "$id" "$seed" "$url" "$server" "$id" "$seed"
fi
