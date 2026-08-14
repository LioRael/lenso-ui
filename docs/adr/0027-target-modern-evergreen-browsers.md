---
status: accepted
---

# Target modern evergreen browsers

Lenso UI targets modern evergreen browsers and Safari on currently supported Apple platforms. Internet Explorer and legacy browsers are outside the support contract. Release automation uses current Chromium as the primary browser gate; complex interactive families also receive periodic Safari with VoiceOver and Chromium with NVDA validation. Browser-specific defects add focused regression coverage when found instead of creating a broad permanently versioned browser matrix before evidence requires one.
