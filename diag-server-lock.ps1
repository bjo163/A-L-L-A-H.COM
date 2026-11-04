# Diagnostic only: finds processes that can lock a folder (CWD / cmdline / exe path).
# Read-only: no process is killed, nothing is deleted.
$ErrorActionPreference = 'Continue'
$target = 'Z:\project\rocksoul-dx\apps\server'
$tn = $target.TrimEnd('\').ToLowerInvariant()

Add-Type -Namespace Diag -Name Proc -MemberDefinition @'
[DllImport("kernel32.dll", SetLastError=true)]
public static extern IntPtr OpenProcess(int access, bool inherit, int pid);

[DllImport("kernel32.dll", SetLastError=true)]
[return: MarshalAs(UnmanagedType.Bool)]
public static extern bool CloseHandle(IntPtr h);

[DllImport("kernel32.dll", SetLastError=true)]
public static extern bool IsWow64Process(IntPtr h, out bool wow64);

[DllImport("kernel32.dll", SetLastError=true)]
public static extern bool ReadProcessMemory(IntPtr h, IntPtr baseAddr, byte[] buf, int size, out int read);

[DllImport("ntdll.dll")]
public static extern int NtQueryInformationProcess(IntPtr h, int infoClass, IntPtr buf, int len, out int retLen);
'@

function Get-ProcCwd {
  param([int]$ProcId)
  $h = [Diag.Proc]::OpenProcess(0x0410, $false, $ProcId)          # QUERY_INFORMATION | VM_READ
  if ($h -eq [IntPtr]::Zero) { $h = [Diag.Proc]::OpenProcess(0x1010, $false, $ProcId) }  # QUERY_LIMITED | VM_READ
  if ($h -eq [IntPtr]::Zero) {
    $werr = [System.Runtime.InteropServices.Marshal]::GetLastWin32Error()
    return @{ Ok = $false; Err = "OpenProcess failed ($werr)" }
  }
  try {
    $wow = $false
    [void][Diag.Proc]::IsWow64Process($h, [ref]$wow)
    if ($wow) { return @{ Ok = $false; Err = '32-bit (WOW64) process - PEB offsets not probed' } }

    $basic = [System.Runtime.InteropServices.Marshal]::AllocHGlobal(48)
    try {
      $retLen = 0
      $st = [Diag.Proc]::NtQueryInformationProcess($h, 0, $basic, 48, [ref]$retLen)
      if ($st -ne 0) { return @{ Ok = $false; Err = ("NtQueryInformationProcess status 0x{0:X}" -f $st) } }
      $peb = [System.Runtime.InteropServices.Marshal]::ReadIntPtr($basic, 8)
      if ($peb -eq [IntPtr]::Zero) { return @{ Ok = $false; Err = 'PEB null' } }

      $read = 0
      $b1 = New-Object byte[] 8
      if (-not [Diag.Proc]::ReadProcessMemory($h, [IntPtr]($peb.ToInt64() + 0x20), $b1, 8, [ref]$read)) {
        return @{ Ok = $false; Err = 'read ProcessParameters failed' }
      }
      $params = [BitConverter]::ToInt64($b1, 0)

      $b2 = New-Object byte[] 16   # UNICODE_STRING CurDir.DosPath at params+0x38 (x64)
      if (-not [Diag.Proc]::ReadProcessMemory($h, [IntPtr]($params + 0x38), $b2, 16, [ref]$read)) {
        return @{ Ok = $false; Err = 'read CurrentDirectory failed' }
      }
      $len = [BitConverter]::ToUInt16($b2, 0)
      $ptr = [BitConverter]::ToInt64($b2, 8)
      if ($len -le 0 -or $ptr -eq 0) { return @{ Ok = $false; Err = 'empty CurDir' } }

      $b3 = New-Object byte[] $len
      if (-not [Diag.Proc]::ReadProcessMemory($h, [IntPtr]$ptr, $b3, $len, [ref]$read)) {
        return @{ Ok = $false; Err = 'read CurDir string failed' }
      }
      return @{ Ok = $true; Cwd = [System.Text.Encoding]::Unicode.GetString($b3) }
    } finally { [System.Runtime.InteropServices.Marshal]::FreeHGlobal($basic) }
  } catch {
    return @{ Ok = $false; Err = $_.Exception.Message }
  } finally {
    [void][Diag.Proc]::CloseHandle($h)
  }
}

$procs = Get-CimInstance Win32_Process
$byPid = @{}
foreach ($p in $procs) { $byPid[[int]$p.ProcessId] = $p }

function Get-Chain {
  param([int]$ProcId)
  $parts = @(); $cur = $ProcId; $depth = 0
  while ($cur -and $depth -lt 8 -and $byPid.ContainsKey($cur)) {
    $pp = $byPid[$cur]
    $parts += ("{0}({1})" -f $pp.Name, $pp.ProcessId)
    $cur = [int]$pp.ParentProcessId; $depth++
  }
  $parts -join ' <- '
}

$hits = @()
$unreadable = 0
foreach ($p in $procs) {
  $pidV = [int]$p.ProcessId
  $cl = if ($p.CommandLine) { $p.CommandLine } else { '' }
  $exe = if ($p.ExecutablePath) { $p.ExecutablePath } else { '' }

  $why = @()
  if ($cl -match 'apps\\server' -or $cl -match 'apps/server') { $why += 'CMDLINE' }
  if ($exe -like '*apps\server*') { $why += 'EXE-PATH' }
  if ($cl -match [regex]::Escape($target) -or $exe -like "*$target*") { $why += 'FULL-PATH' }

  $cwdInfo = Get-ProcCwd -ProcId $pidV
  if (-not $cwdInfo.Ok) { $unreadable++ }
  $cwd = if ($cwdInfo.Cwd) { $cwdInfo.Cwd.TrimEnd('\').ToLowerInvariant() } else { '' }
  if ($cwd) {
    if ($cwd -eq $tn) { $why += 'CWD-IS-TARGET' }
    elseif ($cwd.StartsWith("$tn\")) { $why += 'CWD-INSIDE-TARGET' }
  }

  if ($why.Count -gt 0) {
    $hits += [pscustomobject]@{
      Pid      = $pidV
      Ppid     = [int]$p.ParentProcessId
      Name     = $p.Name
      Why      = ($why -join ',')
      Cwd      = $cwdInfo.Cwd
      CwdErr   = if ($cwdInfo.Ok) { '' } else { $cwdInfo.Err }
      Chain    = Get-Chain -ProcId $pidV
      Cmd      = if ($cl.Length -gt 160) { $cl.Substring(0, 160) } else { $cl }
    }
  }
}

Write-Output "TARGET=$target"
Write-Output ("TARGET_EXISTS={0}" -f (Test-Path -LiteralPath $target))
$kids = @()
if (Test-Path -LiteralPath $target) { $kids = @(Get-ChildItem -Force -LiteralPath $target -ErrorAction SilentlyContinue) }
Write-Output ("TARGET_CHILDREN={0}" -f $kids.Count)
Write-Output ("PROCESSES_SCANNED={0}  CWD_UNREADABLE={1}" -f $procs.Count, $unreadable)
Write-Output ("PS_BITS={0}" -f [Environment]::Is64BitProcess)
Write-Output "---- SUSPECTS ----"
if ($hits.Count -eq 0) { Write-Output "NONE" }
foreach ($h in ($hits | Sort-Object Pid)) {
  Write-Output ("PID={0} PPID={1} NAME={2} WHY={3}" -f $h.Pid, $h.Ppid, $h.Name, $h.Why)
  Write-Output ("    CWD={0}" -f $(if ($h.Cwd) { $h.Cwd } else { "<unavailable: $($h.CwdErr)>" }))
  Write-Output ("    TREE={0}" -f $h.Chain)
  if ($h.Cmd) { Write-Output ("    CMD={0}" -f $h.Cmd) }
}
Write-Output "---- SHELL/TERMINAL HOSTS (all conhost + powershell + wt + node) ----"
foreach ($p in ($procs | Where-Object { $_.Name -in 'conhost.exe', 'powershell.exe', 'pwsh.exe', 'WindowsTerminal.exe', 'node.exe', 'cmd.exe' } | Sort-Object Name, ProcessId)) {
  $c = Get-ProcCwd -ProcId ([int]$p.ProcessId)
  Write-Output ("PID={0} NAME={1} CWD={2}" -f $p.ProcessId, $p.Name, $(if ($c.Ok) { $c.Cwd } else { "<err: $($c.Err)>" }))
}
