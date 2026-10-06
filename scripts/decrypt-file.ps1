param($Source, $Seed, $Output)

if ($Source -eq '--help' -or $args -contains '--help') {
    [Console]::Out.WriteLine('Usage: decrypt-file.ps1 <url/file> <seed> <output>')
    return
}

$ErrorActionPreference = 'Stop'
$download = $null
$staging = $null
$inputStream = $null
$outputStream = $null

try {
    if ([string]::IsNullOrEmpty($Source) -or [string]::IsNullOrEmpty($Seed) -or [string]::IsNullOrEmpty($Output)) {
        throw 'Usage: decrypt-file.ps1 <url/file> <seed> <output>'
    }

    try {
        $key = [Convert]::FromBase64String($Seed)
    } catch {
        throw 'Seed must be standard base64 encoding of 32 bytes.'
    }
    if ($key.Length -ne 32) {
        throw 'Seed must be standard base64 encoding of 32 bytes.'
    }

    $outputPath = [IO.Path]::GetFullPath($Output)
    if ([IO.File]::Exists($outputPath)) {
        [Console]::Error.Write("Output file $outputPath exists. Overwrite? [y/N] ")
        if ([Console]::ReadLine() -ne 'y') {
            throw 'Overwrite refused; existing output was preserved.'
        }
    }

    if ([IO.File]::Exists($Source)) {
        $encryptedPath = $Source
    } else {
        $download = [IO.Path]::GetTempFileName()
        Invoke-WebRequest -Uri $Source -OutFile $download -UseBasicParsing | Out-Null
        $encryptedPath = $download
    }

    $staging = "$outputPath.partial.$([Guid]::NewGuid().ToString('N'))"
    $inputStream = [IO.File]::OpenRead($encryptedPath)
    if ($inputStream.Length -eq 0) {
        throw 'Encrypted file is empty.'
    }
    $outputStream = [IO.File]::Open($staging, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
    $partSize = 5242880
    $buffer = New-Object byte[] $partSize
    $part = 0

    while ($inputStream.Position -lt $inputStream.Length) {
        $length = [int][Math]::Min($partSize, $inputStream.Length - $inputStream.Position)
        $read = 0
        while ($read -lt $length) {
            $count = $inputStream.Read($buffer, $read, $length - $read)
            if ($count -eq 0) {
                throw "Encrypted file ended in part $part."
            }
            $read += $count
        }
        if ($length -lt 64 -or (($length - 16) % 16) -ne 0) {
            throw "Encrypted part $part has an invalid length."
        }

        $aes = [Security.Cryptography.Aes]::Create()
        try {
            $aes.Mode = [Security.Cryptography.CipherMode]::CBC
            $aes.Padding = [Security.Cryptography.PaddingMode]::PKCS7
            $aes.Key = $key
            $iv = New-Object byte[] 16
            [Array]::Copy($buffer, 0, $iv, 0, 16)
            $aes.IV = $iv
            $decryptor = $aes.CreateDecryptor()
            try {
                $plain = $decryptor.TransformFinalBlock($buffer, 16, $length - 16)
            } finally {
                $decryptor.Dispose()
            }
        } finally {
            $aes.Dispose()
        }
        if ($plain.Length -lt 32) {
            throw "Encrypted part $part is missing its checksum."
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
            throw "Checksum mismatch in part $part."
        }
        $outputStream.Write($plain, 32, $plain.Length - 32)
        $part++
    }

    $outputStream.Dispose()
    $outputStream = $null
    $inputStream.Dispose()
    $inputStream = $null
    if ([IO.File]::Exists($outputPath)) {
        $backup = "$outputPath.backup.$([Guid]::NewGuid().ToString('N'))"
        [IO.File]::Replace($staging, $outputPath, $backup)
        [IO.File]::Delete($backup)
    } else {
        [IO.File]::Move($staging, $outputPath)
    }
    $staging = $null
} catch {
    [Console]::Error.WriteLine("Decryption failed: $($_.Exception.Message)")
    exit 1
} finally {
    if ($outputStream -ne $null) { $outputStream.Dispose() }
    if ($inputStream -ne $null) { $inputStream.Dispose() }
    if ($staging -ne $null -and [IO.File]::Exists($staging)) { [IO.File]::Delete($staging) }
    if ($download -ne $null -and [IO.File]::Exists($download)) { [IO.File]::Delete($download) }
}
