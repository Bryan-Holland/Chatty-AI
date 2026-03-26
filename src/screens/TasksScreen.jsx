/*
 * FILE: screens/TasksScreen.jsx
 * PURPOSE: Task list — active tasks, completed dropdown, FAB, task editor with doc requirements
 * IMPORTS: useApp from context/AppContext
 * EXPORTS: default TasksScreen
 * RELATED: App.jsx (mounts this), context/AppContext.jsx (tasks state)
 * LAST SESSION: Added doc requirement config — type selector + per-type configuration UI
 */

import { useState } from "react";
import { useApp } from "../context/AppContext";
import DocCompletionSheet from "./DocCompletionSheet";

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

function formatDue(date, time) {
  if (!date) return null;
  const d = new Date(date + (time ? `T${time}` : ""));
  const today    = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  const sameDay  = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  let label = sameDay(d, today) ? "Today" : sameDay(d, tomorrow) ? "Tomorrow" : d.toLocaleDateString([], { month: "short", day: "numeric" });
  if (time) label += ` · ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  return label;
}

const STATUS_STYLES = {
  pending:     { bg: T.gray2,   color: T.textSecondary, label: "Pending" },
  in_progress: { bg: T.blue1,   color: "#fff",           label: "In Progress" },
  complete:    { bg: T.confirm, color: "#fff",           label: "Complete" },
  blocked:     { bg: T.reject,  color: "#fff",           label: "Blocked" },
};

const DOC_TYPES = [
  { value: "none",      label: "None",          icon: "—" },
  { value: "checklist", label: "Checklist",     icon: "✅" },
  { value: "pdf",       label: "PDF Form",      icon: "📄" },
  { value: "photo",     label: "Photo",         icon: "📷" },
  { value: "scan",      label: "Document Scan", icon: "🗂️" },
];

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: T.textMuted,
  fontFamily: "DM Sans, sans-serif", letterSpacing: "0.5px",
  textTransform: "uppercase", marginBottom: 4,
};
const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1px solid ${T.border}`, fontSize: 13,
  fontFamily: "DM Sans, sans-serif", color: T.textPrimary,
  background: T.surface, outline: "none", boxSizing: "border-box",
};
const selectStyle = { ...inputStyle, cursor: "pointer" };

// ── Doc Requirement Config ────────────────────────────────────────────────────

function ChecklistConfig({ config, onChange }) {
  const items = config?.items || [""];

  function updateItem(i, val) {
    const next = [...items]; next[i] = val;
    onChange({ items: next });
  }
  function addItem() { onChange({ items: [...items, ""] }); }
  function removeItem(i) {
    const next = items.filter((_, idx) => idx !== i);
    onChange({ items: next.length ? next : [""] });
  }

  return (
    <div>
      <div style={labelStyle}>Checklist Items</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder={`Item ${i + 1}`}
            value={item}
            onChange={e => updateItem(i, e.target.value)}
          />
          {items.length > 1 && (
            <button onClick={() => removeItem(i)} style={{
              background: "none", border: `1px solid ${T.border}`, borderRadius: 8,
              padding: "0 10px", cursor: "pointer", color: T.reject, fontSize: 16,
            }}>×</button>
          )}
        </div>
      ))}
      <button onClick={addItem} style={{
        background: "none", border: `1.5px dashed ${T.blue2}`, borderRadius: 8,
        padding: "7px 14px", fontSize: 12, fontFamily: "DM Sans, sans-serif",
        color: T.blue1, cursor: "pointer", fontWeight: 500, width: "100%", marginTop: 2,
      }}>+ Add item</button>
    </div>
  );
}

