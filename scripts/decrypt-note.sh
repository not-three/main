#!/bin/bash

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <url/file> <seed>"
  exit 1
fi

url_or_file=$1
seed=$(echo -n $2 | base64 -d | xxd -p | tr -d '\n')

if [ ! -f "$url_or_file" ]; then
  curl -L -o not3.enc $url_or_file
  url_or_file=not3.enc
fi

hash_size=32
iv_size=16

base64 -d $url_or_file > $url_or_file.decoded

head -c $iv_size $url_or_file.decoded > $url_or_file.iv
tail -c +$(($iv_size + 1)) $url_or_file.decoded > $url_or_file.raw

iv=$(cat $url_or_file.iv | xxd -p | tr -d '\n')
openssl enc -aes-256-cbc -d -in $url_or_file.raw -out $url_or_file.decrypted -K $seed -iv $iv

head -c $hash_size $url_or_file.decrypted > $url_or_file.hash
tail -c +$(($hash_size + 1)) $url_or_file.decrypted > $url_or_file.bin

hash_hex=$(xxd -p $url_or_file.hash | tr -d '\n')
hash=$(sha256sum $url_or_file.bin | cut -d ' ' -f 1)
if [ "$hash" != "$hash_hex" ]; then
  echo "Hash verification failed, $hash != $hash_hex"
  exit 1
fi

cat $url_or_file.bin

rm $url_or_file.bin $url_or_file.iv $url_or_file.raw $url_or_file.decrypted $url_or_file.hash $url_or_file.decoded
if [ -f not3.enc ]; then
  rm not3.enc
fi
