# V1.4 QA / Verification matrix

Generated at build time from local checks. A passing code/structure check **is not equivalent** to device/browser approval.

| Gate | Acceptance condition | Status |
|---|---|---|
| JS static syntax | Node.js `--check` over application, backend, service worker | **PASS** 2026-11-04 |
| Reference integrity | Four titles and known URLs, deterministic lookup, unknown questions not invented | **PASS** (initial false match found, then corrected) |
| Monk binary | Self-contained glTF2, 11 joints, nonzero skinned mesh, animation | **PASS** structural GLB tests |
| Source bundle | `npm run build` succeeds and emits `dist/index.html` and GLB | Not testable offline if node_modules missing |
| Desktop WebGL visual | Preview actual production bundle in Chrome | Not confirmed; **desktop static HTML/CSS screenshot inspected** (not a 3D runtime test) |
| Safari iPhone | App opens, frame time, memory, audio permission, touch navigation | Not tested; **390px mobile CSS screenshot inspected, no horizontal overflow** |
| AI backend | API key server-only; no AI frontend credentials | Source-reviewed, runtime untested |
| Professional rigged photorealism | Approved real monk model with skinning/facial animation | **Not achieved** |
| Full 3D cinematic environment | Volumetric landscape rather than scenic backplate | **Not achieved** |

Do not mark PRODUCTION RELEASE without a pass for critical device and visual gates.
