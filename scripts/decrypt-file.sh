#!/bin/bash

set -e

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
  echo "Usage: $0 <url/file> <seed> <output>"
  exit 1
fi

url_or_file=$1
seed=$(echo -n $2 | base64 -d | xxd -p | tr -d '\n')
output=$3

if [ -f "$output" ]; then
  echo "Output file $output already exists"
  echo "Do you want to overwrite it? (y/n)"
  read -r response
  if [ "$response" != "y" ]; then
    exit 1
  fi
fi

if [ ! -f "$url_or_file" ]; then
  echo "Downloading $url_or_file to $output.raw"
  curl -L -o $output.raw $url_or_file
  url_or_file=$output.raw
fi

part_size=5242880 # 5MB
hash_size=32
iv_size=16
file_size=$(stat -c %s $url_or_file)
part_count=$((($file_size + $part_size - 1) / $part_size))
current_part=0

echo "Starting decryption..."
echo ""

while [ $current_part -lt $part_count ]; do
  current_part_padded=$(printf "%05d" $current_part)
  part_output=$output.part.$current_part_padded
  part_offset=$(($current_part * $part_size))
  part_length=$(($part_size))
  if [ $(($part_offset + $part_length)) -gt $file_size ]; then
    part_length=$(($file_size - $part_offset))
  fi

  echo "Extracting part $current_part ($part_offset, $(($part_offset + $part_length)), $part_length) to $part_output"
  head -c $(($part_offset + $part_length)) $url_or_file | tail -c $part_length > $part_output
  echo "Extracting iv from part $current_part to $part_output.iv"
  head -c $iv_size $part_output > $part_output.iv
  echo "Extracting raw encrypted data from part $current_part to $part_output.raw"
  tail -c +$(($iv_size + 1)) $part_output > $part_output.raw

  iv=$(cat $part_output.iv | xxd -p | tr -d '\n')
  echo "Decrypting part $current_part with iv $iv"
  openssl enc -aes-256-cbc -d -in $part_output.raw -out $part_output.decrypted -K $seed -iv $iv

  echo "Extracting hash from part $current_part to $part_output.hash"
  head -c $hash_size $part_output.decrypted > $part_output.hash
  echo "Extracting raw decrypted data from part $current_part to $part_output.bin"
  tail -c +$(($hash_size + 1)) $part_output.decrypted > $part_output.bin

  hash_hex=$(xxd -p $part_output.hash | tr -d '\n')
  echo "Verifying hash for part $current_part ($hash_hex)" 
  hash=$(sha256sum $part_output.bin | cut -d ' ' -f 1)
  if [ "$hash" != "$hash_hex" ]; then
    echo "Hash verification failed for part $current_part, $hash != $hash_hex"
    exit 1
  fi

  echo "Cleaning up part $current_part"
  rm $part_output $part_output.decrypted $part_output.hash $part_output.iv $part_output.raw
  current_part=$(($current_part + 1))

  echo ""
  echo "Completed part $current_part/$part_count"
  echo ""
done

echo "Combining parts to $output"
cat $output.part.*.bin > $output
echo "Cleaning up part files"
rm $output.part.*.bin

if [ -f $output.raw ]; then
  echo "Cleaning up raw file"
  rm $output.raw
fi

echo "Done!"
