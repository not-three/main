param($Source, $Seed)

if ($Source -eq '--help' -or $args -contains '--help') {
    [Console]::Out.WriteLine('Usage: decrypt-note.ps1 <url/file> <seed>')
    return
}

$ErrorActionPreference = 'Stop'

try {
    if ([string]::IsNullOrEmpty($Source) -or [string]::IsNullOrEmpty($Seed)) {
        throw 'Usage: decrypt-note.ps1 <url/file> <seed>'
    }

    try {
        $key = [Convert]::FromBase64String($Seed)
    } catch {
        throw 'Seed must be standard base64 encoding of 32 bytes.'
    }
    if ($key.Length -ne 32) {
        throw 'Seed must be standard base64 encoding of 32 bytes.'
    }

    if ([IO.File]::Exists($Source)) {
        $encoded = [IO.File]::ReadAllText($Source)
    } else {
        $encoded = (Invoke-WebRequest -Uri $Source -UseBasicParsing).Content
    }
    if ($encoded -is [byte[]]) {
        $encoded = [Text.Encoding]::ASCII.GetString($encoded)
    }
    $blob = [Convert]::FromBase64String($encoded)
    if ($blob.Length -lt 64 -or (($blob.Length - 16) % 16) -ne 0) {
        throw 'Encrypted note has an invalid length.'
    }

    $aes = [Security.Cryptography.Aes]::Create()
    try {
        $aes.Mode = [Security.Cryptography.CipherMode]::CBC
        $aes.Padding = [Security.Cryptography.PaddingMode]::PKCS7
        $aes.Key = $key
        $iv = New-Object byte[] 16
        [Array]::Copy($blob, 0, $iv, 0, 16)
        $aes.IV = $iv
        $decryptor = $aes.CreateDecryptor()
        try {
            $plain = $decryptor.TransformFinalBlock($blob, 16, $blob.Length - 16)
        } finally {
            $decryptor.Dispose()
        }
    } finally {
        $aes.Dispose()
    }
    if ($plain.Length -lt 32) {
        throw 'Encrypted note is missing its checksum.'
    }

    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        $actual = $sha.ComputeHash($plain, 32, $plain.Length - 32)
    } finally {
        $sha.Dispose()
    }
    $difference = 0
    for ($i = 0; $i -lt 32; $i++) {
        $difference = $difference -bor ($plain[$i] -bxor $actual[$i])
    }
    if ($difference -ne 0) {
        throw 'Note checksum mismatch.'
    }

    $utf8 = [Text.UTF8Encoding]::new($false, $true)
    $text = $utf8.GetString($plain, 32, $plain.Length - 32)
    [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
    [Console]::Out.Write($text)
} catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    exit 1
}
