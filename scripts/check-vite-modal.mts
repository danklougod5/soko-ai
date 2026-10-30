import { chromium } from "playwright-core";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
page.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("404")) errors.push(m.text().slice(0, 200));
});

await page.goto("http://localhost:5199/#/boutique", { waitUntil: "networkidle", timeout: 60000 });
await wait(4000);

const open = await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button, a")].find(
    (b) => /^voir( le produit)?$/i.test((b.textContent || "").trim())
  ) as HTMLElement | undefined;
  btn?.scrollIntoView({ block: "center" });
  btn?.click();
  return btn ? btn.textContent?.trim() : "NO-BTN";
});
await wait(1800);

const modal = await page.evaluate(() => {
  const text = document.body.innerText.replace(/\s+/g, " ");
  const imgs = [...document.querySelectorAll("img")].filter((i) => {
    const r = i.getBoundingClientRect();
    return r.width > 40 && r.height > 40;
  }).length;
  const fullBtn = [...document.querySelectorAll("button")].find((b) =>
    /plein.?ecran|fullscreen|agrandir/i.test((b.textContent || "") + (b.getAttribute("title") || "") + (b.getAttribute("aria-label") || ""))
  );
  const wa = [...document.querySelectorAll("a")].find((a) => (a.getAttribute("href") || "").includes("wa.me"));
  return {
    opened: /quantit|caract|détail|detail|description/i.test(text),
    imgs,
    fullscreenBtn: fullBtn ? (fullBtn.textContent || fullBtn.getAttribute("title") || "svg").trim().slice(0, 30) : "ABSENT",
    whatsapp: wa ? wa.getAttribute("href")?.slice(0, 110) : "ABSENT",
    qtyButtons: [...document.querySelectorAll("button")].filter((b) => /^[-+−–]$/.test((b.textContent || "").trim())).length,
  };
});
console.log("[modal]", open, JSON.stringify(modal));
await page.screenshot({ path: ".repro/modal-a.png" });

// Essaie le plein écran de la modale s'il existe
const clickedFull = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) =>
    /plein.?ecran|fullscreen|agrandir/i.test((x.textContent || "") + (x.getAttribute("title") || "") + (x.getAttribute("aria-label") || ""))
  ) as HTMLElement | undefined;
  b?.click();
  return !!b;
});
if (clickedFull) {
  await wait(1000);
  const fullDiag = await page.evaluate(() => {
    const fixed = [...document.querySelectorAll("div")].filter((d) => {
      const s = getComputedStyle(d);
      const r = d.getBoundingClientRect();
      return (s.position === "fixed" || s.position === "absolute") && r.width >= window.innerWidth - 4 && r.height >= window.innerHeight - 4;
    }).length;
    return { fullOverlay: fixed, vw: window.innerWidth, vh: window.innerHeight };
  });
  console.log("[modal-fullscreen]", JSON.stringify(fullDiag));
  await page.screenshot({ path: ".repro/modal-a-full.png" });
}

console.log("[errors]", errors.length ? JSON.stringify(errors.slice(0, 5)) : "aucune");
await browser.close();
