import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveShareData } from "./shareData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const app = express();

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "https://nicks30.net").replace(/\/$/, "");
const IOS_APP_SCHEME = process.env.IOS_APP_SCHEME || "saveapp";
const APP_TEAM_ID = process.env.APP_TEAM_ID || "KU4HZ94MVK";
const APP_BUNDLE_ID = process.env.APP_BUNDLE_ID || "com.pierson.saveApp";

app.set("trust proxy", true);
app.disable("x-powered-by");

app.use("/images", express.static(path.join(rootDir, "images"), { maxAge: "7d" }));

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeToken(raw) {
  return String(raw || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
}

function renderShareHtml({ token, canonicalUrl, deepLink, title, description, imageUrl }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCanonicalUrl = escapeHtml(canonicalUrl);
  const safeImageUrl = escapeHtml(imageUrl);
  const safeDeepLink = escapeHtml(deepLink);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="saveApp" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:image" content="${safeImageUrl}" />
  <meta property="og:image:secure_url" content="${safeImageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${safeCanonicalUrl}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImageUrl}" />

  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; }
    main { max-width: 680px; margin: 0 auto; padding: 24px; }
    img { width: 100%; border-radius: 12px; margin: 16px 0; object-fit: cover; }
    a.button { display: inline-block; padding: 12px 16px; border-radius: 10px; background: #0f62fe; color: #fff; text-decoration: none; }
    p.meta { color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <main>
    <h1>${safeTitle}</h1>
    <p>${safeDescription}</p>
    <img src="${safeImageUrl}" alt="Share preview" />
    <p><a class="button" href="${safeDeepLink}">Open in saveApp</a></p>
    <p class="meta">Token: ${escapeHtml(token)}</p>
  </main>
  <script>
    const deepLink = ${JSON.stringify(deepLink)};
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setTimeout(() => {
        window.location.href = deepLink;
      }, 120);
    }
  </script>
</body>
</html>`;
}

function makeCanonicalUrl(token) {
  return `${PUBLIC_BASE_URL}/share/${encodeURIComponent(token)}`;
}

function makeDeepLink(token) {
  return `${IOS_APP_SCHEME}://share/${encodeURIComponent(token)}`;
}

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/.well-known/apple-app-site-association", (_req, res) => {
  const appId = `${APP_TEAM_ID}.${APP_BUNDLE_ID}`;
  res
    .status(200)
    .type("application/json")
    .send({
      applinks: {
        details: [
          {
            appIDs: [appId],
            components: [
              { "/": "/share/*" },
              { "/": "/s/*" }
            ]
          }
        ]
      }
    });
});

// Optional legacy location for easier manual checks.
app.get("/apple-app-site-association", (_req, res) => {
  res.redirect(308, "/.well-known/apple-app-site-association");
});

app.get("/s/:token", (req, res) => {
  const token = normalizeToken(req.params.token);
  if (!token) return res.status(400).send("Missing share token");
  res.redirect(302, `/share/${encodeURIComponent(token)}`);
});

app.get("/share/:token", async (req, res) => {
  const token = normalizeToken(req.params.token);
  if (!token) return res.status(400).send("Missing share token");

  const canonicalUrl = makeCanonicalUrl(token);
  const deepLink = makeDeepLink(token);

  const share = await resolveShareData({ token, baseUrl: PUBLIC_BASE_URL });

  const html = renderShareHtml({
    token,
    canonicalUrl,
    deepLink,
    title: share.title,
    description: share.description,
    imageUrl: share.imageUrl
  });

  res.status(200).type("text/html; charset=utf-8").send(html);
});

app.get("/", (_req, res) => {
  res.status(200).type("text/plain; charset=utf-8").send(
    [
      "saveApp Share Site",
      "",
      "Endpoints:",
      "- GET /share/:token   (OG share page)",
      "- GET /s/:token       (short redirect)",
      "- GET /.well-known/apple-app-site-association",
      "- GET /healthz"
    ].join("\n")
  );
});

app.listen(PORT, () => {
  console.log(`saveApp share site listening on :${PORT}`);
});
