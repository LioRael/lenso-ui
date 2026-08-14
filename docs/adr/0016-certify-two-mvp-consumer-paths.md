---
status: accepted
---

# Certify two MVP consumer paths

The MVP certifies package installation in Next App Router and registry installation in Vite. Pull requests run the package build, the Next documentation product, and one Chromium component-lab suite; release validation adds one minimal real-install smoke for each certified path. Those smoke projects are created in temporary CI directories from the release artifacts and are not retained as permanent repository fixtures. Other channel and framework combinations may work but remain explicitly uncertified until demand justifies expanding the support contract.
