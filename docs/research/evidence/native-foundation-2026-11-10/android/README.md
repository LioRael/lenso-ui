# Android native catalog receipt

Actual `dev.lenso.nativeexample` development application on Pixel 3a / Android 14
emulator, connected to this checkout's Metro on port 8085. The full arm64 native
Debug build executed 353 tasks; installed and built APK SHA256 match in
[installed-provenance.json](installed-provenance.json).

The final post-callback-change cohort passed all 26 assertions.
The final historical driver operates actual UI nodes and records both owner labels
and native state. It covers action count, disabled/loading, single/multiline edits,
search submission, readonly/disabled fields, group selection, controlled rejection,
segmented disabled choice, Stepper bounds, inherited disabled flags, dark appearance,
caller StyleX and returning to Glass. See `results.json` and `acceptance.log`.

The first 26-assertion cohort passed before the final callback stabilization.
An intermediate repeat stopped because it assumed Name stayed AdaX after injecting
keys while testing noneditable fields: Android can retain the previous field's focus.
The final driver captures the actual owner/native Name value before holding it,
then verifies it rejects a new proposal. That stopped repeat is not counted as a
passing scenario or diagnosed as a product text-input regression.

Raw screenshots and native accessibility XML are explicit historical evidence.
The developer Tools overlay belongs to Expo. Release builds, physical devices,
TalkBack, IME composition/clipboard, large text, locales, performance and the
remaining component/API scope are not accepted by this cohort.
