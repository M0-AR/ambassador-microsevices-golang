// Captures README screenshots and the demo GIF from the static demo.
// Usage: NODE_PATH=$(npm root -g) node scripts/capture-demo.mjs
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = path.join(root, "docs");
const shotDir = path.join(docsDir, "assets", "screenshots");
const videoDir = path.join(root, ".video-tmp");
fs.mkdirSync(shotDir, { recursive: true });
fs.rmSync(videoDir, { recursive: true, force: true });
fs.mkdirSync(videoDir, { recursive: true });

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  let file = path.join(docsDir, decodeURIComponent(url.pathname));
  if (file.endsWith(path.sep)) file = path.join(file, "index.html");
  if (!file.startsWith(docsDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(4199, resolve));
const base = "http://localhost:4199";

const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});

async function settle(page, ms = 500) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
}

// ---------- screenshots ----------
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await context.newPage();
const screens = ["dashboard", "products", "ambassadors", "links", "storefront", "orders", "analytics", "payouts", "settings"];
for (const name of screens) {
  const suffix = name === "storefront" ? "?ref=maya" : "";
  await page.goto(`${base}/app/${name}.html${suffix}`);
  await settle(page, 400);
  await page.screenshot({ path: path.join(shotDir, `${name}.png`) });
  console.log(`shot: ${name}`);
}

// Landing hero and live demo panel
await page.goto(`${base}/preview.html`);
await settle(page, 700);
await page.screenshot({ path: path.join(shotDir, "preview-hero.png") });
await page.locator("#demo").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(shotDir, "preview-demo.png") });
console.log("shot: preview hero + demo");

// Neural game, fully grown
await page.locator("#game").scrollIntoViewIfNeeded();
for (let i = 0; i < 6; i += 1) await page.locator("#game-grow").click();
await page.waitForTimeout(1400);
await page.screenshot({ path: path.join(shotDir, "neural-game.png") });
console.log("shot: neural game");
await context.close();

// ---------- GIF ----------
const videoContext = await browser.newContext({
  viewport: { width: 1200, height: 750 },
  recordVideo: { dir: videoDir, size: { width: 1200, height: 750 } }
});
const videoPage = await videoContext.newPage();
await videoPage.goto(`${base}/app/storefront.html?ref=maya`);
await settle(videoPage, 900);
await videoPage.waitForTimeout(900);
await videoPage.getByRole("button", { name: /Add to cart/ }).first().click();
await videoPage.waitForTimeout(1600);
await videoPage.getByRole("button", { name: /Checkout/i }).first().click();
await videoPage.waitForTimeout(1800);
await videoPage.getByRole("button", { name: /Continue shopping/i }).click().catch(() => {});
await videoPage.waitForTimeout(900);
const video = videoPage.video();
await videoContext.close();
const webm = await video.path();
fs.copyFileSync(webm, path.join(videoDir, "demo.webm"));
console.log("video:", webm);

await browser.close();
server.close();
