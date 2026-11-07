const root = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export const defaults = {
  tagline: "America's Packaging News and Leading Packaging Supplier Guide",

  heroHeading: "Packaging News & Industry Insights",

  heroIntro: "Packaging news, suppliers and insights for your business.",

  mailingAddress: "P.O. Box 732024, Ormond Beach, Florida 32173-2024",

  advertisingEmail: "info@packagingtimes.com",
  trendingEmail: "trending@packagingtimes.com",

  facebook: "",
  youtube: "",
  linkedin: "",
  x: "",
};

export async function api(endpoint, options = {}) {
  const headers =
    options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" };

  let response;

  try {
    response = await fetch(`${root}${endpoint}`, {
      credentials: "include",
      ...options,

      headers: {
        ...headers,
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot reach the backend. Please check that Node.js server is running.",
    );
  }

  let result = {};

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status}).`,
    );
  }

  if (!response.ok) {
    if (response.status === 401 && endpoint.startsWith("/admin/")) {
      window.dispatchEvent(new Event("admin:unauthorized"));
    }

    const errors = result.errors
      ?.map((e) => `${e.field}: ${e.message}`)
      .join("; ");

    throw new Error(
      errors || result.message || `Request failed (${response.status}).`,
    );
  }

  return result.data === undefined ? result : result.data;
}

export function assetUrl(url) {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) return url;

  const apiOrigin = root.replace(/\/api$/, "");

  if (url.startsWith("/api/uploads/")) {
    return apiOrigin + url;
  }

  // Existing MongoDB records use /uploads/*. Route them through /api so the
  // production reverse proxy reaches Express instead of returning the SPA.
  if (url.startsWith("/uploads/")) {
    return `${apiOrigin}/api${url}`;
  }

  return url;
}

export const pages = [
  {
    slug: "home",
    label: "Home",
    path: "/",
  },
  {
    slug: "subscribe",
    label: "Subscribe Free",
    path: "/subscribe-free",
  },
  {
    slug: "flexibles",
    label: "Flexibles",
    path: "/flexibles",
  },
  {
    slug: "rigid",
    label: "Rigid",
    path: "/rigid",
  },
  {
    slug: "advertising",
    label: "Advertising",
    path: "/advertising",
  },
  {
    slug: "trends",
    label: "Trends",
    path: "/trends",
  },
  {
    slug: "contact",
    label: "Contact Us",
    path: "/contact-us",
  },
];

export const adSlots = [
  ...Array.from({ length: 4 }, (_, i) => `left-${i + 1}`),
  ...Array.from({ length: 4 }, (_, i) => `right-${i + 1}`),
  "bottom-1",
  "bottom-2",
];

export const maxImageSize = 10 * 1024 * 1024;

export function friendlyDate(value) {
  return value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
}
