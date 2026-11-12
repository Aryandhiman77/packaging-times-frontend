import React, { useEffect, useRef, useState } from "react";
import { Save } from "lucide-react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Italic,
  Link,
  List,
  Paragraph,
  SourceEditing,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
  Undo,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

import { api, friendlyDate, maxImageSize } from "../lib/api.js";
import { FormSkeleton, InlineSkeleton } from "../components/Skeletons.jsx";

class PackagingBriefUploadAdapter {
  constructor(loader) {
    this.loader = loader;
    this.controller = new AbortController();
  }

  async upload() {
    const file = await this.loader.file;
    if (!file || file.size > maxImageSize) {
      throw new Error("Image must be 10MB or smaller.");
    }

    const body = new FormData();
    body.append("image", file, file.name);
    const uploaded = await api("/admin/content-images", {
      method: "POST",
      body,
      signal: this.controller.signal,
    });

    return { default: uploaded.url };
  }

  abort() {
    this.controller.abort();
  }
}

function packagingBriefUploadPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) =>
    new PackagingBriefUploadAdapter(loader);
}

const editorConfig = {
  licenseKey: "GPL",
  plugins: [
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
    Alignment,
    FontColor,
    FontBackgroundColor,
    FontSize,
    Image,
    ImageUpload,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    ImageResize,
    Table,
    TableToolbar,
    SourceEditing,
    GeneralHtmlSupport,
    Undo,
  ],
  extraPlugins: [packagingBriefUploadPlugin],
  toolbar: {
    items: [
      "undo",
      "redo",
      "|",
      "heading",
      "|",
      "fontSize",
      "fontColor",
      "fontBackgroundColor",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "alignment",
      "bulletedList",
      "numberedList",
      "|",
      "link",
      "uploadImage",
      "insertTable",
      "blockQuote",
      "sourceEditing",
    ],
    shouldNotGroupWhenFull: true,
  },
  image: {
    toolbar: [
      "imageTextAlternative",
      "toggleImageCaption",
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
    ],
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
  htmlSupport: {
    allow: [{ name: /.*/, attributes: true, classes: true, styles: true }],
  },
};

export default function AdminPackagingBrief() {
  const [html, setHtml] = useState("<h1>PACKAGING BRIEF</h1><p></p>");
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
        setHtml(item?.html || "<h1>PACKAGING BRIEF</h1><p></p>");
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
      const currentHtml = editorRef.current?.getData() || html;
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
          <div className="packaging-brief-ckeditor">
            <CKEditor
              editor={ClassicEditor}
              config={editorConfig}
              data={html}
              onReady={(editor) => {
                editorRef.current = editor;
              }}
              onChange={(_event, editor) => setHtml(editor.getData())}
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