function PdfConfig({ config, onChange }) {
  const fields = config?.fields || [];
  const FIELD_TYPES = ["Text", "Date", "Time", "Checkbox", "Signature"];

  function addField() {
    onChange({ fields: [...fields, { id: `f_${Date.now()}`, type: "Text", label: "" }] });
  }
  function updateField(i, key, val) {
    const next = fields.map((f, idx) => idx === i ? { ...f, [key]: val } : f);
    onChange({ fields: next });
  }
  function removeField(i) {
    onChange({ fields: fields.filter((_, idx) => idx !== i) });
  }

  return (
    <div>
      <div style={labelStyle}>Form Fields</div>
      {fields.map((field, i) => (
        <div key={field.id} style={{
          background: T.bg, borderRadius: 8, padding: 10, marginBottom: 8,
          border: `1px solid ${T.border}`,
        }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Field label"
              value={field.label}
              onChange={e => updateField(i, "label", e.target.value)}
            />
            <button onClick={() => removeField(i)} style={{
              background: "none", border: `1px solid ${T.border}`, borderRadius: 8,
              padding: "0 10px", cursor: "pointer", color: T.reject, fontSize: 16,
            }}>×</button>
          </div>
          <select
            style={{ ...selectStyle }}
            value={field.type}
            onChange={e => updateField(i, "type", e.target.value)}
          >
            {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      ))}
      <button onClick={addField} style={{
        background: "none", border: `1.5px dashed ${T.blue2}`, borderRadius: 8,
        padding: "7px 14px", fontSize: 12, fontFamily: "DM Sans, sans-serif",
        color: T.blue1, cursor: "pointer", fontWeight: 500, width: "100%", marginTop: 2,
      }}>+ Add field</button>
    </div>
  );
}

function PhotoConfig({ config, onChange }) {
  return (
    <div>
      <div style={labelStyle}>Instructions (optional)</div>
      <textarea
        style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
        placeholder="e.g. Take a photo of the walk-in temperature display"
        value={config?.instructions || ""}
        onChange={e => onChange({ instructions: e.target.value })}
      />
    </div>
  );
}

function ScanConfig({ config, onChange }) {
  return (
    <div>
      <div style={labelStyle}>Document Name</div>
      <input
        style={inputStyle}
        placeholder="e.g. Health Inspection Form"
        value={config?.documentName || ""}
        onChange={e => onChange({ documentName: e.target.value })}
      />
    </div>
  );
}

function DocRequirementSection({ docReq, onChange }) {
  const type = docReq?.type || "none";

  function handleTypeChange(newType) {
    if (newType === "none") onChange(null);
    else onChange({ type: newType, config: {} });
  }

  function handleConfigChange(config) {
    onChange({ ...docReq, config });
  }

  // Validate: is config sufficiently filled?
  function isConfigured() {
    if (!docReq || docReq.type === "none") return true;
    if (docReq.type === "checklist") {
      const items = docReq.config?.items || [];
      return items.some(i => i.trim());
    }
    if (docReq.type === "pdf") {
      const fields = docReq.config?.fields || [];
      return fields.length > 0 && fields.every(f => f.label.trim());
    }
    return true; // photo and scan are valid with empty config
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={labelStyle}>Document Requirement</div>

      {/* Type selector pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: docReq && type !== "none" ? 12 : 0 }}>
        {DOC_TYPES.map(dt => (
          <button key={dt.value} onClick={() => handleTypeChange(dt.value)} style={{
            padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer",
            fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 500,
            background: type === dt.value ? T.blue1 : T.bg,
            color: type === dt.value ? "#fff" : T.textSecondary,
            boxShadow: type === dt.value ? "none" : `0 0 0 1px ${T.border}`,
          }}>
            {dt.icon} {dt.label}
          </button>
        ))}
      </div>

      {/* Config area */}
      {docReq && type !== "none" && (
        <div style={{
          background: T.bg, borderRadius: 10, padding: 12,
          border: `1px solid ${isConfigured() ? T.border : T.blue2}`,
          marginTop: 8,
        }}>
          {type === "checklist" && <ChecklistConfig config={docReq.config} onChange={handleConfigChange} />}
          {type === "pdf"       && <PdfConfig       config={docReq.config} onChange={handleConfigChange} />}
          {type === "photo"     && <PhotoConfig     config={docReq.config} onChange={handleConfigChange} />}
          {type === "scan"      && <ScanConfig      config={docReq.config} onChange={handleConfigChange} />}

          {!isConfigured() && (
            <p style={{ fontSize: 11, color: T.blue1, marginTop: 8, fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}>
              ⚠ Configure this requirement before saving.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onPress, onComplete }) {
  const s   = STATUS_STYLES[task.status] || STATUS_STYLES.pending;
  const due = formatDue(task.dueDate, task.dueTime);
  const docType = DOC_TYPES.find(d => d.value === task.docRequirement?.type);
  const hasDoc  = docType && docType.value !== "none";
  const approvalStatus = task.docRequirement?.approvalStatus;

  const completeLabel = approvalStatus === "submitted" ? "Review" : approvalStatus === "approved" ? "Approved" : "Complete";
  const completeBg    = approvalStatus === "approved" ? T.confirm : approvalStatus === "submitted" ? T.blue2 : T.blue1;

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "12px 14px", marginBottom: 8,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
        <button onClick={() => onPress(task)} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", flex: 1,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, fontFamily: "DM Sans, sans-serif", lineHeight: 1.3 }}>
            {task.title}
          </span>
        </button>
        <span style={{
          flexShrink: 0, fontSize: 10, fontWeight: 600, padding: "3px 9px",
          borderRadius: 20, background: s.bg, color: s.color, fontFamily: "DM Sans, sans-serif",
        }}>
          {s.label}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginBottom: hasDoc ? 10 : 0 }}>
        {task.assignedTo && (
          <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: "DM Sans, sans-serif" }}>👤 {task.assignedTo}</span>
        )}
        {due && (
          <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: "DM Sans, sans-serif" }}>🕐 {due}</span>
        )}
        {hasDoc && (
          <span style={{
            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20,
            background: T.blue3 + "40", color: T.blue1, fontFamily: "DM Sans, sans-serif",
          }}>
            {docType.icon} {docType.label}
          </span>
        )}
        {task.workflowId && (
          <span style={{
            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20,
            background: T.gray2 + "80", color: T.textSecondary, fontFamily: "DM Sans, sans-serif",
          }}>⛓ Workflow</span>
        )}
      </div>
      {hasDoc && task.status !== "complete" && (
        <button onClick={() => onComplete(task)} style={{
          width: "100%", padding: "7px", borderRadius: 8, border: "none",
          background: completeBg, color: "#fff", fontSize: 12, fontWeight: 600,
          fontFamily: "DM Sans, sans-serif", cursor: "pointer",
        }}>
          {completeLabel}
        </button>
      )}
    </div>
  );
}

