/*
 * FILE: screens/SettingsSheet.jsx
 * PURPOSE: Bottom sheet with Users tab (add/edit/remove) and Workflows tab (create/edit/delete)
 * IMPORTS: useApp from context/AppContext, useAuth for logout
 * EXPORTS: default SettingsSheet
 * RELATED: App.jsx (mounts this), context/AppContext.jsx (users, workflows, titleOptions, deptOptions)
 * SESSION 7: Added account info section with logout button
 */

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../hooks/useAuth";

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

// ── Account Section (Logout) ──────────────────────────────────────────────────
function AccountSection() {
  const { user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
      setLoggingOut(true);
      await signOut();
    }
  }

  return (
    <div style={{
      padding: '16px 20px',
      borderBottom: `1px solid ${T.border}`,
      background: '#FAFBFC',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontSize: 11,
            color: T.textMuted,
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 500,
            fontFamily: "DM Sans, sans-serif",
          }}>
            Signed in as
          </div>
          <div style={{
            fontSize: 13,
            color: T.textPrimary,
            fontWeight: 500,
            fontFamily: "DM Sans, sans-serif",
          }}>
            {user?.email}
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            padding: '6px 14px',
            background: 'white',
            border: `1px solid ${T.border}`,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            color: T.reject,
            cursor: loggingOut ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}

