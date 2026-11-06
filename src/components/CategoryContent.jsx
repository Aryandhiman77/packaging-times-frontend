import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import CategorySeo from "./CategorySeo.jsx";

export default function CategoryContent({ category, fallback = null }) {
  const { search } = useLocation();
  const navigate = useNavigate();

  const requested = new URLSearchParams(search).get("page");

  const [pages, setPages] = useState(null);
  const [item, setItem] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [overflow, setOverflow] = useState(false);

  const bodyRef = useRef(null);

  useEffect(() => {
    let active = true;
    setPages(null);

    api(`/public/content-pages/${category}`)
      .then((data) => {
        if (active) setPages(data || []);
      })
      .catch(() => {
        if (active) setPages([]);
      });

    return () => {
      active = false;
    };
  }, [category]);

  const selected =
    pages?.find((p) => p.slug === requested) ||
    (!requested ? pages?.[0] : null);

  useEffect(() => {
    let active = true;

    setItem(null);
    setExpanded(false);
    setOverflow(false);

    if (!selected) return;

    api(
      `/public/content-pages/${category}/${encodeURIComponent(selected.slug)}`,
    )
      .then((data) => {
        if (active) setItem(data);
      })
      .catch(() => {
        if (active) setItem(null);
      });

    return () => {
      active = false;
    };
  }, [category, selected?._id]);

  useEffect(() => {
    if (!item || !bodyRef.current) {
      setOverflow(false);
      return;
    }

    const node = bodyRef.current;

    const measure = () => {
      if (!expanded) {
        setOverflow(node.scrollHeight > node.clientHeight + 2);
      }
    };

    const frame = requestAnimationFrame(measure);

    const images = [...node.querySelectorAll("img")];

    images.forEach((img) => img.addEventListener("load", measure));

    return () => {
      cancelAnimationFrame(frame);

      images.forEach((img) => img.removeEventListener("load", measure));
    };
  }, [item, expanded]);

  const index = pages?.findIndex((p) => p._id === selected?._id) ?? -1;

  const next = index >= 0 ? pages?.[index + 1] : null;

  function goNext() {
    if (!next) return;

    navigate(`/${category}?page=${encodeURIComponent(next.slug)}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (pages === null || (selected && !item)) {
    return <div className="category-story-loading" aria-busy="true" />;
  }

  if (!pages.length) {
    return fallback || <div className="category-story-empty" />;
  }

  if (!selected || !item) {
    return (
      <div className="category-story-empty">This page is not available.</div>
    );
  }

  return (
    <article className="category-story">
      <CategorySeo item={item} category={category} />

      <div
        ref={bodyRef}
        className={`category-story-body ${
          expanded ? "is-expanded" : "is-clamped"
        }`}
        dangerouslySetInnerHTML={{ __html: item.html }}
      />

      {(overflow || expanded) && (
        <button
          type="button"
          className="category-read-more"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "View Less" : "Read More"}
        </button>
      )}

      {next && (
        <div className="category-continue-row">
          <button type="button" className="category-continue" onClick={goNext}>
            Continue
          </button>
        </div>
      )}
    </article>
  );
}
