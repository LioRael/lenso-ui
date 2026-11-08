# Physical iOS control reference

This development-only UIKit app contains synthetic rows and a numeric wheel.
It switches between standard UITableView/UIPickerView controls and the Lenso
fixture in WKWebView. No action deletes user data; action handlers only increment
demo counters. It is not a distributable app or production network configuration.

Start the source preview from the workspace root:

```sh
bun run dev:docs
```

For LAN device comparison, stop only that owned preview, then run
`bun run --filter @lenso/ui-docs test:ios-controls-preview`. The dedicated server
uses the existing docs Vite/StyleX configuration with HMR, adds only the test HTML
route and binds port 4311 to the LAN. Open `/test/ios-controls.html` on the Mac's
LAN address; `panel=swipe`, `panel=wheel`, `theme=dark` and `debug=1` are optional.
Pointer telemetry is disabled by default. Stop this owned server after testing.

Copy `Probe.swift` and `project.yml` into an isolated temporary build directory,
generate with XcodeGen and build the IOSControlsProbe scheme for the selected
physical device. Supply the existing development team and
`LENSO_PREVIEW_URL=http://<mac-lan-address>:4311/test/ios-controls.html` as build
settings. The generated Info.plist enables local HTTP only for this test app.
Use the task's phone tooling to install and launch `local.lenso.IOSControlsProbe`.
The app must be checked on the physical device; a successful build is not UI proof.

Native wheel defaults: 60 values, initial selection 15, 240×216pt picker frame,
standard system row rendering. Native swipe defaults: three 68pt subtitle rows,
leading Archive with full swipe, trailing More/Delete without full swipe. Theme
and implementation switches let the same device show matched states. Reset
restores demo counters and selection. Web reveal buttons remain visible for
keyboard access, and standalone Web rows retain independent state.
