import React, { useEffect, useState } from "react";

import { api, friendlyDate } from "../lib/api.js";
import AdminPagination from "../components/AdminPagination.jsx";

const statusOptions = [
  ["new", "New"],
  ["in_progress", "In progress"],
  ["resolved", "Resolved"],
  ["closed", "Closed"],
];

export default function AdminEnquiries({ type = "messages" }) {
  const title =
    type === "messages" ? "Contact Messages" : "Advertising Inquiries";

  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  async function load() {
    try {
      const query = new URLSearchParams({
        page: String(page),
        search,
        status: statusFilter,
      });
      if (readFilter !== "all") query.set("read", readFilter);
      const data = await api(`/admin/${type}?${query}`, { cache: "no-store" });

      setItems(data.items);
      setPagination(data.pagination);
      if (data.pagination.page !== page) setPage(data.pagination.page);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    setSelected(null);
    setSearch("");
    setStatusFilter("all");
    setReadFilter("all");
    setPage(1);
  }, [type]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [type, page, search, statusFilter, readFilter]);

  async function open(item) {
    setSelected({
      ...item,
      isRead: true,
    });

    setError("");
    setSuccess("");

    if (item.isRead) return;

    try {
      const updated = await api(`/admin/${type}/${item._id}`, {
        method: "PATCH",

        body: JSON.stringify({
          status: item.status,
          adminNote: item.adminNote || "",
          isRead: true,
        }),
      });

      setSelected(updated);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function save() {
    if (!selected) return;

    setSaving(true);
    setError("");

    try {
      const updated = await api(`/admin/${type}/${selected._id}`, {
        method: "PATCH",

        body: JSON.stringify({
          status: selected.status,
          adminNote: selected.adminNote || "",
          isRead: true,
        }),
      });

      setSelected(updated);

      setSuccess("Changes saved.");

      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function retry() {
    if (!selected) return;

    setSaving(true);
    setError("");

    try {
      const updated = await api(`/admin/${type}/${selected._id}/retry-emails`, {
        method: "POST",
        body: "{}",
      });

      setSelected(updated);

      setSuccess("Email delivery status updated.");

      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-page-intro">
        <div>
          <h2>{title}</h2>

          <p>Track new requests, internal notes and email delivery.</p>
        </div>

        <button className="admin-secondary" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-control"
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Name, email, subject or status"
          aria-label="Search requests"
        />
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filter requests by status"
        >
          <option value="all">All statuses</option>
          {statusOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={readFilter}
          onChange={(event) => {
            setReadFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filter requests by read status"
        >
          <option value="all">Read + unread</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>{type === "messages" ? "Subject" : "Placement"}</th>
              <th>Status</th>
              <th>New</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>
                  {item.name}
                  <small>{item.email}</small>
                </td>

                <td>{item.subject || item.placement}</td>

                <td>{item.status.replace("_", " ")}</td>

                <td>{!item.isRead ? "● Unread" : "Read"}</td>

                <td>{friendlyDate(item.updatedAt || item.createdAt)}</td>

                <td>
                  <button
                    className="admin-secondary"
                    onClick={() => open(item)}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!items.length && <p className="quiet">No requests found.</p>}
      </div>

      <AdminPagination pagination={pagination} onPageChange={setPage} />

      {selected && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <section
            className="admin-modal modal-wide"
            role="dialog"
            aria-modal="true"
            aria-label="Edit enquiry"
          >
            <header>
              <h2>
                {selected.name} · {selected.email}
              </h2>

              <button onClick={() => setSelected(null)} aria-label="Close">
                ×
              </button>
            </header>

            <div className="modal-content">
              <div className="admin-form">
                <p>
                  <b>{selected.subject || selected.placement}</b>
                </p>

                {selected.company && <p>Company: {selected.company}</p>}

                {selected.phone && <p>Phone: {selected.phone}</p>}

                {selected.budget && <p>Budget: {selected.budget}</p>}

                <p className="message-cell">{selected.message}</p>

                <label>
                  Status
                  <select
                    className="admin-control"
                    value={selected.status}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        status: e.target.value,
                      })
                    }
                  >
                    {statusOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Internal admin note (not sent to client)
                  <textarea
                    className="admin-control"
                    rows={5}
                    maxLength={5000}
                    value={selected.adminNote || ""}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        adminNote: e.target.value,
                      })
                    }
                  />
                </label>

                <div className="mail-status">
                  <span>
                    Admin email:
                    <strong> {selected.emailAdminStatus}</strong>
                  </span>

                  <span>
                    Client email:
                    <strong> {selected.emailClientStatus}</strong>
                  </span>
                </div>

                {selected.emailAdminError && (
                  <p className="admin-error" role="status">
                    Admin email error: {selected.emailAdminError}
                  </p>
                )}

                {selected.emailClientError && (
                  <p className="admin-error" role="status">
                    Client email error: {selected.emailClientError}
                  </p>
                )}

                {success && (
                  <p className="success-text" role="status">
                    {success}
                  </p>
                )}

                {error && (
                  <p className="admin-error" role="alert">
                    {error}
                  </p>
                )}

                <div className="modal-actions">
                  <button
                    className="admin-secondary"
                    onClick={retry}
                    disabled={saving}
                  >
                    Retry unsent emails
                  </button>

                  <button
                    className="admin-primary"
                    onClick={save}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save tracking"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
