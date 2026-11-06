import { useEffect } from "react";

export default function CategorySeo({ item, category }) {
  useEffect(() => {
    const previousTitle = document.title;

    const title =
      item?.metaTitle ||
      item?.title ||
      `Packaging ${category} | Packaging Times`;

    const description =
      item?.metaDescription || `Packaging Times ${category} news and articles.`;

    document.title = title;

    const patches = [];

    function setMeta(name, value, attr = "name") {
      let element = document.head.querySelector(`meta[${attr}="${name}"]`);

      const created = !element;

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.append(element);
      }

      const previous = element.getAttribute("content");
      element.setAttribute("content", value);

      patches.push(() => {
        if (created) {
          element.remove();
        } else if (previous === null) {
          element.removeAttribute("content");
        } else {
          element.setAttribute("content", previous);
        }
      });
    }

    const url =
      `${window.location.origin}/${category}` +
      `?page=${encodeURIComponent(item.slug)}`;

    setMeta("description", description);
    setMeta("robots", item.robots || "index,follow");

    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", url, "property");
    setMeta("og:type", "article", "property");

    setMeta("twitter:card", item.seoImage ? "summary_large_image" : "summary");

    setMeta("twitter:title", title);
    setMeta("twitter:description", description);

    if (item.seoImage) {
      try {
        const image = new URL(item.seoImage, window.location.origin).href;

        setMeta("og:image", image, "property");
      } catch {
        // Skip an invalid image URL.
      }
    }

    let canonical = document.head.querySelector('link[rel="canonical"]');

    const createdCanonical = !canonical;

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }

    const oldCanonical = canonical.getAttribute("href");
    canonical.href = url;

    const structuredData = document.createElement("script");
    structuredData.type = "application/ld+json";

    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: item.title,
      description,
      mainEntityOfPage: url,
      articleSection: category,
      datePublished: item.createdAt,
      dateModified: item.updatedAt,
      author: {
        "@type": "Organization",
        name: "Packaging Times",
      },
      publisher: {
        "@type": "Organization",
        name: "Packaging Times",
      },
    });

    document.head.append(structuredData);

    return () => {
      document.title = previousTitle;

      patches.forEach((restore) => restore());

      structuredData.remove();

      if (createdCanonical) {
        canonical.remove();
      } else if (oldCanonical === null) {
        canonical.removeAttribute("href");
      } else {
        canonical.setAttribute("href", oldCanonical);
      }
    };
  }, [item, category]);

  return null;
}
