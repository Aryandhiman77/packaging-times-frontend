import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Newspaper,
  Settings,
  Users,
  Mail,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  api,
  assetUrl,
  adSlots,
  pages,
  maxImageSize,
  friendlyDate,
  defaults,
} from "../lib/api.js";
import AdminPagination from "../components/AdminPagination.jsx";
export function AdminLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api("/auth/me")
      .then(() => setAuthenticated(true))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  async function enter(event) {
    event.preventDefault();

    setError("");
    setBusy(true);

    try {
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      navigate("/admin", {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return <div className="login-screen">Checking session...</div>;
  }

  if (authenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="login-screen min-h-screen">
      <div className="login-panel">
        <img src="/images/packaging-times-logo.jpg" alt="Packaging Times" />

        <span className="admin-eyebrow">Admin workspace</span>

        <h1>Welcome back</h1>

        <p>Sign in to manage banners, articles and enquiries.</p>

        <form onSubmit={enter}>
          <label>
            Email Address
            <input
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
              placeholder="admin@packagingtimes.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              required
              placeholder="Enter password"
            />
          </label>

          <button
            className="admin-primary transition-colors"
            disabled={busy}
            type="submit"
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        <Link to="/" className="back-to-site">
          ← Back to website
        </Link>
      </div>
    </div>
  );
}

const navigation = [
  ["", "Overview", LayoutDashboard],
  ["banners", "Ad Banners", ImageIcon],
  ["news", "News & Articles", Newspaper],
  ["content-pages", "Category Story Pages", Newspaper],
  ["settings", "Website Settings", Settings],
  ["subscribers", "Subscribers", Users],
  ["messages", "Contact Messages", Mail],
  ["advertising-inquiries", "Advertising Inquiries", Mail],
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [auth, setAuth] = useState("checking");

  useEffect(() => {
    api("/auth/me")
      .then(() => setAuth("yes"))
      .catch(() => setAuth("no"));

    const expire = () => setAuth("no");
    window.addEventListener("admin:unauthorized", expire);
    return () => window.removeEventListener("admin:unauthorized", expire);
  }, []);

  async function logout() {
    try {
      await api("/auth/logout", {
        method: "POST",
        body: "{}",
      });
    } finally {
      navigate("/admin/login", {
        replace: true,
      });

      setAuth("no");
    }
  }

  if (auth === "checking") {
    return <div className="login-screen">Checking admin session...</div>;
  }

  if (auth === "no") {
    return <Navigate to="/admin/login" replace />;
  }

  const active = navigation.find(
    ([key]) => location.pathname === "/admin" + (key ? "/" + key : ""),
  );

  return (
    <div className="admin-shell min-h-screen">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-sidebar-brand">
          <img src="/images/packaging-times-logo.jpg" alt="Packaging Times" />

          <span>CONTENT MANAGER</span>
        </Link>

        <nav aria-label="Admin navigation">
          {navigation.map(([key, label, Icon]) => (
            <NavLink key={key} end={!key} to={`/admin${key ? "/" + key : ""}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Link to="/" target="_blank">
            <ExternalLink size={17} />
            View website
          </Link>

          <button onClick={logout}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <small>Packaging Times / Admin</small>

            <h1>{active?.[1] || "Admin Panel"}</h1>
          </div>

          <div className="admin-topbar-actions">
            <span className="admin-mode-pill">Secure Admin</span>
            <button className="admin-secondary" onClick={logout}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </header>

        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function AdminOverview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const stats = [
    ["Banners", "banners", ImageIcon],
    ["News articles", "news", Newspaper],
    ["Subscribers", "subscribers", Users],
    ["Contact Messages", "messages", Mail],
    ["Advertising Inquiries", "advertisingInquiries", Mail],
    ["Unread Contacts", "unreadContacts", Mail],
    ["Unread Advertising", "unreadAdvertising", Mail],
  ];

  return (
    <>
      <div className="admin-page-intro">
        <div>
          <h2>Dashboard overview</h2>

          <p>New enquiries, news and advertisers in one place.</p>
        </div>

        <Link className="admin-primary link-button" to="/admin/banners">
          <Plus size={16} />
          Add a banner
        </Link>
      </div>

      {error && <Notice text={error} bad />}

      <div className="stats-grid">
        {stats.map(([label, key, Icon]) => (
          <div className="stat-card" key={key}>
            <div className="stat-icon">
              <Icon size={21} />
            </div>

            <p>{label}</p>

            <strong>{data?.[key] ?? "—"}</strong>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <h3>Recent enquiries</h3>

        {data?.latest?.length ? (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {data.latest.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.type}</td>

                    <td>
                      {item.status}
                      {item.isRead ? "" : " · unread"}
                    </td>

                    <td>{friendlyDate(item.updatedAt || item.createdAt)}</td>

                    <td>
                      <Link
                        className="text-link"
                        to={
                          item.type === "advertising"
                            ? "/admin/advertising-inquiries"
                            : "/admin/messages"
                        }
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="quiet">No enquiries yet.</p>
        )}
      </div>
    </>
  );
}
function Modal({ title, onClose, children, width = "normal" }) {
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={`admin-modal ${width === "wide" ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <h2>{title}</h2>
          <button aria-label="Close modal" onClick={onClose}>
            <X size={22} />
          </button>
        </header>
        <div className="modal-content">{children}</div>
      </section>
    </div>
  );
}
function Notice({ text, bad = false, onClose }) {
  return text ? (
    <div
      className={`notice ${bad ? "notice-error" : "notice-good"}`}
      role="status"
    >
      <span>{text}</span>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  ) : null;
}
const newBanner = {
  title: "",
  altText: "",
  page: "home",
  slot: "left-1",
  targetUrl: "",
  priority: "0",
  isActive: true,
  startsAt: "",
  endsAt: "",
};
const bannerInputStyles = "admin-control";
const datestr = (v) => (v ? new Date(v).toISOString().slice(0, 10) : "");
function BannerModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          startsAt: datestr(initial.startsAt),
          endsAt: datestr(initial.endsAt),
        }
      : newBanner,
  );
  const [file, setFile] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  function set(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }
  async function save(e) {
    e.preventDefault();
    setError("");
    if (!initial && !file) {
      setError("Please choose a banner image.");
      return;
    }
    if (file && file.size > maxImageSize) {
      setError("Only one image, max 10 MB.");
      return;
    }
    setBusy(true);
    try {
      const data = new FormData();
      for (const key of [
        "title",
        "altText",
        "page",
        "slot",
        "targetUrl",
        "priority",
        "isActive",
        "startsAt",
        "endsAt",
      ])
        data.append(key, String(form[key] ?? ""));
      if (file) data.append("image", file);
      await api(initial ? `/admin/banners/${initial._id}` : "/admin/banners", {
        method: initial ? "PATCH" : "POST",
        body: data,
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={initial ? "Edit Advertisement Banner" : "Add Advertisement Banner"}
      onClose={onClose}
      width="wide"
    >
      <form className="admin-form" onSubmit={save}>
        <div className="admin-form-grid">
          <label>
            Banner Title *
            <input
              className={bannerInputStyles}
              required
              minLength="2"
              maxLength="100"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Company / campaign name"
            />
          </label>
          <label>
            Alt Text
            <input
              className={bannerInputStyles}
              maxLength="160"
              value={form.altText}
              onChange={(e) => set("altText", e.target.value)}
              placeholder="Describe the image"
            />
          </label>
          <label>
            Website Page *
            <select
              className={bannerInputStyles}
              value={form.page}
              onChange={(e) => set("page", e.target.value)}
            >
              <option value="global">All pages (global)</option>
              {pages.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ad Position *
            <select
              className={bannerInputStyles}
              value={form.slot}
              onChange={(e) => set("slot", e.target.value)}
            >
              {adSlots.map((s) => (
                <option key={s} value={s}>
                  {s.replace("-", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="field-span">
            Click-through URL
            <input
              className={bannerInputStyles}
              type="url"
              value={form.targetUrl}
              onChange={(e) => set("targetUrl", e.target.value)}
              placeholder="https://advertiser.com"
            />
          </label>
          <label>
            Start Date (optional)
            <input
              className={bannerInputStyles}
              type="date"
              value={form.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
            />
          </label>
          <label>
            End Date (optional)
            <input
              className={bannerInputStyles}
              type="date"
              value={form.endsAt}
              onChange={(e) => set("endsAt", e.target.value)}
            />
          </label>
          <label>
            Priority
            <input
              className={bannerInputStyles}
              type="number"
              min="0"
              max="1000"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            />
          </label>
          <label className="inline-check">
            <input
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(e) => set("isActive", e.target.checked)}
            />{" "}
            Banner Active
          </label>
        </div>
        <div className="upload-area">
          <span>
            Banner image {initial ? "(leave blank to keep current)" : "*"}
          </span>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFile(selected);
              setError(
                selected?.size > maxImageSize
                  ? "Image must be 10 MB or smaller."
                  : "",
              );
            }}
          />
          <small>
            One image only. Max 10 MB. JPG, PNG, WEBP or GIF. It will fill the
            selected ad slot.
          </small>
          {(preview || initial?.imageUrl) && (
            <img
              src={preview || assetUrl(initial.imageUrl)}
              className="banner-preview"
              alt="Banner preview"
            />
          )}
        </div>
        <Notice text={error} bad />
        <div className="modal-actions">
          <button type="button" className="admin-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="admin-primary transition-colors"
            disabled={busy || Boolean(file && file.size > maxImageSize)}
          >
            <Save size={16} />
            {busy ? "Saving..." : initial ? "Save Changes" : "Create Banner"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function DeleteModal({ kind, title, onCancel, onDelete, busy }) {
  return (
    <Modal title={`Delete ${kind}`} onClose={onCancel}>
      <p>
        Are you sure you want to delete <b>{title}</b>? You can't undo this
        action.
      </p>
      <div className="modal-actions">
        <button className="admin-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="admin-danger" onClick={onDelete} disabled={busy}>
          {busy ? "Deleting..." : "Delete now"}
        </button>
      </div>
    </Modal>
  );
}
export function AdminBanners() {
  const [items, setItems] = useState([]),
    [editor, setEditor] = useState(null),
    [deleting, setDeleting] = useState(null),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [pageFilter, setPageFilter] = useState("all"),
    [statusFilter, setStatusFilter] = useState("all"),
    [page, setPage] = useState(1),
    [pagination, setPagination] = useState(null);
  async function load() {
    try {
      setError("");
      const query = new URLSearchParams({
        page: String(page),
        search,
        sitePage: pageFilter,
        status: statusFilter,
      });
      const result = await api(`/admin/banners?${query}`);
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [page, search, pageFilter, statusFilter]);
  function afterSaved() {
    setEditor(null);
    setStatus("Banner saved successfully.");
    load();
  }
  async function remove() {
    setBusy(true);
    try {
      await api(`/admin/banners/${deleting._id}`, { method: "DELETE" });
      setDeleting(null);
      setStatus("Banner deleted.");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-page-intro">
        <div>
          <h2>Ad Banners</h2>
          <p>
            Manage banners by page and exact position. Changes appear on the
            website.
          </p>
        </div>
        <button
          className="admin-primary transition-colors"
          onClick={() => setEditor({ new: true })}
        >
          <Plus size={17} /> Add Banner
        </button>
      </div>
      <div className="admin-toolbar flex gap-3">
        <input
          className="admin-control"
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search banner title, URL or slot"
          aria-label="Search banners"
        />
        <select
          aria-label="Filter banners by page"
          value={pageFilter}
          onChange={(e) => {
            setPageFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All pages</option>
          <option value="global">Global</option>
          {pages.map((x) => (
            <option key={x.slug} value={x.slug}>
              {x.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter banners by status"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="expired">Expired</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={load} className="admin-secondary">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>
      <Notice text={status} onClose={() => setStatus("")} />
      <Notice text={error} bad onClose={() => setError("")} />
      {items.length ? (
        <div className="banner-table-grid">
          {items.map((item) => (
            <article key={item._id} className="banner-admin-card">
              <div className="banner-admin-image">
                <img
                  src={assetUrl(item.imageUrl)}
                  alt={item.altText || item.title}
                />
              </div>
              <div className="banner-admin-info">
                <div className="banner-meta">
                  <span>{item.page}</span>
                  <span>{item.slot}</span>
                  <span
                    className={`${item.lifecycleStatus || "inactive"}-dot`}
                  >
                    {item.lifecycleStatus || "inactive"}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.targetUrl || "No target URL"}</p>
                <div className="admin-card-actions">
                  <button onClick={() => setEditor(item)}>
                    <Pencil size={15} /> Edit
                  </button>
                  <button
                    className="delete-action"
                    onClick={() => setDeleting(item)}
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-panel empty-admin">
          <ImageIcon size={32} />
          <h3>No banners yet</h3>
          <p>Add the first ad image, choose a page and a slot.</p>
          <button
            className="admin-primary transition-colors"
            onClick={() => setEditor({ new: true })}
          >
            Add first banner
          </button>
        </div>
      )}
      <AdminPagination pagination={pagination} onPageChange={setPage} />
      {editor && (
        <BannerModal
          initial={editor.new ? null : editor}
          onClose={() => setEditor(null)}
          onSaved={afterSaved}
        />
      )}{" "}
      {deleting && (
        <DeleteModal
          kind="Banner"
          title={deleting.title}
          onCancel={() => setDeleting(null)}
          onDelete={remove}
          busy={busy}
        />
      )}
    </>
  );
}
const initialNews = {
  title: "",
  excerpt: "",
  body: "",
  category: "Industry News",
  published: true,
  featured: false,

  metaTitle: "",
  metaDescription: "",
  seoImage: "",
  robots: "index,follow",
};
function NewsModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || initialNews),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(initial ? `/admin/news/${initial._id}` : "/admin/news", {
        method: initial ? "PATCH" : "POST",
        body: JSON.stringify({
          title: form.title,
          excerpt: form.excerpt,
          body: form.body,
          category: form.category,
          published: form.published,
          featured: form.featured,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          seoImage: form.seoImage,
          robots: form.robots,
        }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={initial ? "Edit News Article" : "Add News Article"}
      onClose={onClose}
      width="wide"
    >
      <form onSubmit={save} className="admin-form">
        <label>
          Headline *
          <input
            className="admin-control"
            required
            minLength={5}
            maxLength={180}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </label>
        <label>
          Short Summary *
          <textarea
            className="admin-control"
            required
            minLength={10}
            maxLength={500}
            rows="3"
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
          />
        </label>
        <label>
          Article Content *
          <textarea
            className="admin-control"
            required
            minLength={15}
            maxLength={15000}
            rows="9"
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder="Separate paragraphs with blank lines"
          />
        </label>
        <div className="admin-form-grid">
          <label>
            Category
            <select
              className="admin-control"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {["Industry News", "Flexibles", "Rigid", "Trends", "General"].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </select>
          </label>
          <div className="form-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set("published", e.target.checked)}
              />{" "}
              Published
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />{" "}
              Featured
            </label>
          </div>
        </div>
        <div className="seo-section">
          <h3>Article SEO</h3>

          <label>
            Meta Title (max 70 characters)
            <input
              className="admin-control"
              maxLength={70}
              value={form.metaTitle || ""}
              onChange={(e) => set("metaTitle", e.target.value)}
              placeholder="Leave blank to use article headline"
            />
          </label>

          <label>
            Meta Description (max 170 characters)
            <textarea
              className="admin-control"
              rows={3}
              maxLength={170}
              value={form.metaDescription || ""}
              onChange={(e) => set("metaDescription", e.target.value)}
              placeholder="Leave blank to use the article summary"
            />
          </label>

          <label>
            Social Share Image URL
            <input
              className="admin-control"
              type="url"
              value={form.seoImage || ""}
              onChange={(e) => set("seoImage", e.target.value)}
              placeholder="https://..."
            />
          </label>

          <label>
            Search indexing
            <select
              className="admin-control"
              value={form.robots || "index,follow"}
              onChange={(e) => set("robots", e.target.value)}
            >
              <option value="index,follow">Index, Follow</option>

              <option value="noindex,nofollow">No Index, No Follow</option>
            </select>
          </label>

          <p className="quiet">
            Canonical URL is created automatically from the article slug.
          </p>
        </div>
        <Notice text={error} bad />
        <div className="modal-actions">
          <button type="button" className="admin-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="admin-primary transition-colors"
            disabled={busy}
          >
            <Save size={16} />
            {busy ? "Saving..." : "Save Article"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function AdminNews() {
  const [items, setItems] = useState([]),
    [editor, setEditor] = useState(null),
    [deleting, setDeleting] = useState(null),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("all"),
    [published, setPublished] = useState("all"),
    [featured, setFeatured] = useState("all"),
    [page, setPage] = useState(1),
    [pagination, setPagination] = useState(null);
  async function load() {
    try {
      const query = new URLSearchParams({
        page: String(page),
        search,
        category,
      });
      if (published !== "all") query.set("published", published);
      if (featured !== "all") query.set("featured", featured);
      const result = await api(`/admin/news?${query}`);
      setItems(result.items);
      setPagination(result.pagination);
      if (result.pagination.page !== page) setPage(result.pagination.page);
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [page, search, category, published, featured]);
  async function remove() {
    setBusy(true);
    try {
      await api(`/admin/news/${deleting._id}`, { method: "DELETE" });
      setDeleting(null);
      setStatus("Story deleted.");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-page-intro">
        <div>
          <h2>News & Articles</h2>
          <p>Publish updates for Home, Flexibles, Rigid and Trends.</p>
        </div>
        <button
          className="admin-primary transition-colors"
          onClick={() => setEditor({ new: true })}
        >
          <Plus size={16} /> Add Article
        </button>
      </div>
      <div className="admin-toolbar">
        <input
          className="admin-control"
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search headline, summary or content"
          aria-label="Search articles"
        />
        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          aria-label="Filter articles by category"
        >
          <option value="all">All categories</option>
          {['Industry News', 'Flexibles', 'Rigid', 'Trends', 'General'].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <select
          value={published}
          onChange={(event) => {
            setPublished(event.target.value);
            setPage(1);
          }}
          aria-label="Filter articles by publication status"
        >
          <option value="all">Published + drafts</option>
          <option value="true">Published</option>
          <option value="false">Drafts</option>
        </select>
        <select
          value={featured}
          onChange={(event) => {
            setFeatured(event.target.value);
            setPage(1);
          }}
          aria-label="Filter articles by featured status"
        >
          <option value="all">Featured + regular</option>
          <option value="true">Featured</option>
          <option value="false">Regular</option>
        </select>
      </div>
      <Notice text={status} onClose={() => setStatus("")} />
      <Notice text={error} bad onClose={() => setError("")} />
      <div className="admin-panel admin-table-scroll">
        {items.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Headline</th>
                <th>Category</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr key={x._id}>
                  <td>
                    <b>{x.title}</b>
                    <small>{x.excerpt.slice(0, 65)}...</small>
                  </td>
                  <td>{x.category}</td>
                  <td>{x.published ? "Published" : "Draft"}</td>
                  <td>{friendlyDate(x.updatedAt)}</td>
                  <td>
                    <div className="inline-actions">
                      <button onClick={() => setEditor(x)}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleting(x)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-admin">
            <h3>No articles yet</h3>
            <p>Publish your first packaging news update.</p>
          </div>
        )}
      </div>
      <AdminPagination pagination={pagination} onPageChange={setPage} />
      {editor && (
        <NewsModal
          initial={editor.new ? null : editor}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            setStatus("Article saved.");
            load();
          }}
        />
      )}
      {deleting && (
        <DeleteModal
          kind="Article"
          title={deleting.title}
          onCancel={() => setDeleting(null)}
          onDelete={remove}
          busy={busy}
        />
      )}
    </>
  );
}
const settingsFields = [
  ["tagline", "Website Tagline"],
  ["heroHeading", "Home Page Headline"],
  ["heroIntro", "Homepage Description"],
  ["mailingAddress", "Mailing Address"],
  ["advertisingEmail", "Advertising Email"],
  ["trendingEmail", "News Email"],
  ["x", "X Profile URL"],
  ["facebook", "Facebook URL"],
  ["youtube", "YouTube URL"],
  ["linkedin", "LinkedIn URL"],
];
export function AdminSettings() {
  const [settings, setSettings] = useState(defaults),
    [editor, setEditor] = useState(false),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api("/admin/settings")
      .then((data) => setSettings({ ...defaults, ...data }))
      .catch((e) => setError(e.message));
  }, []);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const updates = Object.fromEntries(
        settingsFields.map(([key]) => [key, settings[key] || ""]),
      );
      const data = await api("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setSettings({ ...defaults, ...data });
      setEditor(false);
      setStatus("Website settings updated.");
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-page-intro">
        <div>
          <h2>Website Settings</h2>
          <p>These details update the public header, footer and homepage.</p>
        </div>
        <button
          className="admin-primary transition-colors"
          onClick={() => setEditor(true)}
        >
          <Pencil size={16} /> Edit Settings
        </button>
      </div>
      <Notice text={status} onClose={() => setStatus("")} />
      <Notice text={error} bad onClose={() => setError("")} />
      <div className="admin-panel settings-summary">
        {settingsFields.map(([key, label]) => (
          <div key={key}>
            <span>{label}</span>
            <strong>{settings[key] || "Not set"}</strong>
          </div>
        ))}
      </div>
      {editor && (
        <Modal
          title="Edit Website Settings"
          onClose={() => setEditor(false)}
          width="wide"
        >
          <form className="admin-form" onSubmit={save}>
            <div className="admin-form-grid">
              {settingsFields.map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    className="admin-control"
                    type={
                      key.toLowerCase().includes("email") ? "email" : "text"
                    }
                    required={[
                      "tagline",
                      "heroHeading",
                      "advertisingEmail",
                      "trendingEmail",
                    ].includes(key)}
                    value={settings[key] || ""}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, [key]: e.target.value }))
                    }
                  />
                </label>
              ))}
            </div>
            <Notice text={error} bad />
            <div className="modal-actions">
              <button
                type="button"
                className="admin-secondary"
                onClick={() => setEditor(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-primary transition-colors"
                disabled={busy}
              >
                <Save size={16} />
                {busy ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
export function AdminSubscribers() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    try {
      setError("");
      const query = new URLSearchParams({ page: String(page), search });
      const result = await api(`/admin/subscribers?${query}`);
      setItems(result.items);
      setPagination(result.pagination);
      if (result.pagination.page !== page) setPage(result.pagination.page);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [page, search]);

  async function unsubscribe(item) {
    if (!window.confirm(`Unsubscribe ${item.email}?`)) return;
    try {
      await api(`/admin/subscribers/${item._id}`, { method: "DELETE" });
      setStatus(`${item.email} unsubscribed.`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="admin-page-intro">
        <div>
          <h2>Email Subscribers</h2>
          <p>Search and manage people subscribed through the website.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-control"
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search name or email"
          aria-label="Search subscribers"
        />
        <button className="admin-secondary" onClick={load}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <Notice text={status} onClose={() => setStatus("")} />
      <Notice text={error} bad onClose={() => setError("")} />

      <div className="admin-panel admin-table-scroll">
        {items.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name || "—"}</td>
                  <td>{item.email}</td>
                  <td>{friendlyDate(item.updatedAt || item.createdAt)}</td>
                  <td>
                    <button
                      className="admin-danger"
                      type="button"
                      onClick={() => unsubscribe(item)}
                    >
                      Unsubscribe
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-admin">
            <h3>No subscribers found</h3>
            <p>Try another search or wait for new subscriptions.</p>
          </div>
        )}
      </div>

      <AdminPagination pagination={pagination} onPageChange={setPage} />
    </>
  );
}
