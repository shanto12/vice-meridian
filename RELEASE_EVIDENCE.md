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

---

# Safehouse Heat Recovery — Release Evidence (2026-08-23)

Verification matrix for the safehouse heat-recovery release. Evidence surfaces refer to
the Netlify production deploy of this repository.

| Requirement | Evidence surface | Result | Notes |
| --- | --- | --- | --- |
| Source change is committed and traceable | Commit `90fe5ae9780d36d83d807b66ac26984178360607` ("Add safehouse heat recovery") on `origin/main` | PASS | Only `src/main.ts` modified; working tree clean after push |
| Production deploy is live | Netlify deploy `6a8b2934126dab3c20fa4050` at https://vice-meridian.netlify.app/ | PASS | Deploy ID confirmed against the live site |
| Production build succeeds | `npm run build` (tsc + Vite) | PASS | No type or build errors blocking output |
| No whitespace errors in tracked changes | `git diff --check` | PASS | Clean output, no trailing whitespace or conflict markers |
| No known vulnerabilities in production dependencies | `npm audit --omit=dev` | PASS | 0 vulnerabilities reported for the production dependency tree |
| App bundle contains the safehouse feature strings | Fetched live JS bundle; contains "SAFEHOUSE", "SAFEHOUSE // HOLD H TO CLEAR HEAT", "SAFEHOUSE // HEAT CLEARED", "COURIER RUN", and "DROP-OFF" strings | PASS | Confirms the deploy serves the updated bundle, not a stale one; courier contract strings still present alongside the new safehouse code |
| Security headers present on responses | Live response headers include CSP, Permissions-Policy, Referrer-Policy, HSTS, and `X-Content-Type-Options` | PASS | All expected headers observed on the production origin |
| Core gameplay controls work in a real browser | Real Chrome profile desktop session at 1440x604: page loaded; M (map open/close), F (pulse), Q (jammer), R (reset) manually exercised | PASS | No application console errors during interaction |
| Responsive layout on small viewport | Real Chrome mobile session at 390x844: page loaded, scrollWidth measured at 390 | PASS | No horizontal overflow; layout contained within viewport width |
| Safehouse H-in-zone heat-clear path | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | H keypress while standing inside the safehouse ring shipped but was not driven end-to-end in this pass |
| Courier E enter/exit + Space boost path | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | Controls implemented in code but not explicitly driven end-to-end in this pass |
| Auth / backend / API integration | Static Vite site — no auth, backend, or API surface exists | Not applicable | Nothing to verify beyond static serving and headers |

## Summary

Build, audit, bundle-content, header, desktop-interaction, and mobile-layout gates passed.
The safehouse H-in-zone heat-clear end-to-end path and the courier E/Space paths were NOT
fully verified in this pass and are flagged above rather than assumed.

---

# Police Response — Release Evidence (2026-08-23)

Verification matrix for the police-scan feedback release. Evidence surfaces refer to
the Netlify production deploy of this repository.

