/**
 * Share data resolver.
 *
 * Integration options:
 * 1) Set SHARE_DATA_ENDPOINT to your backend endpoint that returns JSON by token.
 *    Example expected response:
 *      { "title": "...", "description": "...", "imageUrl": "https://..." }
 *
 * 2) Keep fallback mode until backend is ready.
 */

const MAX_TEXT_LENGTH = 180;

function clamp(text, max = MAX_TEXT_LENGTH) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function makeFallbackImageURL(baseUrl, token) {
  const encodedToken = encodeURIComponent(token);
  return `${baseUrl}/images/saveapp-og-default.png?v=3&t=${encodedToken}`;
}

async function fetchFromEndpoint(token) {
  const endpointBase = process.env.SHARE_DATA_ENDPOINT;
  if (!endpointBase) return null;

  const url = `${endpointBase.replace(/\/$/, "")}/${encodeURIComponent(token)}`;
  const headers = {};

  if (process.env.SHARE_DATA_BEARER_TOKEN) {
    headers.Authorization = `Bearer ${process.env.SHARE_DATA_BEARER_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) return null;

  const data = await res.json();
  if (!data || typeof data !== "object") return null;

  return {
    title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : null,
    description:
      typeof data.description === "string" && data.description.trim()
        ? clamp(data.description.trim())
        : null,
    imageUrl: typeof data.imageUrl === "string" && data.imageUrl.trim() ? data.imageUrl.trim() : null
  };
}

function fallbackData(token, baseUrl) {
  return {
    title: `Shared from saveApp`,
    description: "Open this shared save in saveApp.",
    imageUrl: makeFallbackImageURL(baseUrl, token)
  };
}

export async function resolveShareData({ token, baseUrl }) {
  const fromEndpoint = await fetchFromEndpoint(token).catch(() => null);
  if (fromEndpoint) {
    return {
      title: fromEndpoint.title ?? "Shared from saveApp",
      description: fromEndpoint.description ?? "Open this shared save in saveApp.",
      imageUrl: fromEndpoint.imageUrl ?? makeFallbackImageURL(baseUrl, token)
    };
  }

  return fallbackData(token, baseUrl);
}
