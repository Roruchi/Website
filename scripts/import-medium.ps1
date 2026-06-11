param(
  [string]$FeedUrl = "https://roelvanbergen.nl/feed",
  [string]$OutputDirectory = "src/blog"
)

$ErrorActionPreference = "Stop"

$descriptions = @{
  "fe41d94d5df6" = "Why constant context switching overheats our minds, degrades our code, and makes slowing down a practical engineering skill."
  "ea6984f21bc5" = "A manifesto for accelerated craftsmanship without surrendering judgment, care, or humanity to AI."
  "bccd43294de1" = "How I stopped fighting myself, accepted the mud, and found a more honest way to show up on stage."
  "5908ef3541bf" = "A year of journaling, showing myself, and choosing intention over hiding."
  "104b4b4a1ce6" = "Trying to find the middle way between complete control and completely letting go."
  "07e0e8cfa922" = "What happens when the same technology that helps us grow starts replacing the things that make us human?"
  "91ba1617a72b" = "A guide to making your AI collaboration intentional, personal, and human-enriching."
  "f765c90c67b7" = "How accessible web practices improve experiences for people, assistive technology, and AI agents alike."
  "1529f12d0891" = "Learning to recognize, challenge, and balance the inner critic with a more compassionate inner coach."
  "a30ef47c4d92" = "A personal reflection on perfectionism, awareness, and the first steps toward freedom."
}

$pillars = @{
  "fe41d94d5df6" = "engineering"
  "ea6984f21bc5" = "engineering"
  "bccd43294de1" = "zen"
  "5908ef3541bf" = "coaching"
  "104b4b4a1ce6" = "coaching"
  "07e0e8cfa922" = "engineering"
  "91ba1617a72b" = "engineering"
  "f765c90c67b7" = "engineering"
  "1529f12d0891" = "coaching"
  "a30ef47c4d92" = "zen"
}

function ConvertTo-YamlString([string]$value) {
  return "'" + $value.Replace("'", "''") + "'"
}

function Get-PostId([string]$url) {
  $match = [regex]::Match($url, "([a-f0-9]{12})($|\?)")
  if (-not $match.Success) {
    throw "Could not find a Medium post id in $url"
  }

  return $match.Groups[1].Value
}

function Get-Slug([string]$url) {
  $cleanUrl = $url -replace "\?.*$", ""
  return ([uri]$cleanUrl).Segments[-1].TrimEnd("/")
}

function Clean-MediumHtml([string]$html) {
  $clean = $html
  $clean = [regex]::Replace(
    $clean,
    '<img[^>]+src="https://medium\.com/_/stat\?[^"]+"[^>]*>',
    "",
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )
  $clean = [regex]::Replace(
    $clean,
    '<hr><p><a href="https://medium\.com/[^"]+">.*?was originally published.*?</p>\s*$',
    "",
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor
      [System.Text.RegularExpressions.RegexOptions]::Singleline
  )
  $clean = $clean -replace "https://roelvanbergen\.nl/([^""?#]+-[a-f0-9]{12})", "/blog/`$1/"
  return $clean.Trim()
}

$resolvedOutput = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputDirectory))
$resolvedRoot = [System.IO.Path]::GetFullPath((Get-Location))
if (-not $resolvedOutput.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Output directory must stay inside the repository: $resolvedOutput"
}

New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null

$response = Invoke-WebRequest -Uri $FeedUrl -UseBasicParsing -TimeoutSec 60
$document = New-Object System.Xml.XmlDocument
$document.LoadXml($response.Content)

$namespaces = New-Object System.Xml.XmlNamespaceManager($document.NameTable)
$namespaces.AddNamespace("content", "http://purl.org/rss/1.0/modules/content/")

$written = @()
foreach ($item in $document.SelectNodes("//item")) {
  $title = $item.SelectSingleNode("title").InnerText
  $published = [DateTimeOffset]::Parse($item.SelectSingleNode("pubDate").InnerText)
  $feedLink = $item.SelectSingleNode("link").InnerText
  $postId = Get-PostId $feedLink
  $slug = Get-Slug $feedLink
  $content = Clean-MediumHtml $item.SelectSingleNode("content:encoded", $namespaces).InnerText
  $cover = [regex]::Match($content, '<img[^>]+src="([^"]+)"').Groups[1].Value
  $tags = @($item.SelectNodes("category") | ForEach-Object { $_.InnerText })
  $originalUrl = $feedLink -replace "\?.*$", ""

  $frontMatter = @(
    "---"
    "title: $(ConvertTo-YamlString $title)"
    "date: $($published.ToString('yyyy-MM-dd'))"
    "description: $(ConvertTo-YamlString $descriptions[$postId])"
    "pillar: $($pillars[$postId])"
    "cover: $(ConvertTo-YamlString $cover)"
    "originalUrl: $(ConvertTo-YamlString $originalUrl)"
    "draft: false"
    "tags:"
    "  - post"
  )
  $frontMatter += $tags | ForEach-Object { "  - $_" }
  $frontMatter += "---"

  $output = ($frontMatter -join [Environment]::NewLine) +
    [Environment]::NewLine + [Environment]::NewLine +
    $content + [Environment]::NewLine

  $target = Join-Path $resolvedOutput "$slug.md"
  [System.IO.File]::WriteAllText($target, $output, [System.Text.UTF8Encoding]::new($false))
  $written += $target
}

Write-Host "Imported $($written.Count) posts from $FeedUrl"
$written | ForEach-Object { Write-Host " - $_" }
