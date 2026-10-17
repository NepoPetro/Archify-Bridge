$ErrorActionPreference = 'Stop'

$livemarkCommand = Get-Command livemark -ErrorAction SilentlyContinue
$livemarkPath = if ($livemarkCommand) {
    $livemarkCommand.Source
} else {
    Get-ChildItem -Path (Join-Path $env:LOCALAPPDATA 'Python') -Directory -ErrorAction SilentlyContinue |
        ForEach-Object { Join-Path $_.FullName 'Scripts/livemark.exe' } |
        Where-Object { Test-Path -LiteralPath $_ } |
        Select-Object -First 1
}

if (-not $livemarkPath) {
    throw 'Livemark was not found. Install it with: pip install livemark'
}

function Build-Markdown($source, $target) {
    & $livemarkPath build $source --target $target
    if ($LASTEXITCODE -ne 0) { throw "Livemark failed to build $source." }
}

Build-Markdown 'docs/DECISIONS.md' 'docs/DECISIONS.html'
Build-Markdown 'README.md' 'docs/README.html'

Get-ChildItem -Path docs/adrs -Filter '*.md' -File | Sort-Object Name | ForEach-Object {
    $target = Join-Path $_.DirectoryName ($_.BaseName + '.html')
    Build-Markdown $_.FullName $target
}
