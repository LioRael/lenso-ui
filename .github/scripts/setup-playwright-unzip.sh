#!/usr/bin/env bash
set -euo pipefail

# The Playwright image lacks the unzip used by setup-bun and documentation restore.
curl --fail --silent --show-error --location --retry 3 --retry-all-errors --max-time 30 \
  https://snapshot.ubuntu.com/ubuntu/20260601T000000Z/pool/main/u/unzip/unzip_6.0-29ubuntu1_amd64.deb \
  --output "$RUNNER_TEMP/unzip.deb"
printf '%s  %s\n' 1f6f2bdcde84641e89c9367a7a99d90e990efa3e487a8d625241c2f9c55db5f4 "$RUNNER_TEMP/unzip.deb" | sha256sum --check
dpkg-deb --extract "$RUNNER_TEMP/unzip.deb" "$RUNNER_TEMP/unzip"
"$RUNNER_TEMP/unzip/usr/bin/unzip" -v
echo "$RUNNER_TEMP/unzip/usr/bin" >> "$GITHUB_PATH"
