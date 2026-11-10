# Native foundation evidence — 2026-11-10

Historical observations of the actual Expo development application, not full-library
acceptance. [Delivery report](../../native-foundation-2026-11-10.md) describes scope,
migration and remaining gaps. Large binaries and full original logs remain ignored.

- [iOS coverage and exclusions](ios/README.md): scoped field/action acceptance,
  native ref and caller focus styling, safe areas, keyboard viewport and light/dark.
  `partial-final6` stopped on a driver selector and is not an overall passing test.
- [Final iOS regression](ios/delivery-regression/README.md): one passing scenario,
  zero failures after the final callback change; accepts/rejects group, segmented,
  Stepper, Glass Switch and Slider proposals. Installed app and runner hashes match.
- [Appearance and held-search run](ios/remaining-final/remaining1.log): two passing
  scenarios. Raw named screenshots and accessibility trees are retained.
- Android records describe a separate Android 14 Pixel 3a emulator cohort; see
  `android/README.md`. Neither platform establishes physical-device, screen-reader,
  Release, old-OS or performance acceptance.
- [Source/build hashes](source-and-build-hashes.json) bind the runtime source and
  full original build logs. Compact success logs are in `build-tools/`; final
  static checks and Hermes exports are in `checks/`. JS exports do not prove native
  linkage. Source hashes refer to pre-archive source bytes.

QA scripts retain historical machine paths/device IDs. Adapt them to the actual
host before reuse; these are investigation evidence, not portable CI entrypoints.
Raw captures are intentionally preserved. The archive manifest binds retained bytes.
