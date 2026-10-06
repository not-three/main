#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: upload-file.sh [options] <file>

Options:
  --server <url>    API URL (default: https://api.not-th.re)
  --ui <url>        UI URL (default: https://not-th.re/)
  --password <pw>   API instance password
  --seed <base64>   Existing 32-byte encryption seed
  --name <name>     Remote file name (default: sanitized basename)
  --quiet           Print only the share URL
  --help            Show this help

Environment: NOT3_SERVER, NOT3_UI, NOT3_PASSWORD, NOT3_SEED
EOF
}

die() {
  printf '%s\n' "Error: $*" >&2
  exit 1
}

server=${NOT3_SERVER:-https://api.not-th.re}
ui=${NOT3_UI:-https://not-th.re/}
password=${NOT3_PASSWORD-}
seed=${NOT3_SEED-}
name=''
quiet=false
file=''

while (($#)); do
  case $1 in
    --server|--ui|--password|--seed|--name)
      option=$1
      (($# >= 2)) || die "Missing value for $option"
      case $option in
        --server) server=$2 ;;
        --ui) ui=$2 ;;
        --password) password=$2 ;;
        --seed) seed=$2 ;;
        --name) name=$2 ;;
      esac
      shift 2
      ;;
    --quiet) quiet=true; shift ;;
    --help) usage; exit 0 ;;
    --) shift; (($# == 1)) || die 'Expected exactly one file'; file=$1; shift ;;
    -*) die "Unknown option: $1" ;;
    *) [[ -z $file ]] || die 'Expected exactly one file'; file=$1; shift ;;
  esac
done

[[ -n $file ]] || die 'Expected a file; see --help'
[[ -f $file && -r $file ]] || die "Cannot read file: $file"

for dependency in curl openssl base64 xxd sha256sum head tail dd stat mktemp rm cat; do
  command -v "$dependency" >/dev/null 2>&1 || die "Missing dependency: $dependency"
done

[[ -n $server && -n $ui ]] || die 'Server and UI URLs must not be empty'
while [[ $server == */ ]]; do server=${server%/}; done
while [[ $ui == */ ]]; do ui=${ui%/}; done
server+=/
ui+=/

if [[ -z $name ]]; then name=${file##*/}; fi
name=${name//[^a-zA-Z0-9._-]/_}
[[ -n $name ]] || die 'Remote file name is empty'

tmp_dir=$(mktemp -d) || die 'Cannot create temporary directory'
upload_id=''
cleanup() {
  local result=$?
  rm -rf -- "$tmp_dir"
  if ((result != 0)) && [[ -n $upload_id ]]; then
    printf 'Upload ID for reporting: %s\n' "$upload_id" >&2
  fi
}
trap cleanup EXIT

if [[ -n $seed ]]; then
  [[ $seed =~ ^[A-Za-z0-9+/]{43}=$ ]] || die 'Invalid seed: expected padded base64 for 32 bytes'
  printf '%s' "$seed" | base64 --decode > "$tmp_dir/seed" 2>/dev/null || die 'Invalid seed base64'
  [[ $(stat -c %s -- "$tmp_dir/seed") == 32 ]] || die 'Invalid seed: expected 32 bytes'
  [[ $(base64 -w0 < "$tmp_dir/seed") == "$seed" ]] || die 'Invalid seed base64'
else
  seed=$(openssl rand -base64 32) || die 'Cannot generate seed'
  printf '%s' "$seed" | base64 --decode > "$tmp_dir/seed"
fi
key=$(xxd -p -c 256 "$tmp_dir/seed")

json_escape() {
  local value=$1 result='' char code i
  for ((i = 0; i < ${#value}; i++)); do
    char=${value:i:1}
    case $char in
      '"') result+='\"' ;;
      '\') result+='\\' ;;
      $'\b') result+='\b' ;;
      $'\f') result+='\f' ;;
      $'\n') result+='\n' ;;
      $'\r') result+='\r' ;;
      $'\t') result+='\t' ;;
      *)
        printf -v code '%d' "'$char"
        if ((code < 32)); then
          printf -v char '\\u%04x' "$code"
        fi
        result+=$char
        ;;
    esac
  done
  json_escaped=$result
}