| Requirement | Evidence surface | Result | Notes |
| --- | --- | --- | --- |
| Source change is committed and traceable | Commit `8f2dd8d75d715756555abce8d63c472bd78` ("Add police scan feedback") on `origin/main` | PASS | Only `src/main.ts` modified; working tree clean after push |
| Production deploy is live | Netlify deploy `6a8b2b92c99824a738697fcc` at https://vice-meridian.netlify.app/ | PASS | Deploy ID confirmed against the live site |
| Production build succeeds | `npm run build` (tsc + Vite) | PASS | No type or build errors blocking output |
| No whitespace errors in tracked changes | `git diff --check` | PASS | Clean output, no trailing whitespace or conflict markers |
| No known vulnerabilities in production dependencies | `npm audit --omit=dev` | PASS | 0 vulnerabilities reported for the production dependency tree |
| App bundle contains the police scan strings plus prior feature strings | Fetched live JS bundle; contains "POLICE SCAN", "SAFEHOUSE", "SAFEHOUSE // HOLD H TO CLEAR HEAT", "SAFEHOUSE // HEAT CLEARED", "COURIER RUN // REACH SKYWAY DROP-OFF", "COURIER RUN // DELIVERED +$250 // REP +1", and "DROP-OFF" strings | PASS | Confirms the deploy serves the updated bundle; safehouse and courier contract strings remain intact alongside the new scan code |
| Security headers present on responses | Live response headers include CSP, Permissions-Policy, Referrer-Policy, HSTS, and `X-Content-Type-Options` | PASS | All expected headers observed on the production origin |
| Core gameplay controls work in a real browser | Real Chrome profile desktop session at 1440x604: page loaded; M (map open/close), F (pulse), Q (jammer), R (reset) manually exercised | PASS | Zero application console errors during interaction |
| Responsive layout on small viewport | Real Chrome mobile session at 390x844: page loaded, scrollWidth measured at 390 | PASS | No horizontal overflow; layout contained within viewport width |
| Police scan wanted-state end-to-end path | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | HUD distance readout and red search ring under live wanted state shipped but were not driven end-to-end in this pass |
| Safehouse H-in-zone heat-clear path | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | H keypress while standing inside the safehouse ring was not driven end-to-end in this pass |
| Courier E enter/exit + Space boost path | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | Controls implemented in code but not explicitly driven end-to-end in this pass |
| Auth / backend / API integration | Static Vite site — no auth, backend, or API surface exists | Not applicable | Nothing to verify beyond static serving and headers |

## Summary

Build, audit, bundle-content, header, desktop-interaction, and mobile-layout gates passed.
The police scan wanted-state path, safehouse H-in-zone path, and courier E/Space paths
were NOT fully verified in this pass and are flagged above rather than assumed.

---

# Wallet HUD — Release Evidence (2026-08-23)

Verification matrix for the wallet-HUD release. Evidence surfaces refer to
the Netlify production deploy of this repository.

| Requirement | Evidence surface | Result | Notes |
| --- | --- | --- | --- |
| Source change is committed and traceable | Commit `3f7863bee3edb5ccfc59c8130c1364dfe1557566` ("Add visible wallet HUD") on `origin/main` | PASS | Only `src/main.ts` modified; working tree clean after push |
| Production deploy is live | Netlify deploy `6a8b2dca3d5e25bcfb64d451` at https://vice-meridian.netlify.app/ | PASS | Deploy ID confirmed against the live site |
| Production build succeeds | `npm run build` (tsc + Vite) | PASS | No type or build errors blocking output |
| No whitespace errors in tracked changes | `git diff --check` | PASS | Clean output, no trailing whitespace or conflict markers |
| No known vulnerabilities in production dependencies | `npm audit --omit=dev` | PASS | 0 vulnerabilities reported for the production dependency tree |
| App bundle contains the wallet strings plus prior feature strings | Fetched live JS bundle; contains wallet "CASH $" and "REP" template strings plus "POLICE SCAN", "SAFEHOUSE", "COURIER RUN // REACH SKYWAY DROP-OFF", "COURIER RUN // DELIVERED +$250 // REP +1", and "DROP-OFF" strings | PASS | Confirms the deploy serves the updated bundle; police scan, safehouse, and courier contract strings remain intact alongside the new wallet code |
| Security headers present on responses | Live response headers include CSP, Permissions-Policy, Referrer-Policy, HSTS, and `X-Content-Type-Options` | PASS | All expected headers observed on the production origin |
| Wallet HUD renders in a real browser | Real Chrome profile desktop session at 1440x604: page loaded; `#hud-wallet` visible reading "CASH $0 // REP 0" | PASS | Initial values match the reset run state |
| Core gameplay controls work in a real browser | Same desktop session at 1440x604: M (map open/close), F (pulse), Q (jammer), R (reset) smoke-exercised | PASS | Zero application console errors during interaction |
| Responsive layout on small viewport | Real Chrome mobile session at 390x844: page loaded, wallet line visible, scrollWidth measured at 390 | PASS | No horizontal overflow; layout contained within viewport width |
| Courier reward delivery reflected end-to-end (+$250 / REP +1 on live site) | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | Delivery updates cash/rep in code but the full drive-deliver loop was not driven on the live deploy in this pass |
| Police scan wanted-state end-to-end path | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | HUD distance readout and red search ring under live wanted state shipped but were not driven end-to-end in this pass |
| Safehouse H-in-zone heat-clear path | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | H keypress while standing inside the safehouse ring was not driven end-to-end in this pass |
| Courier E enter/exit + Space boost path | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | Controls implemented in code but not explicitly driven end-to-end in this pass |
| Auth / backend / API integration | Static Vite site — no auth, backend, or API surface exists | Not applicable | Nothing to verify beyond static serving and headers |

