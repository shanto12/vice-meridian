# Release Evidence

Verification matrix for the neon courier car release. Evidence surfaces refer to the
Netlify production deploy of this repository.

| Requirement | Evidence surface | Result | Notes |
| --- | --- | --- | --- |
| Source change is committed and traceable | Commit `a327d32645af342a32c7fb245661fe97f3e1eeee` ("Add playable neon courier car") on `origin/main` | PASS | Only `src/main.ts` modified; working tree clean before and after commit |
| Production deploy is live | Netlify deploy `6a8b1aa06e21fe377b6b794c` at https://vice-meridian.netlify.app/ | PASS | Deploy ID confirmed against the live site |
| Production build succeeds | `npm run build` (Vite) | PASS | No build errors or warnings blocking output |
| No whitespace errors in tracked changes | `git diff --check` | PASS | Clean output, no trailing whitespace or conflict markers |
| No known vulnerabilities in production dependencies | `npm audit --omit=dev` | PASS | 0 vulnerabilities reported |
| Site serves successfully over HTTPS | Live `GET /` at https://vice-meridian.netlify.app/ returned HTTP 200 | PASS | Root document reachable without redirects to error states |
| App bundle actually contains the new game code | Fetched live JS bundle; contains COURIER HUD/driving strings | PASS | Confirms deploy serves the updated bundle, not a stale one |
| Security headers present on responses | Live response headers include CSP, HSTS, `X-Content-Type-Options: nosniff`, Referrer-Policy, Permissions-Policy | PASS | All expected headers observed on the production origin |
| Core gameplay controls work in a real browser | Real Chrome desktop session: M (mute), F (fullscreen), Q/R exercised | PASS | No application console errors during interaction |
| Responsive layout on small viewport | Real Chrome at 390x844: no horizontal overflow, no errors | PASS | Layout contained within viewport width |
| Auth / backend / API integration | Static Vite site — no auth, backend, or API surface exists | Not applicable | Nothing to verify beyond static serving and headers |
| E key enter/exit vehicle behavior | Not exercised end-to-end in the real Chrome session | Not fully verified | Control implemented in code but not explicitly driven in the browser check |
| Space boost behavior | Not exercised end-to-end in the real Chrome session | Not fully verified | Control implemented in code but not explicitly driven in the browser check |
| Pushed branch matches verified commit | `git push origin main` succeeded; remote `main` matched `a327d32...` after push | PASS | Remote ref advanced from previous head to the evidence commit |

## Summary

All applicable release gates passed. Two gameplay inputs (E enter/exit, Space boost)
remain not fully verified in a real browser session and are flagged above rather than
assumed.
