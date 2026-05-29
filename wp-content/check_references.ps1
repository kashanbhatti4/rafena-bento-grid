$htmlPath = 'C:\Users\pc\Downloads\rafena-landing\rafena.com\index.html'
$content = Get-Content $htmlPath -Raw

$folders = Get-ChildItem -Path 'C:\Users\pc\Downloads\rafena-landing' -Directory
foreach ($folder in $folders) {
    if ($folder.Name -ne 'rafena.com') {
        $escapedName = [regex]::Escape($folder.Name)
        $pattern = "src=`"$escapedName|href=`"$escapedName|url\($escapedName"
        $matches = [regex]::Matches($content, $pattern)
        Write-Output "Folder: $($folder.Name) - Matches: $($matches.Count)"
    }
}
