import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import CategorySeo from "./CategorySeo.jsx";

function CategoryContentSkeleton() {
  return (
    <article
      className="category-story category-story-loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading page content"
    >
      <div className="category-skeleton" aria-hidden="true">
        <div className="category-skeleton-block category-skeleton-heading" />
        <div className="category-skeleton-lines">
          <div className="category-skeleton-block" />
          <div className="category-skeleton-block" />
          <div className="category-skeleton-block category-skeleton-line-short" />
        </div>
        <div className="category-skeleton-block category-skeleton-media" />
        <div className="category-skeleton-lines">
          <div className="category-skeleton-block" />
          <div className="category-skeleton-block category-skeleton-line-medium" />
        </div>
      </div>
    </article>
  );
}

export default function CategoryContent({ category, fallback = null }) {
  const { search } = useLocation();
  const navigate = useNavigate();

  const requested = new URLSearchParams(search).get("page");

  const [pages, setPages] = useState(null);
  const [item, setItem] = useState(null);
  const [itemRequest, setItemRequest] = useState({
    key: "",
    status: "idle",
  });
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
    const requestKey = selected ? `${category}:${selected._id}` : "";

    setItem(null);
    setExpanded(false);
    setOverflow(false);

    if (!selected) {
      setItemRequest({ key: "", status: "idle" });
      return;
    }

    setItemRequest({ key: requestKey, status: "loading" });

    api(
      `/public/content-pages/${category}/${encodeURIComponent(selected.slug)}`,
    )
      .then((data) => {
        if (active) {
          setItem(data);
          setItemRequest({ key: requestKey, status: "success" });
        }
      })
      .catch(() => {
        if (active) {
          setItem(null);
          setItemRequest({ key: requestKey, status: "error" });
        }
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
  const selectedRequestKey = selected ? `${category}:${selected._id}` : "";
  const itemIsLoading =
    Boolean(selected) &&
    (itemRequest.key !== selectedRequestKey ||
      itemRequest.status === "loading");

  function goNext() {
    if (!next) return;

    navigate(`/${category}?page=${encodeURIComponent(next.slug)}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (pages === null || itemIsLoading) {
    return <CategoryContentSkeleton />;
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