// ── Task Editor Sheet ─────────────────────────────────────────────────────────
function TaskEditorSheet({ task, onClose }) {
  const { users, createTask, updateTask, deleteTask, deptOptions, addDeptOption } = useApp();
  const isNew = !task?.id;

  const [form, setForm] = useState({
    title:          task?.title          || "",
    assignedTo:     task?.assignedTo     || "",
    dueDate:        task?.dueDate        || "",
    dueTime:        task?.dueTime        || "",
    department:     task?.department     || "",
    notes:          task?.notes          || "",
    status:         task?.status         || "pending",
    docRequirement: task?.docRequirement || null,
  });

  const [customDept,    setCustomDept]    = useState("");
  const [showDeptInput, setShowDeptInput] = useState(false);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function isDocConfigured() {
    const doc = form.docRequirement;
    if (!doc || doc.type === "none") return true;
    if (doc.type === "checklist") return (doc.config?.items || []).some(i => i.trim());
    if (doc.type === "pdf") {
      const fields = doc.config?.fields || [];
      return fields.length > 0 && fields.every(f => f.label.trim());
    }
    return true;
  }

  const canSave = form.title.trim() && isDocConfigured();

  function handleSave() {
    if (!canSave) return;
    if (isNew) createTask(form);
    else updateTask(task.id, form);
    onClose();
  }

  function handleDelete() {
    if (task?.id) deleteTask(task.id);
    onClose();
  }

  function handleAddDept() {
    if (customDept.trim()) {
      addDeptOption(customDept.trim());
      set("department", customDept.trim());
      setCustomDept(""); setShowDeptInput(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40 }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: T.surface, borderRadius: "18px 18px 0 0",
        maxHeight: "90%", display: "flex", flexDirection: "column",
        boxShadow: "0 -4px 30px rgba(0,0,0,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.gray2 }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px 12px", flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.blue1, fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}>
            Cancel
          </button>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, fontFamily: "DM Sans, sans-serif" }}>
            {isNew ? "New Task" : "Edit Task"}
          </span>
          <button onClick={handleSave} style={{
            background: canSave ? T.blue1 : T.gray2, color: "#fff",
            border: "none", borderRadius: 8, padding: "6px 14px",
            fontSize: 13, fontWeight: 600, fontFamily: "DM Sans, sans-serif",
            cursor: canSave ? "pointer" : "default",
          }}>Save</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>

          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>Title *</div>
            <input style={inputStyle} placeholder="Task title" value={form.title}
              onChange={e => set("title", e.target.value)} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>Assigned To</div>
            <select style={selectStyle} value={form.assignedTo} onChange={e => set("assignedTo", e.target.value)}>
              <option value="">— Unassigned —</option>
              {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <div style={labelStyle}>Due Date</div>
              <input type="date" style={inputStyle} value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
            </div>
            <div>
              <div style={labelStyle}>Due Time</div>
              <input type="time" style={inputStyle} value={form.dueTime} onChange={e => set("dueTime", e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>Department</div>
            <select style={selectStyle} value={form.department} onChange={e => {
              if (e.target.value === "__new__") setShowDeptInput(true);
              else set("department", e.target.value);
            }}>
              <option value="">— None —</option>
              {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
              <option value="__new__">+ Add new…</option>
            </select>
            {showDeptInput && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="New department"
                  value={customDept} onChange={e => setCustomDept(e.target.value)} />
                <button onClick={handleAddDept} style={{
                  background: T.blue1, color: "#fff", border: "none", borderRadius: 8,
                  padding: "0 14px", fontSize: 13, fontFamily: "DM Sans, sans-serif", cursor: "pointer",
                }}>Add</button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>Status</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(STATUS_STYLES).map(([key, s]) => (
                <button key={key} onClick={() => set("status", key)} style={{
                  padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 500,
                  background: form.status === key ? s.bg : T.bg,
                  color: form.status === key ? s.color : T.textSecondary,
                  outline: form.status === key ? `2px solid ${s.bg}` : "none",
                  outlineOffset: 1,
                }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Doc Requirement */}
          <DocRequirementSection
            docReq={form.docRequirement}
            onChange={val => set("docRequirement", val)}
          />

          <div style={{ marginBottom: 20 }}>
            <div style={labelStyle}>Notes</div>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              placeholder="Optional notes…" value={form.notes}
              onChange={e => set("notes", e.target.value)} />
          </div>

          {!isNew && (
            <button onClick={handleDelete} style={{
              width: "100%", padding: "10px", borderRadius: 10,
              border: `1px solid ${T.reject}`, background: "none",
              color: T.reject, fontSize: 13, fontWeight: 600,
              fontFamily: "DM Sans, sans-serif", cursor: "pointer",
            }}>Delete Task</button>
          )}
        </div>
      </div>
    </>
  );
}

export default function TasksScreen() {
  const { tasks } = useApp();
  const [editorTask,      setEditorTask]      = useState(null);
  const [completionTask,  setCompletionTask]  = useState(null);
  const [completedOpen,   setCompletedOpen]   = useState(false);

  const active = tasks
    .filter(t => t.status !== "complete")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  const completed = tasks.filter(t => t.status === "complete");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 80px" }}>

        {active.length === 0 && completed.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <p style={{ fontSize: 13, color: T.textMuted, fontFamily: "DM Sans, sans-serif" }}>No tasks yet.</p>
            <p style={{ fontSize: 12, color: T.textMuted, fontFamily: "DM Sans, sans-serif", marginTop: 4 }}>Tap + to create one.</p>
          </div>
        )}

        {active.map(task => (
          <TaskCard key={task.id} task={task}
            onPress={t => setEditorTask(t)}
            onComplete={t => setCompletionTask(t)}
          />
        ))}

        {completed.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <button onClick={() => setCompletedOpen(o => !o)} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              background: "none", border: "none", cursor: "pointer", padding: "8px 2px", marginBottom: 8,
            }}>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
                style={{ transform: completedOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
                <path d="M1 1l5 5 5-5" stroke={T.gray1} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.gray1, fontFamily: "DM Sans, sans-serif", letterSpacing: "0.4px" }}>
                COMPLETED ({completed.length})
              </span>
            </button>
            {completedOpen && completed.map(task => (
              <TaskCard key={task.id} task={task}
                onPress={t => setEditorTask(t)}
                onComplete={t => setCompletionTask(t)}
              />
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setEditorTask({})} style={{
        position: "absolute", bottom: 20, right: 16,
        width: 52, height: 52, borderRadius: 26,
        background: T.blue1, border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 16px rgba(61,140,199,0.45)",
        fontSize: 26, color: "#fff", lineHeight: 1,
      }}>+</button>

      {editorTask !== null && (
        <TaskEditorSheet
          task={Object.keys(editorTask).length === 0 ? null : editorTask}
          onClose={() => setEditorTask(null)}
        />
      )}

      {completionTask !== null && (
        <DocCompletionSheet
          task={completionTask}
          onClose={() => setCompletionTask(null)}
        />
      )}
    </div>
  );
}
