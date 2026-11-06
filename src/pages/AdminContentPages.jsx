import React, { useEffect, useMemo, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";

import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  BlockQuote,
  Table,
  TableToolbar,
  Image,
  ImageUpload,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  SourceEditing,
  GeneralHtmlSupport,
  FontColor,
  FontBackgroundColor,
  FontSize,
  Alignment,
  Undo,
  Autoformat,
  FileRepository,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

import { Plus, Save, Pencil, Trash2, Search, FileText } from "lucide-react";

import { api, maxImageSize } from "../lib/api.js";
import AdminPagination from "../components/AdminPagination.jsx";

const categories = ["trends", "flexibles", "rigid", "advertising"];

const categoryLabel = (category) =>
  category[0].toUpperCase() + category.slice(1);

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);

const empty = (category, order = 1) => ({
  category,
  title: "",
  slug: "",
  html: "<p></p>",
  order,
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  seoImage: "",
  robots: "index,follow",
});

function UploadPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => ({
    upload: async () => {
      const file = await loader.file;

      if (!file || file.size > maxImageSize) {
        throw new Error("Image must be 10MB or smaller.");
      }

      const body = new FormData();
      body.append("image", file);

      const uploaded = await api("/admin/content-images", {
        method: "POST",
        body,
      });

      return { default: uploaded.url };
    },

    abort: () => {},
  });
}

const plugins = [
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  BlockQuote,
  Table,
  TableToolbar,
  Image,
  ImageUpload,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  SourceEditing,
  GeneralHtmlSupport,
  FontColor,
  FontBackgroundColor,
  FontSize,
  Alignment,
  Undo,
  Autoformat,
  FileRepository,
];

function RichEditor({ value, onChange }) {
  return (
    <div className="category-ckeditor">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          licenseKey: import.meta.env.VITE_CKEDITOR_LICENSE_KEY || "GPL",

          plugins,
          extraPlugins: [UploadPlugin],

          toolbar: {
            items: [
              "undo",
              "redo",
              "|",
              "sourceEditing",
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "|",
              "fontSize",
              "fontColor",
              "fontBackgroundColor",
              "|",
              "alignment",
              "bulletedList",
              "numberedList",
              "|",
              "link",
              "uploadImage",
              "insertTable",
              "blockQuote",
            ],
            shouldNotGroupWhenFull: false,
          },

          image: {
            toolbar: [
              "imageTextAlternative",
              "toggleImageCaption",
              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",
              "resizeImage",
            ],
          },

          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
          },

          htmlSupport: {
            allow: [
              {
                name: /^(p|div|span|h[1-6]|ul|ol|li|strong|em|u|s|blockquote|a|img|table|thead|tbody|tr|td|th|figure|figcaption)$/,
                attributes: true,
                classes: true,
                styles: true,
              },
            ],
          },
        }}
        onChange={(_event, editor) => onChange(editor.getData())}
      />
    </div>
  );
}

