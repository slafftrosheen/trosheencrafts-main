/**
 * Temporary audit: compares the kit v4.3 mock pages with the React pages that
 * reproduce them. Reports mock classes/ids a page never renders.
 * Run: node scripts/.mock-parity.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const kit = "Trosheen-Website-Kit-v4.3/13-code/pages";
const pairs = [
  ["index.html", "client/src/pages/home.tsx"],
  ["veikals.html", "client/src/pages/shop.tsx"],
  ["darbs.html", "client/src/pages/product-detail.tsx"],
  ["stasts.html", "client/src/pages/about.tsx"],
  ["kopsana.html", "client/src/pages/guide.tsx"],
  ["kontakti.html", "client/src/pages/contact.tsx"],
  ["galerija.html", "client/src/pages/gallery.tsx"],
  ["zurnals.html", "client/src/pages/blog.tsx"],
];

const IGNORE = /^(hide-sm|sr-only|skip|is-|tr-arrow|w|lang|badge|no-js)$/;

for (const [mockFile, reactFile] of pairs) {
  const mock = fs.readFileSync(path.join(kit, mockFile), "utf8");
  const main = mock.slice(mock.indexOf("<main"), mock.indexOf("</main>"));
  const react = fs.readFileSync(reactFile, "utf8");
  const mockClasses = new Set();
  for (const m of main.matchAll(/class="([^"]+)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c && !IGNORE.test(c)) mockClasses.add(c);
  }
  const mockIds = new Set([...main.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
  const missingClasses = [...mockClasses].filter((c) => !react.includes(c));
  const missingIds = [...mockIds].filter((id) => !react.includes(`"${id}"`) && !react.includes(`'${id}'`));
  console.log(
    mockFile.padEnd(14) +
      " -> " +
      reactFile.padEnd(38) +
      " classes=" +
      mockClasses.size +
      " missing=" +
      (missingClasses.length ? missingClasses.join(",") : "-") +
      " | ids missing: " +
      (missingIds.length ? missingIds.join(",") : "-"),
  );
}
