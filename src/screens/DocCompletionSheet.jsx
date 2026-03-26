/*
 * FILE: screens/DocCompletionSheet.jsx
 * PURPOSE: Doc requirement completion UI (checklist/pdf/photo/scan) + submission + approval flow
 * IMPORTS: useApp from context/AppContext
 * EXPORTS: default DocCompletionSheet
 * RELATED: screens/TasksScreen.jsx (opens this), context/AppContext.jsx (updateTask, files)
 * LAST SESSION: Initial build — all 4 doc types, submit → review → approve/reject/approve-with-edits
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

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1px solid ${T.border}`, fontSize: 13,
  fontFamily: "DM Sans, sans-serif", color: T.textPrimary,
  background: T.surface, outline: "none", boxSizing: "border-box",
};
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: T.textMuted,
  fontFamily: "DM Sans, sans-serif", letterSpacing: "0.5px",
  textTransform: "uppercase", marginBottom: 4,
};

// ── Completion Views ──────────────────────────────────────────────────────────

function ChecklistCompletion({ config, submission, onChange }) {
  const items   = config?.items || [];
  const checked = submission?.checked || {};

  function toggle(item) {
    onChange({ checked: { ...checked, [item]: !checked[item] } });
  }

  const allChecked = items.every(i => checked[i]);

  return (
    <div>
      <p style={{ fontSize: 13, color: T.textSecondary, fontFamily: "DM Sans, sans-serif", marginBottom: 14 }}>
        Check off each item to complete this task.
      </p>
      {items.map((item, i) => (
        <button key={i} onClick={() => toggle(item)} style={{
          display: "flex", alignItems: "center", gap: 12, width: "100%",
          padding: "11px 14px", background: checked[item] ? T.confirm + "10" : T.surface,
          border: `1px solid ${checked[item] ? T.confirm : T.border}`,
          borderRadius: 10, marginBottom: 8, cursor: "pointer", textAlign: "left",
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            background: checked[item] ? T.confirm : "none",
            border: `2px solid ${checked[item] ? T.confirm : T.gray2}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {checked[item] && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4l3.5 3.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span style={{
            fontSize: 13, fontFamily: "DM Sans, sans-serif",
            color: checked[item] ? T.confirm : T.textPrimary,
            textDecoration: checked[item] ? "line-through" : "none",
            fontWeight: checked[item] ? 400 : 500,
          }}>
            {item}
          </span>
        </button>
      ))}
      {allChecked && (
        <p style={{ fontSize: 12, color: T.confirm, fontFamily: "DM Sans, sans-serif", fontWeight: 600, textAlign: "center", marginTop: 8 }}>
          ✓ All items checked
        </p>
      )}
    </div>
  );
}

function PdfCompletion({ config, submission, onChange }) {
  const fields  = config?.fields || [];
  const values  = submission?.values || {};

  function update(id, val) {
    onChange({ values: { ...values, [id]: val } });
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: T.textSecondary, fontFamily: "DM Sans, sans-serif", marginBottom: 14 }}>
        Fill in all fields to complete this task.
      </p>
      {fields.map(field => (
        <div key={field.id} style={{ marginBottom: 14 }}>
          <div style={labelStyle}>{field.label}</div>
          {field.type === "Checkbox" ? (
            <button onClick={() => update(field.id, !values[field.id])} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: values[field.id] ? T.blue1 : "none",
                border: `2px solid ${values[field.id] ? T.blue1 : T.gray2}`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {values[field.id] && (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                    <path d="M1 4l3.5 3.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 13, fontFamily: "DM Sans, sans-serif", color: T.textPrimary }}>
                {values[field.id] ? "Yes" : "No"}
              </span>
            </button>
          ) : field.type === "Signature" ? (
            <div style={{
              height: 70, borderRadius: 8, border: `1px dashed ${T.blue2}`,
              background: T.bg, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }} onClick={() => update(field.id, values[field.id] ? null : "signed")}>
              {values[field.id]
                ? <span style={{ fontSize: 20, fontStyle: "italic", color: T.textPrimary, fontFamily: "Georgia, serif" }}>✓ Signed</span>
                : <span style={{ fontSize: 12, color: T.textMuted, fontFamily: "DM Sans, sans-serif" }}>Tap to sign</span>
              }
            </div>
          ) : (
            <input
              type={field.type === "Date" ? "date" : field.type === "Time" ? "time" : "text"}
              style={inputStyle}
              value={values[field.id] || ""}
              onChange={e => update(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function PhotoCompletion({ config, submission, onChange }) {
  const hasCaptured = !!submission?.captured;

  return (
    <div>
      {config?.instructions && (
        <div style={{
          background: T.blue3 + "20", borderRadius: 10, padding: "10px 14px",
          marginBottom: 14, border: `1px solid ${T.blue3 + "60"}`,
        }}>
          <p style={{ fontSize: 13, color: T.textSecondary, fontFamily: "DM Sans, sans-serif" }}>
            📋 {config.instructions}
          </p>
        </div>
      )}
      <button onClick={() => onChange({ captured: !hasCaptured })} style={{
        width: "100%", height: 140, borderRadius: 12,
        border: `2px dashed ${hasCaptured ? T.confirm : T.blue2}`,
        background: hasCaptured ? T.confirm + "10" : T.bg,
        cursor: "pointer", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <span style={{ fontSize: 32 }}>{hasCaptured ? "✅" : "📷"}</span>
        <span style={{ fontSize: 13, fontFamily: "DM Sans, sans-serif", fontWeight: 500, color: hasCaptured ? T.confirm : T.blue1 }}>
          {hasCaptured ? "Photo captured — tap to retake" : "Tap to take photo"}
        </span>
      </button>
    </div>
  );
}

function ScanCompletion({ config, submission, onChange }) {
  const hasScanned = !!submission?.scanned;

  return (
    <div>
      {config?.documentName && (
        <p style={{ fontSize: 13, color: T.textSecondary, fontFamily: "DM Sans, sans-serif", marginBottom: 14 }}>
          Scan: <strong>{config.documentName}</strong>
        </p>
      )}
      <button onClick={() => onChange({ scanned: !hasScanned })} style={{
        width: "100%", height: 140, borderRadius: 12,
        border: `2px dashed ${hasScanned ? T.confirm : T.blue2}`,
        background: hasScanned ? T.confirm + "10" : T.bg,
        cursor: "pointer", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <span style={{ fontSize: 32 }}>{hasScanned ? "✅" : "🗂️"}</span>
        <span style={{ fontSize: 13, fontFamily: "DM Sans, sans-serif", fontWeight: 500, color: hasScanned ? T.confirm : T.blue1 }}>
          {hasScanned ? "Document scanned — tap to rescan" : "Tap to scan document"}
        </span>
      </button>
    </div>
  );
}

// ── Approval View ─────────────────────────────────────────────────────────────
function ApprovalView({ task, onApprove, onReject, onApproveWithEdits }) {
  const [rejectReason,  setRejectReason]  = useState("");
  const [showReject,    setShowReject]    = useState(false);
  const [showEditForm,  setShowEditForm]  = useState(false);
  const [editNote,      setEditNote]      = useState("");
  const doc = task.docRequirement;

  function renderSubmissionSummary() {
    if (!doc?.submission) return <p style={{ fontSize: 13, color: T.textMuted, fontFamily: "DM Sans, sans-serif" }}>No submission data.</p>;
    const sub = doc.submission;

    if (doc.type === "checklist") {
      const items   = doc.config?.items || [];
      const checked = sub.checked || {};
      return (
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{checked[item] ? "✅" : "⬜"}</span>
              <span style={{ fontSize: 13, fontFamily: "DM Sans, sans-serif", color: T.textPrimary,
                textDecoration: checked[item] ? "line-through" : "none", color: checked[item] ? T.confirm : T.textPrimary }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      );
    }
    if (doc.type === "pdf") {
      const fields = doc.config?.fields || [];
      const values = sub.values || {};
      return (
        <div>
          {fields.map(f => (
            <div key={f.id} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: T.textMuted, fontFamily: "DM Sans, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: 13, fontFamily: "DM Sans, sans-serif", color: T.textPrimary, padding: "8px 12px", background: T.bg, borderRadius: 8, border: `1px solid ${T.border}` }}>
                {f.type === "Checkbox" ? (values[f.id] ? "Yes ✓" : "No") : f.type === "Signature" ? (values[f.id] ? "Signed ✓" : "Not signed") : values[f.id] || "—"}
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (doc.type === "photo")  return <p style={{ fontSize: 13, color: T.confirm, fontFamily: "DM Sans, sans-serif" }}>📷 Photo captured</p>;
    if (doc.type === "scan")   return <p style={{ fontSize: 13, color: T.confirm, fontFamily: "DM Sans, sans-serif" }}>🗂️ Document scanned</p>;
    return null;
  }

  return (
    <div>
      <div style={{ background: T.blue3 + "20", borderRadius: 10, padding: 14, marginBottom: 16, border: `1px solid ${T.blue3 + "60"}` }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: T.blue1, fontFamily: "DM Sans, sans-serif", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Submission
        </p>
        {renderSubmissionSummary()}
      </div>

      {/* Approve */}
      {!showReject && !showEditForm && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={onApprove} style={{
            width: "100%", padding: 12, borderRadius: 10, border: "none",
            background: T.confirm, color: "#fff", fontSize: 14, fontWeight: 600,
            fontFamily: "DM Sans, sans-serif", cursor: "pointer",
          }}>
            ✓ Approve
          </button>
          <button onClick={() => setShowEditForm(true)} style={{
            width: "100%", padding: 12, borderRadius: 10,
            border: `1px solid ${T.blue1}`, background: "none",
            color: T.blue1, fontSize: 14, fontWeight: 600,
            fontFamily: "DM Sans, sans-serif", cursor: "pointer",
          }}>
            ✏️ Approve with Edits
          </button>
          <button onClick={() => setShowReject(true)} style={{
            width: "100%", padding: 12, borderRadius: 10,
            border: `1px solid ${T.reject}`, background: "none",
            color: T.reject, fontSize: 14, fontWeight: 600,
            fontFamily: "DM Sans, sans-serif", cursor: "pointer",
          }}>
            ✕ Reject
          </button>
        </div>
      )}

      {/* Reject form */}
      {showReject && (
        <div>
          <div style={labelStyle}>Reason for rejection</div>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical", marginBottom: 10 }}
            placeholder="Explain why this was rejected…"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowReject(false)} style={{
              flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${T.border}`,
              background: "none", fontSize: 13, fontFamily: "DM Sans, sans-serif",
              color: T.textSecondary, cursor: "pointer",
            }}>Cancel</button>
            <button onClick={() => onReject(rejectReason)} style={{
              flex: 1, padding: 10, borderRadius: 10, border: "none",
              background: T.reject, color: "#fff", fontSize: 13, fontWeight: 600,
              fontFamily: "DM Sans, sans-serif", cursor: "pointer",
            }}>Confirm Reject</button>
          </div>
        </div>
      )}

      {/* Approve with edits form */}
      {showEditForm && (
        <div>
          <div style={labelStyle}>Note for assignee</div>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical", marginBottom: 10 }}
            placeholder="What was changed or needs follow-up…"
            value={editNote}
            onChange={e => setEditNote(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowEditForm(false)} style={{
              flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${T.border}`,
              background: "none", fontSize: 13, fontFamily: "DM Sans, sans-serif",
              color: T.textSecondary, cursor: "pointer",
            }}>Cancel</button>
            <button onClick={() => onApproveWithEdits(editNote)} style={{
              flex: 1, padding: 10, borderRadius: 10, border: "none",
              background: T.blue1, color: "#fff", fontSize: 13, fontWeight: 600,
              fontFamily: "DM Sans, sans-serif", cursor: "pointer",
            }}>Approve</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Sheet ────────────────────────────────────────────────────────────────
export default function DocCompletionSheet({ task, onClose }) {
  const { updateTask, setFiles, files, activeLocationId } = useApp();
  const doc = task.docRequirement;

  // Determine current phase
  const isSubmitted = doc?.approvalStatus === "submitted";
  const isApproved  = doc?.approvalStatus === "approved";
  const isRejected  = doc?.approvalStatus === "rejected";

  const [submission, setSubmission] = useState(doc?.submission || {});
  const phase = isSubmitted ? "review" : isApproved ? "done" : isRejected ? "rejected" : "complete";

  // Validate completeness before allowing submit
  function isComplete() {
    if (doc.type === "checklist") {
      const items = doc.config?.items || [];
      return items.every(i => submission?.checked?.[i]);
    }
    if (doc.type === "pdf") {
      const fields = doc.config?.fields || [];
      const values = submission?.values || {};
      return fields.every(f => {
        if (f.type === "Checkbox") return true; // checkboxes default false = valid
        return values[f.id] && String(values[f.id]).trim();
      });
    }
    if (doc.type === "photo")  return !!submission?.captured;
    if (doc.type === "scan")   return !!submission?.scanned;
    return true;
  }

  function handleSubmit() {
    updateTask(task.id, {
      status: "in_progress",
      docRequirement: {
        ...doc,
        submission,
        approvalStatus: "submitted",
      },
    });
    onClose();
  }

  function handleApprove() {
    generateFile("approved");
    updateTask(task.id, {
      status: "complete",
      docRequirement: { ...doc, approvalStatus: "approved" },
    });
    onClose();
  }

  function handleReject(reason) {
    updateTask(task.id, {
      status: "pending",
      docRequirement: { ...doc, approvalStatus: "rejected", rejectionReason: reason },
    });
    onClose();
  }

  function handleApproveWithEdits(note) {
    generateFile("approved_with_edits");
    updateTask(task.id, {
      status: "complete",
      docRequirement: { ...doc, approvalStatus: "approved", editNote: note },
    });
    onClose();
  }

  function generateFile(approvalStatus) {
    const typeLabels = { pdf: "PDF Form", checklist: "Checklist", photo: "Photo", scan: "Document Scan" };
    const newFile = {
      id:         `file_${Date.now()}`,
      name:       `${task.title} — ${typeLabels[doc.type] || doc.type}`,
      type:       doc.type,
      taskId:     task.id,
      createdBy:  task.assignedTo || "Unknown",
      createdAt:  new Date().toISOString(),
      locationId: activeLocationId,
      folder:     task.department || null,
      approvalStatus,
    };
    setFiles(prev => [...prev, newFile]);
  }

  const titles = { complete: "Complete Task", review: "Review Submission", done: "Approved", rejected: "Rejected" };
  const docTypeLabel = { pdf: "PDF Form", checklist: "Checklist", photo: "Photo", scan: "Document Scan" }[doc?.type] || "";

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40 }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: T.surface, borderRadius: "18px 18px 0 0",
        maxHeight: "88%", display: "flex", flexDirection: "column",
        boxShadow: "0 -4px 30px rgba(0,0,0,0.12)",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.gray2 }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px 4px", flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.blue1, fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}>
            Close
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, fontFamily: "DM Sans, sans-serif" }}>
              {titles[phase]}
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, fontFamily: "DM Sans, sans-serif" }}>{docTypeLabel}</div>
          </div>
          <div style={{ width: 50 }} />
        </div>

        {/* Task name */}
        <div style={{ padding: "8px 16px 12px", flexShrink: 0, borderBottom: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, fontFamily: "DM Sans, sans-serif" }}>{task.title}</p>
          {task.assignedTo && <p style={{ fontSize: 12, color: T.textMuted, fontFamily: "DM Sans, sans-serif", marginTop: 2 }}>👤 {task.assignedTo}</p>}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 24px" }}>

          {phase === "complete" && (
            <>
              {doc.type === "checklist" && <ChecklistCompletion config={doc.config} submission={submission} onChange={setSubmission} />}
              {doc.type === "pdf"       && <PdfCompletion       config={doc.config} submission={submission} onChange={setSubmission} />}
              {doc.type === "photo"     && <PhotoCompletion     config={doc.config} submission={submission} onChange={setSubmission} />}
              {doc.type === "scan"      && <ScanCompletion      config={doc.config} submission={submission} onChange={setSubmission} />}

              <button onClick={handleSubmit} disabled={!isComplete()} style={{
                width: "100%", padding: 13, borderRadius: 10, border: "none",
                background: isComplete() ? T.blue1 : T.gray2,
                color: "#fff", fontSize: 14, fontWeight: 600,
                fontFamily: "DM Sans, sans-serif",
                cursor: isComplete() ? "pointer" : "default",
                marginTop: 16,
              }}>
                Submit for Review
              </button>
            </>
          )}

          {phase === "review" && (
            <ApprovalView
              task={task}
              onApprove={handleApprove}
              onReject={handleReject}
              onApproveWithEdits={handleApproveWithEdits}
            />
          )}

          {phase === "done" && (
            <div style={{ textAlign: "center", paddingTop: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: T.confirm, fontFamily: "DM Sans, sans-serif" }}>Approved</p>
              {doc.editNote && (
                <div style={{ background: T.bg, borderRadius: 10, padding: 12, marginTop: 16, textAlign: "left" }}>
                  <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "DM Sans, sans-serif", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Note</p>
                  <p style={{ fontSize: 13, color: T.textSecondary, fontFamily: "DM Sans, sans-serif" }}>{doc.editNote}</p>
                </div>
              )}
            </div>
          )}

          {phase === "rejected" && (
            <div style={{ textAlign: "center", paddingTop: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>↩️</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: T.reject, fontFamily: "DM Sans, sans-serif" }}>Rejected</p>
              {doc.rejectionReason && (
                <div style={{ background: T.bg, borderRadius: 10, padding: 12, marginTop: 16, textAlign: "left" }}>
                  <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "DM Sans, sans-serif", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Reason</p>
                  <p style={{ fontSize: 13, color: T.textSecondary, fontFamily: "DM Sans, sans-serif" }}>{doc.rejectionReason}</p>
                </div>
              )}
              <button onClick={onClose} style={{
                marginTop: 16, padding: "10px 24px", borderRadius: 10, border: "none",
                background: T.blue1, color: "#fff", fontSize: 13, fontWeight: 600,
                fontFamily: "DM Sans, sans-serif", cursor: "pointer",
              }}>Resubmit</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
