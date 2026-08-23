# Release Evidence

Verification matrix for the courier-contract release. Evidence surfaces refer to the
Netlify production deploy of this repository.

| Requirement | Evidence surface | Result | Notes |
| --- | --- | --- | --- |
| Source change is committed and traceable | Commit `c292cc88f66020be4b099b0a9a0b5a2e98225599` ("Add courier contract rewards") on `origin/main` | PASS | Only `src/main.ts` modified; working tree clean |
| Production deploy is live | Netlify deploy `6a8b2320fc9c88d2eae8e7a2` at https://vice-meridian.netlify.app/ | PASS | Deploy ID confirmed against the live site |
| Production build succeeds | `npm run build` (Vite) | PASS | No build errors blocking output |
| No whitespace errors in tracked changes | `git diff --check` | PASS | Clean output, no trailing whitespace or conflict markers |
| No known vulnerabilities in production dependencies | `npm audit` | PASS | 0 vulnerabilities reported |
| Site serves successfully over HTTPS | Live `GET /` at https://vice-meridian.netlify.app/ returned HTTP 200 | PASS | Root document reachable without redirects to error states |
| App bundle actually contains the new courier contract code | Fetched live JS bundle; contains "COURIER RUN // REACH SKYWAY DROP-OFF", "COURIER RUN // DELIVERED +$250 // REP +1", and "DROP-OFF" strings | PASS | Confirms deploy serves the updated bundle, not a stale one |
| Security headers present on responses | Live response headers include CSP, HSTS, `X-Content-Type-Options: nosniff`, Referrer-Policy, Permissions-Policy | PASS | All expected headers observed on the production origin |
| Core gameplay controls work in a real browser | Real Chrome desktop session at 1440x604: M (map open/close), F (pulse), Q (jammer), R (reset) exercised | PASS | Only console error was an unrelated `chrome-extension://` message; no application errors during interaction |
| Responsive layout on small viewport | Real Chrome at 390x844: no horizontal overflow | PASS | Layout contained within viewport width |
| Auth / backend / API integration | Static Vite site — no auth, backend, or API surface exists | Not applicable | Nothing to verify beyond static serving and headers |
| E key enter/exit vehicle behavior | Not exercised end-to-end in the real Chrome session | Not fully verified | Control implemented in code but not explicitly driven end-to-end in the browser check |
| Space boost behavior | Not exercised end-to-end in the real Chrome session | Not fully verified | Control implemented in code but not explicitly driven end-to-end in the browser check |

## Summary

All applicable release gates passed. Two gameplay inputs (E enter/exit, Space boost)
remain not fully verified in a real browser session and are flagged above rather than
assumed.
