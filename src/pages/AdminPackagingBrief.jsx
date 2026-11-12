import React, { useEffect, useRef, useState } from "react";
import { Save } from "lucide-react";

import { api, friendlyDate } from "../lib/api.js";
import { FormSkeleton, InlineSkeleton } from "../components/Skeletons.jsx";
import { RichEditor } from "./AdminContentPages.jsx";

const DEFAULT_HTML = "<h1>PACKAGING BRIEF</h1><p></p>";

export default function AdminPackagingBrief() {
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    let active = true;

    api("/admin/packaging-brief")
      .then((item) => {
        if (!active) return;
        setHtml(item?.html?.trim() || DEFAULT_HTML);
        setUpdatedAt(item?.updatedAt || null);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const currentHtml = editorRef.current?.getContent() || html || DEFAULT_HTML;
      const item = await api("/admin/packaging-brief", {
        method: "PATCH",
        body: JSON.stringify({ html: currentHtml }),
      });

      setHtml(item.html);
      setUpdatedAt(item.updatedAt || new Date().toISOString());
      setSuccess("Packaging Brief content saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="packaging-brief-admin">
      <div className="admin-page-intro">
        <div>
          <h2>Packaging Brief</h2>
          <p>
            Edit the content displayed on the public Packaging Brief page.
            {updatedAt ? ` Last updated ${friendlyDate(updatedAt)}.` : ""}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="admin-panel packaging-brief-editor-skeleton">
          <FormSkeleton />
        </div>
      ) : (
        <form className="admin-panel packaging-brief-editor-panel" onSubmit={save}>
          <div className="packaging-brief-tinymce">
            <RichEditor
              value={html}
              onInit={(editor) => {
                editorRef.current = editor;
              }}
              onChange={setHtml}
            />
          </div>

          {success && <p className="success-text" role="status">{success}</p>}
          {error && <p className="admin-error" role="alert">{error}</p>}

          <div className="packaging-brief-save-row">
            <button className="admin-primary" type="submit" disabled={saving}>
              {saving ? (
                <InlineSkeleton width="120px" />
              ) : (
                <>
                  <Save size={16} /> Save Packaging Brief
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
