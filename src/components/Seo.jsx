import { useEffect } from "react";

export default function Seo({ story }) {
  useEffect(() => {
    if (!story) return;

    const title = story.metaTitle || story.title;

    const description = story.metaDescription || story.excerpt;

    const url = `${location.origin}/story/` + encodeURIComponent(story.slug);
    const image = story.seoImage
      ? new URL(story.seoImage, location.origin).href
      : "";

    const previousTitle = document.title;

    document.title = title;

    const changes = [];

    function writeMeta(kind, key, value) {
      let el = document.head.querySelector(`meta[${kind}="${key}"]`);

      const made = !el;

      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(kind, key);
        document.head.append(el);
      }

      const before = el.getAttribute("content");

      el.setAttribute("content", value);

      changes.push({
        el,
        made,
        attr: "content",
        before,
      });
    }

    writeMeta("name", "description", description);

    writeMeta("name", "robots", story.robots || "index,follow");

    [
      ["og:type", "article"],
      ["og:site_name", "Packaging Times"],
      ["og:title", title],
      ["og:description", description],
      ["og:url", url],
    ].forEach(([key, value]) => {
      writeMeta("property", key, value);
    });

    writeMeta(
      "name",
      "twitter:card",
      image ? "summary_large_image" : "summary",
    );

    writeMeta("name", "twitter:title", title);
    writeMeta("name", "twitter:description", description);

    if (story.category) {
      writeMeta("property", "article:section", story.category);
    }

    if (story.publishedAt) {
      writeMeta("property", "article:published_time", story.publishedAt);
    }

    if (story.updatedAt) {
      writeMeta("property", "article:modified_time", story.updatedAt);
    }

    if (image) {
      writeMeta("property", "og:image", image);

      writeMeta("name", "twitter:image", image);
    }

    const structuredData = document.createElement("script");
    structuredData.id = "story-structured-data";
    structuredData.type = "application/ld+json";
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      url,
      mainEntityOfPage: url,
      headline: story.title,
      description,
      inLanguage: "en-US",
      isAccessibleForFree: true,
      ...(story.category ? { articleSection: story.category } : {}),
      ...(story.publishedAt ? { datePublished: story.publishedAt } : {}),
      ...(story.updatedAt ? { dateModified: story.updatedAt } : {}),
      ...(image ? { image: [image] } : {}),
      author: { "@type": "Organization", name: "Packaging Times" },
      publisher: { "@type": "Organization", name: "Packaging Times" },
    });
    document.head.append(structuredData);

    let canonical = document.head.querySelector('link[rel="canonical"]');

    const made = !canonical;

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }

    const before = canonical.getAttribute("href");

    canonical.href = url;

    changes.push({
      el: canonical,
      made,
      attr: "href",
      before,
    });

    return () => {
      document.title = previousTitle;
      structuredData.remove();

      changes.forEach((item) => {
        if (item.made) {
          item.el.remove();
        } else if (item.before === null) {
          item.el.removeAttribute(item.attr);
        } else {
          item.el.setAttribute(item.attr, item.before);
        }
      });
    };
  }, [story]);

  return null;
}
