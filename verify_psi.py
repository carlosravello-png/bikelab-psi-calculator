# -*- coding: utf-8 -*-
"""
verify_psi.py — Independent verifier for the BikeLab PSI Calculator, road/gravel mode.

Written on 2026-11-23 from the white paper (DOI 10.5281/zenodo.20671797, sections 3-6),
NOT from the calculator's JavaScript. It recomputes the six cross-validation cases the
white paper publishes (section 9) and checks the documented properties of the model.

The MTB mode is an empirical fit to the SRAM/Zipp guide whose coefficients are not
published in any article, so it cannot be re-derived independently; it is checked in
check_engine.js (golden vectors, sign guard) and against SRAM live
(docs/sram_comparison_2026-11-23.json).

Standard library only. Run:  python verify_psi.py   (exit code 0 = all checks pass)
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
LB_PER_KG = 2.20462

# ---- model, as written in the white paper -------------------------------
def real_width(nominal, rim):                       # section 5
    delta = 7.953 - 0.2727 * nominal if nominal <= 30 else 1.504 - 0.0827 * nominal
    return nominal + delta + 0.4 * (rim - 18)

def berto(load_lb, width):                          # section 3
    return 600 * load_lb / width ** 2 + 0.75 * width - 25

SHARE = {"racing": 0.60, "endurance": 0.55, "urbana": 0.65}   # section 2
SURFACE = {"liso": 0.0, "rugoso": -0.05, "gravel": -0.125}    # section 6
CASING = {"estandar": 0.0, "supple": -0.05, "rigida": 0.05}   # section 6

def rear(kg, nominal, rim, share, tube=False, casing="estandar", surface="liso"):
    p = berto(kg * LB_PER_KG * SHARE[share], real_width(nominal, rim))
    if tube:
        p *= 1.05                                   # section 6: butyl tube +5 %
    return p * (1 + CASING[casing]) * (1 + SURFACE[surface])

def front(r):
    return 0.93 * r                                 # section 4: k = 0.93

# ---- checks ---------------------------------------------------------------
results = []
def check(name, ok, detail):
    results.append(ok)
    print(f"{'OK  ' if ok else 'FAIL'} {name}: {detail}")

gv = json.load(open(os.path.join(HERE, "golden_vectors.json"), encoding="utf-8"))["road"]
print("1. White paper, section 9: six published cases (front/rear, integer PSI)")
for c in gv["cases"]:
    r = rear(c["kg"], c["nominal"], c["rim"], c["share"], c["tube"], "estandar", c["surface"])
    f = front(r)
    ok = abs(f - c["front"]) <= gv["tolerance_psi"] and abs(r - c["rear"]) <= gv["tolerance_psi"]
    check(f"case {c['case']}", ok, f"{f:.2f} / {r:.2f}  (published {c['front']} / {c['rear']})")

print("2. Documented properties")
w = real_width(28, 21)
check("road 28 mm on 21 mm rim: real width", abs(w - (28 + 7.953 - 0.2727 * 28 + 1.2)) < 1e-12, f"{w:.3f} mm")
a, b = rear(80, 28, 21, "racing"), rear(90, 28, 21, "racing")
check("pressure rises with load", b > a, f"{a:.1f} -> {b:.1f} PSI")
a, b = rear(80, 28, 21, "racing"), rear(80, 32, 21, "racing")
check("pressure falls with width", b < a, f"{a:.1f} -> {b:.1f} PSI")
check("front coupled at 0.93 of rear", abs(front(70.0) - 65.1) < 1e-9, "70.0 -> 65.1 PSI")

n = sum(results)
print(f"\n{n}/{len(results)} checks passed")
sys.exit(0 if n == len(results) else 1)