function EditorForm({ initial, category, onSaved, onCancel }) {
  const [form, setForm] = useState(() => initial || empty(category));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field, value) =>
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

  function onTitle(title) {
    setForm((current) => ({
      ...current,
      title,
      slug:
        !initial?._id || current.slug === slugify(current.title)
          ? slugify(title)
          : current.slug,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      const payload = {
        ...form,
        category,
      };

      if (!payload.slug) {
        payload.slug = slugify(payload.title);
      }

      if (!payload.slug) {
        throw new Error("Enter a page title and slug.");
      }

      const text = form.html.replace(/<[^>]+>/g, "").trim();
      const hasImage = /<img\b/i.test(form.html);

      if (!text && !hasImage) {
        throw new Error("Add content before saving.");
      }

      const endpoint = initial?._id
        ? `/admin/content-pages/${initial._id}`
        : "/admin/content-pages";

      const result = await api(endpoint, {
        method: initial?._id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      onSaved(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="admin-panel category-editor-form">
      <div className="category-editor-heading">
        <h3>
          {initial?._id ? "Edit Page" : "Create Page"}
          <span> #{form.order}</span>
        </h3>

        <button type="button" className="admin-secondary" onClick={onCancel}>
          Close editor
        </button>
      </div>

      <div className="category-form-grid">
        <label>
          Page title *
          <input
            required
            maxLength={180}
            value={form.title}
            onChange={(e) => onTitle(e.target.value)}
            placeholder="Enter story page title"
          />
        </label>

        <label>
          Category
          <input readOnly value={categoryLabel(category)} />
        </label>

        <label>
          Page order *
          <input
            type="number"
            required
            min="1"
            max="100000"
            value={form.order}
            onChange={(e) => set("order", Number(e.target.value))}
          />
        </label>

        <label>
          Status
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>

      <h4>Page content</h4>

      <p className="category-editor-note">
        Add formatted text, colors, images and HTML source. Every saved record
        is one website page.
      </p>

      <RichEditor
        key={initial?._id || `new-${category}`}
        value={form.html}
        onChange={(value) => set("html", value)}
      />

      <div className="category-seo-fields">
        <h4>SEO for this page</h4>

        <div className="category-form-grid">
          <label>
            SEO title
            <small>{form.metaTitle.length}/70</small>
            <input
              maxLength={70}
              value={form.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
            />
          </label>

          <label>
            URL slug *
            <input
              required
              maxLength={120}
              value={form.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
            />
          </label>

          <label className="wide">
            Meta description
            <small>{form.metaDescription.length}/170</small>
            <textarea
              rows={3}
              maxLength={170}
              value={form.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
            />
          </label>

          <label>
            SEO image URL
            <input
              type="url"
              value={form.seoImage}
              onChange={(e) => set("seoImage", e.target.value)}
              placeholder="https://..."
            />
          </label>

          <label>
            Search engine visibility
            <select
              value={form.robots}
              onChange={(e) => set("robots", e.target.value)}
            >
              <option value="index,follow">Index, follow</option>
              <option value="noindex,nofollow">Noindex, nofollow</option>
            </select>
          </label>
        </div>

        <p className="category-editor-note">
          Public URL: /{category}?page=
          {form.slug || "your-page-slug"}
        </p>
      </div>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <div className="category-save-row">
        <button type="button" className="admin-secondary" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit" className="admin-primary" disabled={saving}>
          <Save size={16} />
          {saving ? "Saving..." : "Save Page"}
        </button>
      </div>
    </form>
  );
}

export default function AdminContentPages() {
  const [category, setCategory] = useState("trends");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [nextOrder, setNextOrder] = useState(1);

  const [didLoad, setDidLoad] = useState(false);
  const [editor, setEditor] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0);

  const query = useMemo(
    () =>
      new URLSearchParams({
        category,
        status,
        search,
        page: String(page),
      }).toString(),
    [category, status, search, page],
  );

  useEffect(() => {
    let active = true;

    const timeout = setTimeout(() => {
      api(`/admin/content-pages?${query}`)
        .then((data) => {
          if (!active) return;

          setItems(data.items || []);
          setPagination(data.pagination);
          setNextOrder(data.nextOrder || 1);
          setDidLoad(true);
          setError("");

          if (
            !data.items?.length &&
            !search &&
            status === "all" &&
            page === 1
          ) {
            setEditor(
              (current) => current || empty(category, data.nextOrder || 1),
            );
          }

          if (data.pagination?.page !== page) {
            setPage(data.pagination.page);
          }
        })
        .catch((err) => {
          if (active) setError(err.message);
        });
    }, 220);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query, refresh]);

  function changeCategory(value) {
    setCategory(value);
    setEditor(null);
    setPage(1);
    setSearch("");
    setNotice("");
  }

  function changeStatus(value) {
    setStatus(value);
    setPage(1);
  }

  function createNext() {
    setEditor(empty(category, nextOrder));
  }

  async function remove(item) {
    const confirmed = window.confirm(
      `Delete "${item.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await api(`/admin/content-pages/${item._id}`, {
        method: "DELETE",
      });

      setNotice("Page deleted.");
      setError("");
      setEditor(null);
      setRefresh((value) => value + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  function saved() {
    setEditor(null);
    setNotice("Page saved.");
    setRefresh((value) => value + 1);
  }

  return (
    <div className="category-admin">
      <div className="admin-page-intro">
        <div>
          <h2>Category Story Pages</h2>

          <p>
            Manage the center content shown between your existing ad columns.
            Each record is one page.
          </p>
        </div>

        <button type="button" className="admin-primary" onClick={createNext}>
          <Plus size={16} />
          Add Page
        </button>
      </div>

      <div className="category-tabs" role="group">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={cat === category ? "active" : ""}
            onClick={() => changeCategory(cat)}
          >
            {categoryLabel(cat)}
          </button>
        ))}
      </div>

      <div className="admin-toolbar category-toolbar">
        <div className="category-search">
          <Search size={16} />

          <input
            type="search"
            placeholder="Search page title, slug, content"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          aria-label="Filter publication status"
          value={status}
          onChange={(e) => changeStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {notice && (
        <p className="category-notice" role="status">
          {notice}
        </p>
      )}

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-panel admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Category</th>
              <th>Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.title}</strong>
                  <small>
                    /{item.category}?page={item.slug}
                  </small>
                </td>

                <td>{categoryLabel(item.category)}</td>
                <td>{item.order}</td>

                <td>
                  <span className={`category-status ${item.status}`}>
                    {item.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>

                <td>
                  <div className="category-row-actions">
                    <button
                      type="button"
                      className="admin-secondary"
                      title="Edit"
                      onClick={() => setEditor(item)}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      className="admin-secondary"
                      title="Delete"
                      onClick={() => remove(item)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!items.length && (
              <tr>
                <td colSpan={5} className="category-empty-table">
                  <FileText size={25} />
                  <p>No pages found in this category. Add your first page.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination pagination={pagination} onPageChange={setPage} />

      {editor ? (
        <EditorForm
          key={editor._id || `new-${category}-${editor.order}`}
          initial={editor._id ? editor : null}
          category={category}
          onCancel={() => setEditor(null)}
          onSaved={saved}
        />
      ) : (
        <div className="category-add-prompt">
          <button type="button" className="admin-primary" onClick={createNext}>
            <Plus size={16} />
            Add Next Page
          </button>

          <p>
            Each new page gets its own editor, record, order and SEO fields.
          </p>
        </div>
      )}
    </div>
  );
}
