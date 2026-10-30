import { chromium } from "playwright-core";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errors: string[] = [];
page.on("pageerror", (e) => errors.push("[pageerror] " + String(e).slice(0, 300)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("[console] " + m.text().slice(0, 400));
});

await page.goto(
  "http://localhost:3000/studioreact?prompt=" +
    encodeURIComponent("je veux un site pour ma boutique de cosmétiques africaines"),
  { waitUntil: "domcontentloaded", timeout: 120000 }
);

console.log("COI:", await page.evaluate(() => window.crossOriginIsolated));

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

// Attend l'aperçu (WebContainer ou fallback srcdoc)
await page.waitForSelector("iframe", { timeout: 420000 });
console.log("[preview] iframe present");

// Attend la disponibilité du WebContainer (l'iframe srcdoc est remplacée)
let wcReady = false;
for (let i = 0; i < 90; i++) {
  const state = await page.evaluate(() => {
    const f = document.querySelector('iframe[title^="Aperçu WebContainer"]') as HTMLIFrameElement | null;
    return { wc: !!f, src: f?.getAttribute("src") || "" };
  });
  if (state.wc) {
    wcReady = true;
    console.log("[webcontainer] ready:", state.src.slice(0, 60));
    break;
  }
  await wait(4000);
}
if (!wcReady) console.log("[webcontainer] PAS PRÊT — fallback srcdoc utilisé");

await wait(9000);

const tabs = await page.evaluate(() =>
  [...document.querySelectorAll("button")]
    .map((b) => (b.textContent || "").trim())
    .filter((t) => /^A —|^B —|^C —/.test(t))
);
console.log("[tabs]", JSON.stringify(tabs));

for (const label of tabs) {
  await page.evaluate((l) => {
    const btn = [...document.querySelectorAll("button")].find(
      (b) => (b.textContent || "").trim() === l
    ) as HTMLElement | undefined;
    btn?.click();
  }, label);
  await wait(6000);

  // Cherche l'iframe de prévisualisation (WebContainer ou srcdoc)
  const frameInfo = await page.evaluate(() => {
    const frames = [...document.querySelectorAll("iframe")] as HTMLIFrameElement[];
    const f = frames.find((x) => (x.getAttribute("title") || "").startsWith("Aperçu"));
    return f ? { title: f.getAttribute("title"), wc: (f.getAttribute("title") || "").includes("WebContainer") } : null;
  });
  const frame = page.frames().find((f) => f !== page.mainFrame() && f.url().length > 0) || page.frames().find((f) => f !== page.mainFrame());
  let diag: unknown = "no-frame";
  if (frame) {
    diag = await frame.evaluate(() => {
      const root = document.getElementById("root");
      const bad = document.body.innerText.match(/Element type is invalid|is not defined|SyntaxError|Failed to resolve import/g);
      return {
        title: document.title,
        rootChildren: root ? root.children.length : -1,
        cssRules: [...document.styleSheets].reduce((n, s) => {
          try {
            return n + s.cssRules.length;
          } catch {
            return n;
          }
        }, 0),
        bad: bad ? [...new Set(bad)] : [],
        text: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 90),
        scrollW: document.documentElement.scrollWidth,
      };
    });
  }
  console.log(`[${label}] ${frameInfo ? (frameInfo.wc ? "WC" : "srcdoc") : "?"}`, JSON.stringify(diag));
  await page.screenshot({ path: `.repro/e2e-${label.charAt(0)}.png` });
}

// Test plein écran de l'aperçu
await page.click('button[title="Aperçu en plein écran"]', { force: true });
await wait(1200);
const full = await page.evaluate(() => {
  const f = document.querySelector('iframe[title^="Aperçu"]') as HTMLElement | null;
  const box = f?.parentElement as HTMLElement | null;
  const r = box?.getBoundingClientRect();
  const quit = [...document.querySelectorAll("button")].some((b) => (b.textContent || "").includes("Quitter"));
  return { w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0, quit, vw: window.innerWidth, vh: window.innerHeight };
});
console.log("[fullscreen]", JSON.stringify(full), full.w >= full.vw - 2 && full.h >= full.vh - 2 ? "OK" : "KO");
await page.screenshot({ path: ".repro/e2e-fullscreen.png" });
await page.keyboard.press("Escape");
await wait(800);
const exited = await page.evaluate(() => ![...document.querySelectorAll("button")].some((b) => (b.textContent || "").includes("Quitter")));
console.log("[fullscreen] escape:", exited ? "OK" : "KO");

console.log("[errors]", errors.length ? JSON.stringify(errors.slice(0, 8)) : "aucune");
await browser.close();
