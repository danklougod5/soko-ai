import { chromium } from "playwright-core";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const logs: string[] = [];
page.on("pageerror", (e) => logs.push("[pageerror] " + String(e).slice(0, 300)));
page.on("console", (m) => {
  if (m.type() === "error") logs.push("[console] " + m.text().slice(0, 300));
});

await page.goto("http://localhost:5199/", { waitUntil: "networkidle", timeout: 60000 });
await wait(6000);

const diag = await page.evaluate(() => {
  const root = document.getElementById("root");
  return {
    rootChildren: root ? root.children.length : -1,
    text: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 160),
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    links: [...document.querySelectorAll("a")].slice(0, 8).map((a) => a.getAttribute("href")),
  };
});
console.log("[render]", JSON.stringify(diag));
await page.screenshot({ path: ".repro/vite-render.png", fullPage: false });

// Navigation hash
const target = diag.links.find((h) => h && h.startsWith("#") && !h.includes("accueil"));
if (target) {
  await page.evaluate((h) => {
    window.location.hash = h!;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, target);
  await wait(1500);
  const after = await page.evaluate(() => ({
    text: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 200),
    cards: document.querySelectorAll("article, [class*='product'], [class*='card']").length,
  }));
  console.log("[nav]", target, JSON.stringify(after));
}

// Mobile 375
await page.setViewportSize({ width: 375, height: 800 });
await wait(1200);
const mobile = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));
console.log("[mobile-375]", JSON.stringify(mobile));
await page.screenshot({ path: ".repro/vite-mobile.png", fullPage: false });

console.log("[errors]", logs.length ? JSON.stringify(logs.slice(0, 6)) : "aucune");
await browser.close();
