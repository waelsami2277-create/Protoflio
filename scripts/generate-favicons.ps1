$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot 'assets\brand-person.png'
$assetDirectory = Join-Path $projectRoot 'assets'

$source = [System.Drawing.Image]::FromFile($sourcePath)
try {
  $sourceRectangle = [System.Drawing.Rectangle]::new(0, 0, $source.Width, $source.Height)

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
        $targetHeight = $size
        $targetWidth = [Math]::Round($source.Width * ($targetHeight / $source.Height))
        $targetX = [Math]::Floor(($size - $targetWidth) / 2)
        $targetRectangle = [System.Drawing.Rectangle]::new($targetX, 0, $targetWidth, $targetHeight)
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

Write-Output 'Generated square 192px and 512px favicon assets with the complete portrait visible.'
