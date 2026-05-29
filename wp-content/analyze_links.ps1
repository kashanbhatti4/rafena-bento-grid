$htmlPath = 'C:\Users\pc\Downloads\rafena-landing\rafena.com\index.html'
$content = Get-Content $htmlPath -Raw

# Find references to wp-content and wp-includes
$wpContentMatches = [regex]::Matches($content, 'wp-content')
$wpIncludesMatches = [regex]::Matches($content, 'wp-includes')
$rafenaComMatches = [regex]::Matches($content, 'rafena\.com')

Write-Output "wp-content matches: $($wpContentMatches.Count)"
Write-Output "wp-includes matches: $($wpIncludesMatches.Count)"
Write-Output "rafena.com matches: $($rafenaComMatches.Count)"

# Let's inspect some of these links to see if they contain the full domain or relative paths
$matches = [regex]::Matches($content, 'href="[^"]+"')
$relativeCount = 0
$absoluteCount = 0
foreach ($m in $matches) {
    $val = $m.Value
    if ($val -like '*http://*' -or $val -like '*https://*') {
        $absoluteCount++
    } else {
        $relativeCount++
    }
}
Write-Output "href Absolute: $absoluteCount, Relative: $relativeCount"

$srcMatches = [regex]::Matches($content, 'src="[^"]+"')
$srcRelativeCount = 0
$srcAbsoluteCount = 0
foreach ($m in $srcMatches) {
    $val = $m.Value
    if ($val -like '*http://*' -or $val -like '*https://*') {
        $srcAbsoluteCount++
    } else {
        $srcRelativeCount++
    }
}
Write-Output "src Absolute: $srcAbsoluteCount, Relative: $srcRelativeCount"