## Summary

Build, audit, bundle-content, header, wallet-visibility, desktop-interaction, and
mobile-layout gates passed. The courier reward delivery loop, police scan wanted-state
path, safehouse H-in-zone path, and courier E/Space paths were NOT fully verified in
this pass and are flagged above rather than assumed.

---

# Hot Delivery — Release Evidence (2026-08-23)

Verification matrix for the hot-delivery release. Evidence surfaces refer to
the Netlify production deploy of this repository.

| Requirement | Evidence surface | Result | Notes |
| --- | --- | --- | --- |
| Source change is committed and traceable | Commit `220cc833280119875136bbf9eada65e8207f92b3` ("Add hot courier wanted heat") on `origin/main` | PASS | Only `src/main.ts` modified; working tree clean after push |
| Production deploy is live | Netlify deploy `6a8b2fb9126dab65a5fa4086` at https://vice-meridian.netlify.app/ | PASS | Deploy ID confirmed against the live site |
| Production build succeeds | `npm run build` (tsc + Vite) | PASS | No type or build errors blocking output |
| No whitespace errors in tracked changes | `git diff --check` | PASS | Clean output, no trailing whitespace or conflict markers |
| No known vulnerabilities in production dependencies | `npm audit --omit=dev` | PASS | 0 vulnerabilities reported for the production dependency tree |
| App bundle contains the hot-delivery strings plus prior feature strings | Fetched live JS bundle; contains "HOT DELIVERY" plus "POLICE SCAN", "SAFEHOUSE", wallet "CASH $"/"REP", "COURIER RUN // DELIVERED +$250 // REP +1", and "DROP-OFF" strings | PASS | Confirms the deploy serves the updated bundle; police scan, safehouse, wallet, and courier strings remain intact alongside the new hot-heat code |
| Security headers present on responses | Live response headers include CSP, Permissions-Policy, Referrer-Policy, HSTS, and `X-Content-Type-Options` | PASS | All expected headers observed on the production origin |
| Desktop browser loads the deploy and core controls work | Real Chrome profile desktop session at 1440x604: deploy loaded; M (map open/close), F (pulse), Q (jammer), R (reset) exercised | PASS | Zero application console errors during interaction |
| Responsive layout on small viewport | Real Chrome mobile session at 390x844: page loaded, scrollWidth measured at 390 | PASS | No horizontal overflow; zero application console errors |
| Hot-heat behavior on contract start | Verified via source review and live bundle strings only (`setWanted(Math.max(1, wanted))` at activation; HOT DELIVERY mission text present in served bundle) | VERIFIED BY SOURCE + BUNDLE, NOT E2E | The new wanted-heat-on-entry behavior was not driven end-to-end in a browser in this pass |
| Full courier E pickup / drive / deliver loop | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | Enter, drive, and deliver sequence not driven end-to-end in this pass |
| Police wanted-state path | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | Drone chase, POLICE SCAN readout, and search ring under live wanted state not driven end-to-end in this pass |
| Safehouse H-in-zone heat-clear path | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | H keypress while standing inside the safehouse ring not driven end-to-end in this pass |
| Reward delivery (+$250 / REP +1 reflected in wallet) | Not exercised end-to-end in the real Chrome session | NOT FULLY VERIFIED | Delivery reward updating cash/rep and the wallet HUD not driven end-to-end in this pass |
| Auth / backend / API integration | Static Vite site — no auth, backend, or API surface exists | Not applicable | Nothing to verify beyond static serving and headers |

## Summary

Build, audit, bundle-content, header, desktop-interaction, and mobile-layout gates passed.
The hot-heat behavior itself is verified by source and live bundle but not end-to-end.
Full courier E pickup/drive/deliver, the police wanted-state path, safehouse H-in-zone,
and reward delivery were NOT fully verified in this pass and are flagged above rather
than assumed.
