$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot 'assets\brand-person.png'
$assetDirectory = Join-Path $projectRoot 'assets'

$source = [System.Drawing.Image]::FromFile($sourcePath)
try {
  $cropSize = [Math]::Min($source.Width, $source.Height)
  $sourceRectangle = [System.Drawing.Rectangle]::new(0, 0, $cropSize, $cropSize)

  foreach ($size in @(192, 512)) {
    $bitmap = [System.Drawing.Bitmap]::new($size, $size)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $targetRectangle = [System.Drawing.Rectangle]::new(0, 0, $size, $size)
        $graphics.DrawImage($source, $targetRectangle, $sourceRectangle, [System.Drawing.GraphicsUnit]::Pixel)
      }
      finally {
        $graphics.Dispose()
      }

      $outputPath = Join-Path $assetDirectory "favicon-$size.png"
      $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $bitmap.Dispose()
    }
  }
}
finally {
  $source.Dispose()
}

Write-Output 'Generated square 192px and 512px favicon assets.'
