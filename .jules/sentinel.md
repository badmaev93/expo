## YYYY-MM-DD - XSS Vulnerability in Link/Hero URLs
**Vulnerability:** URLs provided in user configurations (`LinkWidget`, `HeroWidget`) are rendered directly into `href` or `window.open`, leading to potential Cross-Site Scripting (XSS) via `javascript:`, `vbscript:`, or `data:` schemes.
**Learning:** React protects against XSS in text, but attributes like `href` or dynamic calls to `window.open` require explicit URL scheme sanitization.
**Prevention:** Always validate and sanitize URLs before using them in anchor tags or programmatic navigations.
