/**
 * Post-sign-in redirect targets.
 *
 * Only a same-origin relative path is ever returned. Everything else falls back
 * (default "/account"), and nothing here throws: NextAuth's default redirect
 * callback called `new URL()` on unparseable values and failed the sign-in
 * request with a 500.
 *
 * Accepted:
 *   - "/path?query#hash"            -> returned (normalized)
 *   - "https://<same origin>/path"  -> reduced to "/path"
 * Rejected (fallback):
 *   - empty, non-string
 *   - "//host" (protocol-relative)
 *   - any backslash (a browser reads "/\host" as "//host")
 *   - any whitespace or control character (browsers strip tab/newline, so
 *     "/<tab>/host" would otherwise become "//host")
 *   - any other scheme ("javascript:", "https://elsewhere")
 *   - anything that, resolved against the origin, changes the origin
 */

export const DEFAULT_REDIRECT_PATH = '/account';

const SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const WHITESPACE_OR_CONTROL = /[\s\x00-\x1f\x7f-\x9f]/;

export function safeRedirectPath(
  value: unknown,
  origin: string,
  fallback: string = DEFAULT_REDIRECT_PATH
): string {
  try {
    if (typeof value !== 'string' || value === '') return fallback;
    if (WHITESPACE_OR_CONTROL.test(value) || value.includes('\\')) return fallback;

    const base = new URL(origin);
    let candidate = value;

    // A same-origin absolute URL (NextAuth's client sends window.location.href
    // by default) is reduced to its path; any other absolute URL is rejected.
    if (SCHEME.test(candidate)) {
      const absolute = new URL(candidate);
      if (absolute.origin !== base.origin) return fallback;
      candidate = `${absolute.pathname}${absolute.search}${absolute.hash}`;
    }

    if (!candidate.startsWith('/') || candidate.startsWith('//')) return fallback;

    const resolved = new URL(candidate, base);
    if (resolved.origin !== base.origin) return fallback;
    const path = `${resolved.pathname}${resolved.search}${resolved.hash}`;
    return path.startsWith('//') ? fallback : path;
  } catch {
    return fallback;
  }
}
