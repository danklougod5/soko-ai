import { chromium } from "playwright-core";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errors: string[] = [];
page.on("pageerror", (e) => errors.push("[pageerror] " + String(e).slice(0, 240)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("[console] " + m.text().slice(0, 260));
});

await page.goto(
  "http://localhost:3000/studioreact?prompt=" +
    encodeURIComponent("je veux un site pour ma boutique de cosmétiques africaines"),
  { waitUntil: "domcontentloaded", timeout: 120000 }
);
await page.waitForSelector("text=Créer mes 3 designs de boutique", { timeout: 300000 });
console.log("[questions] OK");

await page.evaluate(() => {
  document.querySelectorAll("div.flex.flex-wrap.gap-2 button").forEach((b) => (b as HTMLElement).click());
  document.querySelectorAll("input").forEach((inp) => {
    inp.focus();
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set!;
    setter.call(inp, "mara");
    inp.dispatchEvent(new Event("input", { bubbles: true }));
  });
});
await wait(600);
await page.click("text=Créer mes 3 designs de boutique", { force: true });
console.log("[generating] …");

// Attend que la preview WebContainer serve réellement la boutique
let previewFound = false;
for (let i = 0; i < 110; i++) {
  const frames = page.frames();
  const target = frames.find((f) => f !== page.mainFrame() && f.url().includes("--5173--"));
  if (target) {
    try {
      const ready = await target.evaluate(() => {
        const root = document.getElementById("root");
        return { hasRoot: !!root, children: root ? root.children.length : -1, title: document.title };
      });
      if (ready.hasRoot) {
        previewFound = true;
        console.log(`[wc] preview frame prête (essai ${i}):`, JSON.stringify(ready));
        break;
      }
    } catch {
      // frame pas encore prête
    }
  }
  await wait(4000);
}
if (!previewFound) console.log("[wc] AUCUNE preview frame prête — fallback srcdoc probablement actif");

await wait(8000);
const tabs = await page.evaluate(() =>
  [...document.querySelectorAll("button")]
    .map((b) => (b.textContent || "").trim())
    .filter((t) => /^A —|^B —|^C —/.test(t))
);
console.log("[tabs]", JSON.stringify(tabs));

const wcFrame = () =>
  page.frames().find((f) => f !== page.mainFrame() && f.url().includes("--5173--"));

for (const label of tabs) {
  await page.evaluate((l) => {
    const btn = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === l) as HTMLElement | undefined;
    btn?.click();
  }, label);
  await wait(9000);

  const frame = wcFrame();
  let diag: unknown = "no-wc-frame";
  if (frame) {
    try {
      diag = await frame.evaluate(() => {
        const root = document.getElementById("root");
        const links = [...document.querySelectorAll("a")].map((a) => a.getAttribute("href")).filter(Boolean).slice(0, 6);
        return {
          rootChildren: root ? root.children.length : -1,
          text: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 140),
          links,
          overlays: [...document.querySelectorAll("vite-error-overlay")].length,
          overlayText: (document.querySelector("vite-error-overlay")?.shadowRoot?.textContent || "").replace(/\s+/g, " ").slice(0, 300),
          scrollW: document.documentElement.scrollWidth,
        };
      });
    } catch (e) {
      diag = "frame-eval-error: " + String(e).slice(0, 80);
    }
  }
  console.log(`[${label}] WC`, JSON.stringify(diag));
  await page.screenshot({ path: `.repro/wc-${label.charAt(0)}.png` });
}

console.log("[errors]", errors.length ? JSON.stringify(errors.slice(0, 10)) : "aucune");
await browser.close();