json_string_field() {
  local input=$1 key=$2 rest char escaped digits i
  local marker="\"$key\""
  [[ $input == *"$marker"* ]] || die "Missing $key in API response"
  rest=${input#*"$marker"}
  rest=${rest#"${rest%%[![:space:]]*}"}
  [[ $rest == :* ]] || die "Invalid $key in API response"
  rest=${rest:1}
  rest=${rest#"${rest%%[![:space:]]*}"}
  [[ $rest == '"'* ]] || die "Invalid $key in API response"
  rest=${rest:1}
  json_value=''
  for ((i = 0; i < ${#rest}; i++)); do
    char=${rest:i:1}
    if [[ $char == '"' ]]; then return 0; fi
    if [[ $char == '\' ]]; then
      ((i += 1))
      ((i < ${#rest})) || die "Invalid $key escape in API response"
      escaped=${rest:i:1}
      case $escaped in
        '"'|'\'|/) char=$escaped ;;
        b) char=$'\b' ;;
        f) char=$'\f' ;;
        n) char=$'\n' ;;
        r) char=$'\r' ;;
        t) char=$'\t' ;;
        u)
          digits=${rest:i+1:4}
          [[ $digits =~ ^[[:xdigit:]]{4}$ ]] || die "Invalid $key Unicode escape"
          printf -v char '%b' "\\u$digits"
          ((i += 4))
          ;;
        *) die "Invalid $key escape in API response" ;;
      esac
    fi
    json_value+=$char
  done
  die "Unterminated $key in API response"
}

auth_args=()
if [[ -n $password ]]; then auth_args=(-H "Authorization: Bearer $password"); fi
api_request() {
  local method=$1 url=$2 status
  shift 2
  local data_args=()
  if (($#)); then data_args=(-H 'Content-Type: application/json' --data-binary "$1"); fi
  if status=$(curl --silent --show-error -X "$method" "${auth_args[@]}" "${data_args[@]}" \
      -o "$tmp_dir/api-body" -w '%{http_code}' "$url"); then
    :
  else
    printf 'API request failed (HTTP %s)\n' "${status:-000}" >&2
    [[ ! -s $tmp_dir/api-body ]] || cat "$tmp_dir/api-body" >&2
    exit 1
  fi
  if [[ $status != 2?? ]]; then
    printf 'API HTTP %s: ' "$status" >&2
    cat "$tmp_dir/api-body" >&2
    printf '\n' >&2
    exit 1
  fi
  api_status=$status
}

urlencode() {
  local LC_ALL=C
  local value=$1 result='' char encoded i
  for ((i = 0; i < ${#value}; i++)); do
    char=${value:i:1}
    case $char in
      [a-zA-Z0-9*._-]) result+=$char ;;
      ' ') result+='+' ;;
      *) printf -v encoded '%%%02X' "'$char"; result+=$encoded ;;
    esac
  done
  urlencoded=$result
}

json_escape "$name"
api_request POST "${server}file/upload" "{\"name\":\"${json_escaped}\"}"
json_string_field "$(<"$tmp_dir/api-body")" id
upload_id=$json_value
[[ $upload_id =~ ^[a-zA-Z0-9._-]+$ ]] || die 'Invalid upload id in API response'

file_size=$(stat -c %s -- "$file")
part_size=5242816
part_count=$(((file_size + part_size - 1) / part_size))
if ((part_count == 0)); then part_count=1; fi
etags_json='['

for ((part = 1; part <= part_count; part++)); do
  printf 'Uploading part %d/%d\n' "$part" "$part_count" >&2
  offset=$(((part - 1) * part_size))
  length=$((file_size - offset))
  if ((length > part_size)); then length=$part_size; fi
  dd if="$file" of="$tmp_dir/plain" bs=1048576 iflag=skip_bytes,count_bytes \
    skip="$offset" count="$length" status=none
  hash=$(sha256sum "$tmp_dir/plain")
  hash=${hash%% *}
  printf '%s' "$hash" | xxd -r -p > "$tmp_dir/message"
  cat "$tmp_dir/plain" >> "$tmp_dir/message"
  iv=$(openssl rand -hex 16)
  printf '%s' "$iv" | xxd -r -p > "$tmp_dir/part"
  openssl enc -aes-256-cbc -e -K "$key" -iv "$iv" \
    -in "$tmp_dir/message" -out "$tmp_dir/cipher"
  cat "$tmp_dir/cipher" >> "$tmp_dir/part"
  encrypted_size=$(stat -c %s -- "$tmp_dir/part")

  api_request GET "${server}file/upload/${upload_id}?length=${encrypted_size}&part=${part}"
  json_string_field "$(<"$tmp_dir/api-body")" url
  presigned_url=$json_value
  [[ $presigned_url == http://* || $presigned_url == https://* ]] || die 'Invalid presigned URL'
  if status=$(curl --silent --show-error -X PUT -H 'Content-Type: application/octet-stream' \
      --data-binary @"$tmp_dir/part" -D "$tmp_dir/put-headers" \
      -o "$tmp_dir/put-body" -w '%{http_code}' "$presigned_url"); then
    :
  else
    printf 'Presigned PUT failed (HTTP %s)\n' "${status:-000}" >&2
    [[ ! -s $tmp_dir/put-body ]] || cat "$tmp_dir/put-body" >&2
    exit 1
  fi
  if [[ $status != 2?? ]]; then
    printf 'Presigned PUT HTTP %s: ' "$status" >&2
    cat "$tmp_dir/put-body" >&2
    printf '\n' >&2
    exit 1
  fi
  etag=''
  while IFS= read -r header; do
    if [[ $header =~ ^[Ee][Tt][Aa][Gg]:[[:space:]]*(.*)$ ]]; then
      etag=${BASH_REMATCH[1]%$'\r'}
    fi
  done < "$tmp_dir/put-headers"
  [[ -n $etag ]] || die "Missing ETag for part $part"
  json_escape "$etag"
  if ((part > 1)); then etags_json+=','; fi
  etags_json+="\"${json_escaped}\""
done

etags_json+=']'
api_request PUT "${server}file/upload/${upload_id}" "{\"etags\":${etags_json}}"
if [[ $api_status != 204 ]]; then
  printf 'API HTTP %s: expected 204; response: ' "$api_status" >&2
  cat "$tmp_dir/api-body" >&2
  printf '\n' >&2
  exit 1
fi
urlencode "$seed"
fragment="k=${urlencoded}"
if [[ $server != 'https://api.not-th.re/' ]]; then
  urlencode "$server"
  fragment+="&s=${urlencoded}"
fi
fragment=$(printf '%s' "$fragment" | base64 -w0)
share_url="${ui}f/${upload_id}#${fragment}"

if $quiet; then
  printf '%s\n' "$share_url"
else
  printf 'ID    %s\nSeed  %s\nURL   %s\n' "$upload_id" "$seed" "$share_url"
  printf 'cURL  curl https://raw.githubusercontent.com/not-three/main/refs/heads/main/scripts/decrypt-file.sh | bash -s %sfile/%s %s %s\n' \
    "$server" "$upload_id" "$seed" "$name"
fi
