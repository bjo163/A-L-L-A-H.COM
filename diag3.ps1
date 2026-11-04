$ErrorActionPreference = 'Continue'
$req = "GET /_ping HTTP/1.1`r`nHost: localhost`r`nConnection: close`r`n`r`n"
$pipe = New-Object System.IO.Pipes.NamedPipeClientStream('.', 'docker_engine', [System.IO.Pipes.PipeDirection]::InOut)
$sw = [System.Diagnostics.Stopwatch]::StartNew()
try {
  $pipe.Connect(4000)
  $w = New-Object System.IO.StreamWriter($pipe)
  $w.Write($req); $w.Flush()
  $buf = New-Object byte[] 512
  $ar = $pipe.BeginRead($buf, 0, $buf.Length, $null, $null)
  $done = $ar.AsyncWaitHandle.WaitOne(6000, $false)
  if ($done) {
    $n = $pipe.EndRead($ar)
    $txt = [System.Text.Encoding]::ASCII.GetString($buf, 0, $n)
    Write-Output ("PING_RESPONDED ms={0} bytes={1} body={2}" -f $sw.ElapsedMilliseconds, $n, $txt.Substring(0, [Math]::Min(120, $txt.Length)).Replace("`r", '\r').Replace("`n", '\n'))
  } else {
    Write-Output ("PING_TIMED_OUT ms={0} (pipe connected, daemon never answered)" -f $sw.ElapsedMilliseconds)
  }
} catch {
  Write-Output ("PIPE_ERROR {0}" -f $_.Exception.Message)
} finally {
  $pipe.Dispose()
}
