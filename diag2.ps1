$ErrorActionPreference = 'Continue'
$pidList = 61540, 101568, 61280, 18712, 103816, 96872, 80092, 105908, 105440, 105072, 14888, 146452, 102732, 102504, 95884, 100372

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
  $h = [Diag.Proc]::OpenProcess(0x0410, $false, $ProcId)
  if ($h -eq [IntPtr]::Zero) { return '<OpenProcess denied>' }
  try {
    $wow = $false
    [void][Diag.Proc]::IsWow64Process($h, [ref]$wow)
    if ($wow) { return '<WOW64>' }
    $basic = [System.Runtime.InteropServices.Marshal]::AllocHGlobal(48)
    try {
      $rl = 0
      if ([Diag.Proc]::NtQueryInformationProcess($h, 0, $basic, 48, [ref]$rl) -ne 0) { return '<query failed>' }
      $peb = [System.Runtime.InteropServices.Marshal]::ReadIntPtr($basic, 8)
      $read = 0
      $b1 = New-Object byte[] 8
      if (-not [Diag.Proc]::ReadProcessMemory($h, [IntPtr]($peb.ToInt64() + 0x20), $b1, 8, [ref]$read)) { return '<read1 failed>' }
      $params = [BitConverter]::ToInt64($b1, 0)
      $b2 = New-Object byte[] 16
      if (-not [Diag.Proc]::ReadProcessMemory($h, [IntPtr]($params + 0x38), $b2, 16, [ref]$read)) { return '<read2 failed>' }
      $len = [BitConverter]::ToUInt16($b2, 0)
      $ptr = [BitConverter]::ToInt64($b2, 8)
      $b3 = New-Object byte[] $len
      if (-not [Diag.Proc]::ReadProcessMemory($h, [IntPtr]$ptr, $b3, $len, [ref]$read)) { return '<read3 failed>' }
      return [System.Text.Encoding]::Unicode.GetString($b3)
    } finally { [System.Runtime.InteropServices.Marshal]::FreeHGlobal($basic) }
  } finally { [void][Diag.Proc]::CloseHandle($h) }
}

foreach ($i in $pidList) {
  $p = Get-CimInstance Win32_Process -Filter "ProcessId=$i" -ErrorAction SilentlyContinue
  if (-not $p) { Write-Output ("PID={0} GONE" -f $i); continue }
  $cmd = if ($p.CommandLine) { $p.CommandLine } else { '' }
  if ($cmd.Length -gt 90) { $cmd = $cmd.Substring(0, 90) }
  Write-Output ("PID={0} NAME={1} CWD={2} CMD={3}" -f $i, $p.Name, (Get-ProcCwd -ProcId $i), $cmd)
}
