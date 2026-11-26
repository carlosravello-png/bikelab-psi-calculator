# BikeLab PSI Calculator

Designed and maintained by **Carlos Eduardo Ravello Joo** · ORCID [0009-0007-5631-7436](https://orcid.org/0009-0007-5631-7436) · BikeLab Studio, Trujillo, Peru

[![verify](https://github.com/carlosravello-png/bikelab-psi-calculator/actions/workflows/verify.yml/badge.svg)](https://github.com/carlosravello-png/bikelab-psi-calculator/actions/workflows/verify.yml)
[![License: PolyForm Noncommercial 1.0.0](https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-c8922a)](LICENSE.md)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24479992.svg)](https://doi.org/10.5281/zenodo.24479992)

Bicycle tire pressure from rider weight, tire width, rim and setup. Two independent
engines: a **road/gravel** constant-deflection model (Frank Berto's 15 % tire drop, with a
real-width correction from a 321-tire census) and an **MTB** model fitted to the public
SRAM/Zipp guide. This repository holds both engines, their golden vectors and the
verifiers. The green badge is set by GitHub Actions, which runs the verifiers on every change.

**Full calculator** (online since 12 June 2026): [ES](https://www.bikelabstudio.com/articles/psi-calculator-es.html) · [EN](https://www.bikelabstudio.com/articles/psi-calculator-en.html) · [PT](https://www.bikelabstudio.com/articles/psi-calculator-pt.html)
**White paper (road/gravel model):** [DOI 10.5281/zenodo.20671797](https://doi.org/10.5281/zenodo.20671797)
**Previous archived versions (1.0, 2.0):** [DOI 10.5281/zenodo.20673124](https://doi.org/10.5281/zenodo.20673124)

## Road/gravel model (white paper, sections 3–6)

| Step | Formula |
|---|---|
| Real width | W = nominal + δ + 0.4·(rim − 18); δ_road = 7.953 − 0.2727·nominal, δ_gravel = 1.504 − 0.0827·nominal |
| Rear pressure | P = 600·L / W² + 0.75·W − 25 (L = rear load in lb, W in mm, P in PSI) |
| Corrections | butyl tube +5 %, supple −5 %, stiff +5 %, rough asphalt −5 %, gravel −12.5 % |
| Front | P_front = 0.93 · P_rear |
| Caps | hookless 72.5 PSI; hookless ≥ 30 mm internal 60 PSI |

## Verification

```
python verify_psi.py     # road/gravel, written from the white paper, standard library only
node check_engine.js     # both real engines, Node.js 18+
```

| What | Result |
|---|---|
| White paper's six cross-validation cases (12 front/rear values) | reproduced by the independent verifier and by the engine |
| Engine vs white paper closed form, 6,480 inputs | max difference 0.002 PSI (the paper prints 1.5043 as 1.504) |
| MTB golden vectors | 8/8 to 1e-4 bar, plus sign guard (more weight → more pressure, wider → less, smaller wheel → more) |
| MTB vs SRAM AXS guide, live on 2026-11-23 | 3 of 4 cases match to SRAM's two decimals; see below |

## Honest notes

- **The original 2026 oracle scripts were not preserved.** `verify_psi.py` was written on
  2026-11-23 from the white paper and is declared as such.
- **The MTB model is a fit to the SRAM/Zipp guide**, not an independent physical model:
  30 runs captured on 2026-07-02, fit r.m.s. 0.004 bar. Its coefficients are published
  only here, in `psi_engine_mtb.js`. What BikeLab adds on top: tire inserts (CushCore FAQ),
  the ETRTO hookless cap, an uncertainty band and the self-test.
- **Implicit bike weight.** The fit matches SRAM when SRAM's bike weight is 14 kg; the
  `kg` input is the rider with gear. This was not written down in July and is now.
- **Known limit.** On a 26-inch wheel with a 25 mm rim (golden case G6) the model is
  4 % below SRAM's current guide (2.01 / 2.14 vs 2.09 / 2.22 bar). Either SRAM changed
  since July or the fit is weaker at that corner. Not changed here: the published engine
  is archived as it is. Details: [`docs/sram_comparison_2026-11-23.json`](docs/sram_comparison_2026-11-23.json).
- **Not checked against SRAM:** the XC, enduro and DH cases, and inserts (SRAM has no insert option).
- **Road/gravel uncertainty band** is a Monte Carlo without a fixed seed, so the ± band can
  move slightly between runs; the central value is deterministic and is what is verified.
- This repository covers the engines and their evidence. The text of the bikelabstudio.com
  pages stays under the site's own license.

## License and citation

Engines, vectors and verifiers: [PolyForm Noncommercial 1.0.0](LICENSE.md), free for any noncommercial use,
including research, teaching and personal use; commercial use needs written permission from
the author. Versions up to 3.0.0 were released under CC BY 4.0 and keep that licence.
Licence and attribution terms: https://carlosravello.com/licencia-en.html. Cite with the metadata in
[`CITATION.cff`](CITATION.cff); each release is archived on Zenodo with its own DOI.

> Ravello Joo, C. E. (2026). *BikeLab PSI Calculator* (Version 3.1.0) [Software]. Zenodo. https://doi.org/10.5281/zenodo.24549819

All versions from 3.0.0: DOI [10.5281/zenodo.24479992](https://doi.org/10.5281/zenodo.24479992). Code of version 3.1.0 archived in Software Heritage: [swh:1:rev:5aa23b8f5e1b219359fbd68a4238dc6162a9125c](https://archive.softwareheritage.org/swh:1:rev:5aa23b8f5e1b219359fbd68a4238dc6162a9125c).
