---
status: accepted
---

# Publish through npm trusted publishing

Official npm releases run only from the designated GitHub Actions workflow through npm Trusted Publishing with OIDC and provenance. Local workflows may build, pack, inspect, and install tarballs but do not publish an official version. A protected GitHub Environment provides the manual control point for stable releases and emergency releases without introducing a long-lived npm write token.
