/** Temporary audit: every "/brand/..." style asset referenced in client/src must exist in client/public. */
const fs = require("node:fs");
const path = require("node:path");

const src = "client/src";
const pub = "client/public";
const refs = new Map();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|css)$/.test(entry.name)) {
      const txt = fs.readFileSync(full, "utf8");
      for (const m of txt.matchAll(/["'`(](\/(?:brand|heroes|photos|lottie|icons|fonts|manifest)[A-Za-z0-9._/@-]*)/g)) {
        const url = m[1].split("?")[0];
        if (!refs.has(url)) refs.set(url, new Set());
        refs.get(url).add(full.replace(/\\/g, "/"));
      }
    }
  }
}
walk(src);

let ok = 0;
let missing = 0;
for (const url of [...refs.keys()].sort()) {
  const file = path.join(pub, url);
  if (fs.existsSync(file)) ok++;
  else {
    missing++;
    console.log("MISSING " + url + "   <- " + [...refs.get(url)].slice(0, 3).join(", "));
  }
}
console.log("present=" + ok + " missing=" + missing);
