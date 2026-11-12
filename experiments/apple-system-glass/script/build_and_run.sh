#!/usr/bin/env bash
set -euo pipefail
PROBE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROBE_APP="$PROBE_ROOT/dist/LensoGlassProbe.app"
MODE="${1:-run}"
case "$MODE" in run|--build-only|--verify) ;; *) echo "usage: $0 [run|--build-only|--verify]" >&2; exit 2 ;; esac
pkill -x LensoGlassProbe >/dev/null 2>&1 || true
mkdir -p "$PROBE_APP/Contents/MacOS" "$PROBE_APP/Contents/Resources"
xcrun swiftc -module-cache-path /tmp/lenso-glass-module-cache "$PROBE_ROOT/App.swift" -o "$PROBE_APP/Contents/MacOS/LensoGlassProbe"
cp "$PROBE_ROOT/probe.html" "$PROBE_APP/Contents/Resources/probe.html"
cat > "$PROBE_APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>LensoGlassProbe</string>
<key>CFBundleIdentifier</key><string>dev.lenso.system-glass-probe</string>
<key>CFBundleName</key><string>LensoGlassProbe</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>LSMinimumSystemVersion</key><string>14.0</string>
<key>NSPrincipalClass</key><string>NSApplication</string>
</dict></plist>
PLIST
if [[ "$MODE" != --build-only ]]; then
  /usr/bin/open -n "$PROBE_APP"
  if [[ "$MODE" == --verify ]]; then
    sleep 1
    pgrep -x LensoGlassProbe >/dev/null
  fi
fi
