/*
 * FILE: screens/FilesScreen.jsx
 * PURPOSE: File browser — folder-first A-Z sorting, filter pills, file preview
 * IMPORTS: useApp from context/AppContext
 * EXPORTS: default FilesScreen
 * RELATED: context/AppContext.jsx (files state), screens/TasksScreen.jsx (doc requirements generate files)
 * LAST SESSION: Initial build — folder-first display, filter pills, empty state
 */

import { useState } from "react";
import { useApp } from "../context/AppContext";

const T = {
  blue1:   "#3D8CC7",
  blue2:   "#5CA4D8",
  blue3:   "#7FBBE6",
  gray1:   "#A0A0A0",
  gray2:   "#C2C2C2",
  confirm: "#4A6B58",
  reject:  "#7A8FA6",
  bg:      "#F5F7FA",
  surface: "#FFFFFF",
  border:  "#E4E7EC",
  textPrimary:   "#1A1D23",
  textSecondary: "#5A606B",
  textMuted:     "#9198A1",
};

const FILE_TYPE_ICONS = {
  pdf:       "📄",
  checklist: "✅",
  photo:     "📷",
  scan:      "🗂️",
};

const FILE_TYPE_LABELS = {
  pdf:       "PDF Form",
  checklist: "Checklist",
  photo:     "Photo",
  scan:      "Document Scan",
};

const FILTERS = [
  { label: "All",     value: "all" },
  { label: "By Task", value: "task" },
  { label: "PDF",     value: "pdf" },
  { label: "Photo",   value: "photo" },
];

// ── File Row ──────────────────────────────────────────────────────────────────
function FileRow({ file }) {
  const icon  = FILE_TYPE_ICONS[file.type]  || "📁";
  const label = FILE_TYPE_LABELS[file.type] || file.type;
  const date  = new Date(file.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 14px", background: T.surface,
      borderBottom: `1px solid ${T.border}`, cursor: "pointer",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: T.blue3 + "30",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: T.textPrimary,
          fontFamily: "DM Sans, sans-serif",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {file.name}
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, fontFamily: "DM Sans, sans-serif", marginTop: 2 }}>
          {label} · {date}
        </div>
      </div>
      <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
        <path d="M1 1l6 5.5L1 12" stroke={T.gray2} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

// ── Folder Group ──────────────────────────────────────────────────────────────
function FolderGroup({ name, files }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Folder header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          padding: "10px 16px", background: T.bg, border: "none",
          cursor: "pointer", borderBottom: `1px solid ${T.border}`,
        }}
      >
        <span style={{ fontSize: 16 }}>{open ? "📂" : "📁"}</span>
        <span style={{
          fontSize: 12, fontWeight: 600, color: T.textSecondary,
          fontFamily: "DM Sans, sans-serif", letterSpacing: "0.3px", flex: 1, textAlign: "left",
        }}>
          {name}
        </span>
        <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "DM Sans, sans-serif" }}>
          {files.length}
        </span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
          style={{ transform: open ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
          <path d="M1 1l4 4 4-4" stroke={T.gray1} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Files */}
      {open && (
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
          {files.sort((a, b) => a.name.localeCompare(b.name)).map(f => (
            <FileRow key={f.id} file={f} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function FilesScreen() {
  const { files } = useApp();
  const [filter, setFilter] = useState("all");

  // Apply filter
  let filtered = files;
  if (filter === "pdf")   filtered = files.filter(f => f.type === "pdf");
  if (filter === "photo") filtered = files.filter(f => f.type === "photo");
  if (filter === "task")  filtered = [...files].sort((a, b) => (a.taskId || "").localeCompare(b.taskId || ""));

  // Group by folder (folder-first A-Z, then ungrouped)
  const folderMap = {};
  const ungrouped = [];

  filtered.forEach(f => {
    if (f.folder) {
      if (!folderMap[f.folder]) folderMap[f.folder] = [];
      folderMap[f.folder].push(f);
    } else {
      ungrouped.push(f);
    }
  });

  const folders = Object.keys(folderMap).sort();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

      {/* Filter pills */}
      <div style={{
        display: "flex", gap: 8, padding: "12px 16px 10px",
        borderBottom: `1px solid ${T.border}`, background: T.surface,
        flexShrink: 0, overflowX: "auto",
      }}>
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            style={{
              padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer",
              fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 500,
              flexShrink: 0,
              background: filter === f.value ? T.blue1 : T.bg,
              color: filter === f.value ? "#fff" : T.textSecondary,
              boxShadow: filter === f.value ? "none" : `0 0 0 1px ${T.border}`,
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* File list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗂️</div>
            <p style={{ fontSize: 13, color: T.textMuted, fontFamily: "DM Sans, sans-serif" }}>
              No files yet.
            </p>
            <p style={{ fontSize: 12, color: T.textMuted, fontFamily: "DM Sans, sans-serif", marginTop: 4 }}>
              Files are created when tasks with document requirements are completed.
            </p>
          </div>
        ) : (
          <>
            {folders.map(folder => (
              <FolderGroup key={folder} name={folder} files={folderMap[folder]} />
            ))}
            {ungrouped.length > 0 && (
              <div style={{ background: T.surface }}>
                {ungrouped.sort((a, b) => a.name.localeCompare(b.name)).map(f => (
                  <FileRow key={f.id} file={f} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
