## YYYY-MM-DD - XSS Vulnerability in Link/Hero URLs
**Vulnerability:** URLs provided in user configurations (`LinkWidget`, `HeroWidget`) are rendered directly into `href` or `window.open`, leading to potential Cross-Site Scripting (XSS) via `javascript:`, `vbscript:`, or `data:` schemes.
**Learning:** React protects against XSS in text, but attributes like `href` or dynamic calls to `window.open` require explicit URL scheme sanitization.
**Prevention:** Always validate and sanitize URLs before using them in anchor tags or programmatic navigations.

## 2024-11-11 - Insecure Topic Generation (Secret Key)
**Vulnerability:** Weak random topic generation using `Math.random()` in `Notifications.jsx`, which acts as a secret key on the public `ntfy.sh` server.
**Learning:** `Math.random()` is not cryptographically secure and its outputs can be predicted or brute-forced, exposing the topic to unauthorized entities. Additionally, `crypto.randomUUID()` cannot be used safely everywhere since it requires a secure context (HTTPS/localhost), and the app may run on HTTP LAN contexts.
**Prevention:** Use `crypto.getRandomValues()` to generate cryptographically secure random values which is compatible across non-secure contexts.
