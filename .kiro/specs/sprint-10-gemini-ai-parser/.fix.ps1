$path = 'c:\Users\Patoni\Desktop\luma\.kiro\specs\sprint-10-gemini-ai-parser\design.md'
$content = Get-Content -Raw $path
$pattern = '### P(\d+) — '
$replacement = '### Property ${1}: '
$new = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, $replacement)
Set-Content -NoNewline -Path $path -Value $new
