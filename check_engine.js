// check_engine.js — runs the calculator's own engines (copied verbatim from the live page)
// against golden_vectors.json, the white paper cases and the documented closed form.
// Run:  node check_engine.js      (Node.js 18+, no dependencies)
const fs = require("fs");
const path = require("path");
const R = require("./psi_engine_road.js");
const M = require("./psi_engine_mtb.js");
const gv = JSON.parse(fs.readFileSync(path.join(__dirname, "golden_vectors.json"), "utf8"));

let ok = 0, n = 0;
const rep = (pass, msg) => { n++; if (pass) ok++; console.log(`${pass ? "OK  " : "FAIL"} ${msg}`); };

console.log("Road/gravel engine");
for (const c of gv.road.cases) {
  const w = R.realWidth(c.nominal, c.rim);
  const r = R.pRear(c.kg, w, R.REAR_SHARE[c.share === "racing" ? "racing" : "endurance"], c.tube, "estandar", c.surface);
  const f = R.K_FRONT * r;
  rep(Math.abs(f - c.front) <= gv.road.tolerance_psi && Math.abs(r - c.rear) <= gv.road.tolerance_psi,
      `white paper case ${c.case}: ${f.toFixed(2)} / ${r.toFixed(2)} (published ${c.front} / ${c.rear})`);
}
// engine vs closed form written from the white paper, on a grid
const paper = (kg, nom, rim, share) => {
  const d = nom <= 30 ? 7.953 - 0.2727 * nom : 1.504 - 0.0827 * nom;
  const W = nom + d + 0.4 * (rim - 18);
  return 600 * kg * 2.20462 * share / (W * W) + 0.75 * W - 25;
};
let worst = 0, cells = 0;
for (let kg = 50; kg <= 120; kg += 5) for (const nom of [23, 25, 28, 30, 32, 35, 40, 45, 50]) for (let rim = 15; rim <= 30; rim += 1)
  for (const s of ["racing", "endurance", "urbana"]) {
    worst = Math.max(worst, Math.abs(R.pRear(kg, R.realWidth(nom, rim), R.REAR_SHARE[s], false, "estandar", "liso") - paper(kg, nom, rim, R.REAR_SHARE[s])));
    cells++;
  }
// The white paper prints the gravel width constant rounded (1.504); the engine keeps 1.5043.
// That rounding is worth at most a few thousandths of a PSI; the tool displays steps of 0.5 PSI.
rep(worst < 0.01, `grid of ${cells} inputs: max |engine - white paper closed form| = ${worst.toExponential(2)} PSI (tolerance 0.01; paper rounds 1.5043 to 1.504)`);

console.log("MTB engine");
for (const g of gv.mtb.cases) {
  const f = M.centroF(g[0], g[1], g[2], g[3], g[4], g[5], g[6], g[7]), r = f * M.RF;
  rep(Math.abs(f - g[8]) < gv.mtb.tolerance_bar && Math.abs(r - g[9]) < gv.mtb.tolerance_bar,
      `golden ${g[0]} kg ${g[1]}in ${g[2]} ${g[3]}${g[4] ? " hookless" : ""} ${g[5]} rim ${g[6]} ${g[7]}: ${f.toFixed(4)} / ${r.toFixed(4)} bar`);
}
const st = M.selfTestCore();
rep(st.ok === st.n && st.signGuard, `the page's own selfTest logic: ${st.ok}/${st.n} vectors, sign guard ${st.signGuard}`);

console.log(`\n${ok}/${n} checks passed`);
process.exit(ok === n ? 0 : 1);