// ── User Form ─────────────────────────────────────────────────────────────────
function UserForm({ user, onSave, onCancel, onDelete, titleOptions, deptOptions, addTitleOption, addDeptOption }) {
  const isNew = !user?.id;
  const [form, setForm] = useState({
    name:       user?.name       || "",
    title:      user?.title      || "",
    department: user?.department || "",
  });
  const [customTitle,     setCustomTitle]     = useState("");
  const [customDept,      setCustomDept]      = useState("");
  const [showTitleInput,  setShowTitleInput]  = useState(false);
  const [showDeptInput,   setShowDeptInput]   = useState(false);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleAddTitle() {
    if (customTitle.trim()) {
      addTitleOption(customTitle.trim());
      set("title", customTitle.trim());
      setCustomTitle(""); setShowTitleInput(false);
    }
  }
  function handleAddDept() {
    if (customDept.trim()) {
      addDeptOption(customDept.trim());
      set("department", customDept.trim());
      setCustomDept(""); setShowDeptInput(false);
    }
  }

  return (
    <div style={{ background: T.bg, borderRadius: 12, padding: 14, marginBottom: 10, border: `1px solid ${T.border}` }}>
      <div style={{ marginBottom: 10 }}>
        <div style={labelStyle}>Name *</div>
        <input style={inputStyle} placeholder="Full name" value={form.name} onChange={e => set("name", e.target.value)} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={labelStyle}>Title</div>
        <select style={selectStyle} value={form.title} onChange={e => {
          if (e.target.value === "__new__") setShowTitleInput(true);
          else set("title", e.target.value);
        }}>
          <option value="">— None —</option>
          {titleOptions.map(t => <option key={t} value={t}>{t}</option>)}
          <option value="__new__">+ Add new…</option>
        </select>
        {showTitleInput && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="New title" value={customTitle} onChange={e => setCustomTitle(e.target.value)} />
            <button onClick={handleAddTitle} style={{ background: T.blue1, color: "#fff", border: "none", borderRadius: 8, padding: "0 14px", fontSize: 13, fontFamily: "DM Sans, sans-serif", cursor: "pointer" }}>Add</button>
          </div>
        )}
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
            <input style={{ ...inputStyle, flex: 1 }} placeholder="New department" value={customDept} onChange={e => setCustomDept(e.target.value)} />
            <button onClick={handleAddDept} style={{ background: T.blue1, color: "#fff", border: "none", borderRadius: 8, padding: "0 14px", fontSize: 13, fontFamily: "DM Sans, sans-serif", cursor: "pointer" }}>Add</button>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, fontFamily: "DM Sans, sans-serif", color: T.textSecondary, cursor: "pointer" }}>Cancel</button>
        {!isNew && (
          <button onClick={() => onDelete(user.id)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.reject}`, background: "none", fontSize: 13, fontFamily: "DM Sans, sans-serif", color: T.reject, cursor: "pointer" }}>Remove</button>
        )}
        <button onClick={() => form.name.trim() && onSave(form)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: form.name.trim() ? T.blue1 : T.gray2, fontSize: 13, fontFamily: "DM Sans, sans-serif", color: "#fff", cursor: form.name.trim() ? "pointer" : "default", fontWeight: 600 }}>
          {isNew ? "Add User" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const { users, addUser, updateUser, removeUser, titleOptions, deptOptions, addTitleOption, addDeptOption } = useApp();
  const [editingId, setEditingId] = useState(null);

  function handleSave(form) {
    if (editingId === "new") addUser(form);
    else updateUser(editingId, form);
    setEditingId(null);
  }

  return (
    <div style={{ padding: "0 16px" }}>
      {users.map(u => (
        <div key={u.id}>
          {editingId === u.id ? (
            <UserForm user={u} onSave={handleSave} onCancel={() => setEditingId(null)} onDelete={id => { removeUser(id); setEditingId(null); }}
              titleOptions={titleOptions} deptOptions={deptOptions} addTitleOption={addTitleOption} addDeptOption={addDeptOption} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, fontFamily: "DM Sans, sans-serif" }}>{u.name}</div>
                <div style={{ fontSize: 12, color: T.textSecondary, fontFamily: "DM Sans, sans-serif", marginTop: 2 }}>{[u.title, u.department].filter(Boolean).join(" · ") || "No title"}</div>
              </div>
              <button onClick={() => setEditingId(u.id)} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontFamily: "DM Sans, sans-serif", color: T.blue1, cursor: "pointer", fontWeight: 500 }}>Edit</button>
            </div>
          )}
        </div>
      ))}

      {editingId === "new" ? (
        <UserForm user={null} onSave={handleSave} onCancel={() => setEditingId(null)} onDelete={() => {}}
          titleOptions={titleOptions} deptOptions={deptOptions} addTitleOption={addTitleOption} addDeptOption={addDeptOption} />
      ) : (
        <button onClick={() => setEditingId("new")} style={{ width: "100%", padding: "11px", borderRadius: 10, border: `1.5px dashed ${T.blue2}`, background: "none", fontSize: 13, fontWeight: 600, fontFamily: "DM Sans, sans-serif", color: T.blue1, cursor: "pointer", marginTop: 4 }}>
          + Add User
        </button>
      )}
    </div>
  );
}

// ── Workflow Editor ───────────────────────────────────────────────────────────
function WorkflowEditor({ workflow, onSave, onCancel, onDelete }) {
  const { users } = useApp();
  const isNew = !workflow?.id;
  const [name, setName] = useState(workflow?.name || "");
  const [steps, setSteps] = useState(workflow?.steps || [{ id: `step_${Date.now()}`, title: "", assignedTo: "" }]);

  function addStep() {
    setSteps(prev => [...prev, { id: `step_${Date.now()}`, title: "", assignedTo: "" }]);
  }
  function removeStep(i) {
    setSteps(prev => prev.filter((_, idx) => idx !== i));
  }
  function updateStep(i, key, val) {
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s));
  }

  const canSave = name.trim() && steps.every(s => s.title.trim());

  return (
    <div style={{ background: T.bg, borderRadius: 12, padding: 14, marginBottom: 10, border: `1px solid ${T.border}` }}>
      <div style={{ marginBottom: 14 }}>
        <div style={labelStyle}>Workflow Name *</div>
        <input style={inputStyle} placeholder="e.g., Daily Opening Tasks" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div style={labelStyle}>Steps *</div>
      {steps.map((step, i) => (
        <div key={step.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: T.blue1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: "#fff", fontWeight: 700, fontFamily: "DM Sans, sans-serif" }}>{i + 1}</span>
            </div>
            <input
              style={{ ...inputStyle, flex: 1, padding: "7px 10px" }}
              placeholder="Step title *"
              value={step.title}
              onChange={e => updateStep(i, "title", e.target.value)}
            />
            {steps.length > 1 && (
              <button onClick={() => removeStep(i)} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: T.reject, fontSize: 14 }}>×</button>
            )}
          </div>
          <select style={{ ...selectStyle, fontSize: 12, padding: "6px 10px" }} value={step.assignedTo} onChange={e => updateStep(i, "assignedTo", e.target.value)}>
            <option value="">— Assign to (optional) —</option>
            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
      ))}

      <button onClick={addStep} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1.5px dashed ${T.blue2}`, background: "none", fontSize: 12, fontFamily: "DM Sans, sans-serif", color: T.blue1, cursor: "pointer", fontWeight: 500, marginBottom: 14 }}>
        + Add Step
      </button>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, fontFamily: "DM Sans, sans-serif", color: T.textSecondary, cursor: "pointer" }}>Cancel</button>
        {!isNew && (
          <button onClick={() => onDelete(workflow.id)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.reject}`, background: "none", fontSize: 13, fontFamily: "DM Sans, sans-serif", color: T.reject, cursor: "pointer" }}>Delete</button>
        )}
        <button onClick={() => canSave && onSave({ name, steps })} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: canSave ? T.blue1 : T.gray2, fontSize: 13, fontFamily: "DM Sans, sans-serif", color: "#fff", cursor: canSave ? "pointer" : "default", fontWeight: 600 }}>
          {isNew ? "Create" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ── Workflows Tab ─────────────────────────────────────────────────────────────
function WorkflowsTab() {
  const { workflows, setWorkflows, activeLocationId } = useApp();
  const [editingId, setEditingId] = useState(null);

  function handleSave(form) {
    if (editingId === "new") {
      const newWf = { id: `wf_${Date.now()}`, locationId: activeLocationId, createdAt: new Date().toISOString(), ...form };
      setWorkflows(prev => [...prev, newWf]);
    } else {
      setWorkflows(prev => prev.map(w => w.id === editingId ? { ...w, ...form } : w));
    }
    setEditingId(null);
  }

  function handleDelete(id) {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    setEditingId(null);
  }

  return (
    <div style={{ padding: "0 16px" }}>
      {workflows.length === 0 && editingId !== "new" && (
        <p style={{ fontSize: 13, color: T.textMuted, fontFamily: "DM Sans, sans-serif", marginBottom: 14 }}>
          No workflows yet. Create one to reuse common task sequences.
        </p>
      )}

      {workflows.map(wf => (
        <div key={wf.id}>
          {editingId === wf.id ? (
            <WorkflowEditor workflow={wf} onSave={handleSave} onCancel={() => setEditingId(null)} onDelete={handleDelete} />
          ) : (
            <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 8, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, fontFamily: "DM Sans, sans-serif" }}>{wf.name}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, fontFamily: "DM Sans, sans-serif", marginTop: 2 }}>
                    {wf.steps?.length || 0} step{wf.steps?.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <button onClick={() => setEditingId(wf.id)} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontFamily: "DM Sans, sans-serif", color: T.blue1, cursor: "pointer", fontWeight: 500 }}>Edit</button>
              </div>
              {/* Step preview */}
              {wf.steps?.length > 0 && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: "8px 14px" }}>
                  {wf.steps.map((step, i) => (
                    <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < wf.steps.length - 1 ? 6 : 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 9, background: T.blue3 + "60", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: T.blue1, fontWeight: 700, fontFamily: "DM Sans, sans-serif" }}>{i + 1}</span>
                      </div>
                      <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: "DM Sans, sans-serif" }}>{step.title}</span>
                      {step.assignedTo && <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "DM Sans, sans-serif" }}>· {step.assignedTo}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {editingId === "new" ? (
        <WorkflowEditor workflow={null} onSave={handleSave} onCancel={() => setEditingId(null)} onDelete={() => {}} />
      ) : (
        <button onClick={() => setEditingId("new")} style={{ width: "100%", padding: "11px", borderRadius: 10, border: `1.5px dashed ${T.blue2}`, background: "none", fontSize: 13, fontWeight: 600, fontFamily: "DM Sans, sans-serif", color: T.blue1, cursor: "pointer", marginTop: 4 }}>
          + New Workflow
        </button>
      )}
    </div>
  );
}

// ── Main Sheet ────────────────────────────────────────────────────────────────
export default function SettingsSheet({ onClose }) {
  const [tab, setTab] = useState("users");

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40 }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: T.surface, borderRadius: "18px 18px 0 0", zIndex: 50,
        maxHeight: "85%", display: "flex", flexDirection: "column",
        boxShadow: "0 -4px 30px rgba(0,0,0,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.gray2 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px 12px", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary, fontFamily: "DM Sans, sans-serif" }}>Settings</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: T.gray1, lineHeight: 1 }}>×</button>
        </div>
        
        {/* Account section with logout */}
        <AccountSection />
        
        <div style={{ display: "flex", padding: "12px 16px 0", gap: 8, marginBottom: 16, flexShrink: 0 }}>
          {["users", "workflows"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer",
              fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 500,
              background: tab === t ? T.blue1 : T.bg,
              color: tab === t ? "#fff" : T.textSecondary,
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
          {tab === "users" ? <UsersTab /> : <WorkflowsTab />}
        </div>
      </div>
    </>
  );
}
