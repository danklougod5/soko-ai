import { chromium } from "playwright-core";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 200)));

await page.goto(
  "http://localhost:3000/studioreact?prompt=" + encodeURIComponent("je veux un site pour ma boutique de cosmétiques africaines"),
  { waitUntil: "domcontentloaded", timeout: 90000 }
);
console.log("COI:", await page.evaluate(() => window.crossOriginIsolated));
await wait(3000);
console.log("URL:", page.url());

await page.waitForSelector("text=Créer mes 3 designs de boutique", { timeout: 240000 });
console.log("[questions] OK");

const before = await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Créer mes 3 designs de boutique")) as HTMLButtonElement;
  return { disabled: btn?.disabled, text: btn?.textContent?.trim() };
});
console.log("[btn before]", JSON.stringify(before));

await page.evaluate(() => {
  document.querySelectorAll("div.flex.flex-wrap.gap-2 button").forEach((b) => (b as HTMLElement).click());
  document.querySelectorAll("input").forEach((inp) => {
    inp.focus();
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set!;
    setter.call(inp, "mara");
    inp.dispatchEvent(new Event("input", { bubbles: true }));
  });
});
await wait(800);

const after = await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Créer mes 3 designs de boutique")) as HTMLButtonElement | undefined;
  const req = [...document.querySelectorAll(".text-rose-400")].length;
  return { disabled: btn?.disabled, requiredMarks: req, body: document.body.innerText.slice(0, 120) };
});
console.log("[btn after]", JSON.stringify(after));
await browser.close();
