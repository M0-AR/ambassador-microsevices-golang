#!/usr/bin/env python3
"""Check local links and asset references in the static demo."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
FILES = [ROOT / "preview.html", *sorted(DOCS.rglob("*.html"))]

ATTR_RE = re.compile(r'(?:href|src|data-src)\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE)
ID_RE = re.compile(r'\bid\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE)
SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "javascript:", "data:", "//")
SITE_PREFIX = "/ambassador-microsevices-golang/"


def is_skipped(value: str) -> bool:
    return not value or value.startswith(SKIP_PREFIXES)


def main() -> int:
    missing: list[str] = []
    checked = 0

    for page in FILES:
        if not page.exists():
            missing.append(f"{page.relative_to(ROOT)}: file does not exist")
            continue

        text = page.read_text(encoding="utf-8")
        ids = set(ID_RE.findall(text))

        for raw in ATTR_RE.findall(text):
            value = raw.strip()
            if is_skipped(value):
                continue

            base = page.parent
            if value.startswith("/"):
                if not value.startswith(SITE_PREFIX):
                    continue
                base = DOCS
                value = value[len(SITE_PREFIX):] or "index.html"

            if value.startswith("#"):
                if unquote(value[1:]) not in ids:
                    missing.append(f"{page.relative_to(ROOT)}: missing anchor {value}")
                continue

            target_part = unquote(value.split("#", 1)[0].split("?", 1)[0])
            if not target_part:
                continue

            target = (base / target_part).resolve()
            checked += 1
            if not target.exists():
                missing.append(f"{page.relative_to(ROOT)}: missing {value}")
            elif target.is_dir() and not (target / "index.html").exists():
                missing.append(f"{page.relative_to(ROOT)}: directory without index.html {value}")

    if missing:
        print("Broken local references:")
        for item in missing:
            print(f"  - {item}")
        return 1

    print(f"OK: checked {checked} local references across {len(FILES)} HTML files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
