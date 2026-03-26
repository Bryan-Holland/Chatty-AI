/*
 * FILE: screens/HomeScreen.jsx
 * PURPOSE: Chat interface — scripted multi-step task creation flow with suggestion pills
 * IMPORTS: useApp from context/AppContext
 * EXPORTS: default HomeScreen
 * RELATED: context/AppContext.jsx (createTask, users), screens/TasksScreen.jsx
 * LAST SESSION: Initial build — full scripted flow, pill system, greeting, clean-swap ready
 *
 * ARCHITECTURE NOTE: This flow's only job is assembling a task object and calling
 * createTask(). The scripted steps can be swapped for real NLP later without
 * touching anything else. See reference doc Section 3.1.
 */

import { useState, useRef, useEffect } from "react";
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function tomorrowStr() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
function thisWeekStr() {
  const d = new Date(); d.setDate(d.getDate() + 6);
  return d.toISOString().split("T")[0];
}

// ── Chat bubble components ────────────────────────────────────────────────────
function AiBubble({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 12 }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: 14, background: T.blue1,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 13,
      }}>
        💬
      </div>
      <div style={{
        maxWidth: "75%", padding: "10px 13px", borderRadius: "16px 16px 16px 4px",
        background: T.surface, border: `1px solid ${T.border}`,
        fontSize: 13, fontFamily: "DM Sans, sans-serif", color: T.textPrimary,
        lineHeight: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        {text}
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
      <div style={{
        maxWidth: "75%", padding: "10px 13px", borderRadius: "16px 16px 4px 16px",
        background: T.blue1, fontSize: 13, fontFamily: "DM Sans, sans-serif",
        color: "#fff", lineHeight: 1.5,
      }}>
        {text}
      </div>
    </div>
  );
}

function PillRow({ pills, onSelect, selected }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, paddingLeft: 36 }}>
      {pills.map(p => {
        const isSelected = selected === p.value;
        return (
          <button key={p.value} onClick={() => onSelect(p)}
            style={{
              padding: "7px 15px", borderRadius: 20, border: "none", cursor: "pointer",
              fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 500,
              background: isSelected ? T.blue1 : T.surface,
              color: isSelected ? "#fff" : T.blue1,
              boxShadow: isSelected ? "none" : `0 0 0 1.5px ${T.blue2}`,
              transition: "all 0.15s",
            }}>
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Flow step definitions ─────────────────────────────────────────────────────
const STEPS = {
  IDLE:       "IDLE",
  TITLE:      "TITLE",
  ASSIGN:     "ASSIGN",
  DATE:       "DATE",
  TIME:       "TIME",
  DOC:        "DOC",
  CONFIRM:    "CONFIRM",
  DONE:       "DONE",
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { users, createTask, activeLocation } = useApp();
  const [messages, setMessages] = useState([
    { type: "ai", text: `${greeting()}! 👋 I'm Chatty AI. Tell me what needs to get done today, or tap a suggestion below.` },
  ]);
  const [step, setStep]       = useState(STEPS.IDLE);
  const [draft, setDraft]     = useState({});
  const [input, setInput]     = useState("");
  const [pillSel, setPillSel] = useState(null);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Message helpers ─────────────────────────────────────────────────────────
  function addAi(text)  { setMessages(m => [...m, { type: "ai",   text }]); }
  function addUser(text){ setMessages(m => [...m, { type: "user", text }]); }

  // ── Step transitions ────────────────────────────────────────────────────────
  function startFlow() {
    setDraft({});
    setPillSel(null);
    setStep(STEPS.TITLE);
    addAi("What's the task? Give it a title.");
  }

  function handleTitle(text) {
    const title = text.trim();
    if (!title) return;
    addUser(title);
    setDraft(d => ({ ...d, title }));
    setPillSel(null);
    setStep(STEPS.ASSIGN);

    const userPills = users.length > 0
      ? users.map(u => ({ label: u.name, value: u.name }))
      : [];
    userPills.push({ label: "Unassigned", value: "" });
    addAi("Who should this be assigned to?");
    setPillOptions(userPills);
  }

  function handleAssign(value, label) {
    addUser(label);
    setDraft(d => ({ ...d, assignedTo: value }));
    setPillSel(null);
    setStep(STEPS.DATE);
    addAi("When is this due?");
    setPillOptions([
      { label: "Today",     value: todayStr() },
      { label: "Tomorrow",  value: tomorrowStr() },
      { label: "This week", value: thisWeekStr() },
      { label: "No date",   value: "" },
    ]);
  }

  function handleDate(value, label) {
    addUser(label);
    setDraft(d => ({ ...d, dueDate: value }));
    setPillSel(null);
    if (value) {
      setStep(STEPS.TIME);
      addAi("What time?");
      setPillOptions([
        { label: "8:00 AM",  value: "08:00" },
        { label: "12:00 PM", value: "12:00" },
        { label: "3:00 PM",  value: "15:00" },
        { label: "5:00 PM",  value: "17:00" },
        { label: "9:00 PM",  value: "21:00" },
        { label: "No time",  value: "" },
      ]);
    } else {
      skipToDoc();
    }
  }

  function handleTime(value, label) {
    addUser(label);
    setDraft(d => ({ ...d, dueTime: value }));
    setPillSel(null);
    skipToDoc();
  }

  function skipToDoc() {
    setStep(STEPS.DOC);
    addAi("Does this task require a document to be completed?");
    setPillOptions([
      { label: "No document", value: "none" },
      { label: "Checklist",   value: "checklist" },
      { label: "PDF Form",    value: "pdf" },
      { label: "Photo",       value: "photo" },
      { label: "Scan",        value: "scan" },
    ]);
  }

  function handleDoc(value, label) {
    addUser(label);
    const docReq = value === "none" ? null : { type: value };
    setDraft(d => ({ ...d, docRequirement: docReq }));
    setPillSel(null);
    setStep(STEPS.CONFIRM);

    // Build summary
    const d = { ...draft, docRequirement: docReq };
    const lines = [
      `📋 **${d.title}**`,
      d.assignedTo ? `👤 ${d.assignedTo}` : "👤 Unassigned",
      d.dueDate ? `🕐 ${formatDueLabel(d.dueDate, d.dueTime)}` : "🕐 No due date",
      d.docRequirement ? `📎 ${label}` : null,
    ].filter(Boolean);

    addAi(`Here's your task:\n\n${lines.join("\n")}\n\nShall I create it?`);
    setPillOptions([
      { label: "Yes, create it", value: "confirm" },
      { label: "Start over",     value: "restart" },
    ]);
  }

  function handleConfirm(value) {
    if (value === "confirm") {
      createTask(draft);
      addUser("Yes, create it");
      addAi(`Done! ✅ "${draft.title}" has been added to Tasks.`);
    } else {
      addUser("Start over");
      addAi("No problem, let's start fresh.");
    }
    setPillSel(null);
    setPillOptions([]);
    setStep(STEPS.IDLE);
    setDraft({});
  }

  // ── Pill options state ──────────────────────────────────────────────────────
  const [pillOptions, setPillOptions] = useState([
    { label: "Create a task", value: "create" },
    { label: "View tasks",    value: "view" },
  ]);

  // ── Pill tap handler ────────────────────────────────────────────────────────
  function handlePill(pill) {
    setPillSel(pill.value);
    if (step === STEPS.IDLE) {
      if (pill.value === "create") startFlow();
      else if (pill.value === "view") {
        addUser("View tasks");
        addAi("Head to the Tasks tab to see all your tasks.");
      }
      return;
    }
    if (step === STEPS.ASSIGN)  { handleAssign(pill.value, pill.label); return; }
    if (step === STEPS.DATE)    { handleDate(pill.value, pill.label);   return; }
    if (step === STEPS.TIME)    { handleTime(pill.value, pill.label);   return; }
    if (step === STEPS.DOC)     { handleDoc(pill.value, pill.label);    return; }
    if (step === STEPS.CONFIRM) { handleConfirm(pill.value);            return; }
  }

  // ── Text submit ─────────────────────────────────────────────────────────────
  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    if (step === STEPS.IDLE) {
      // Detect create intent
      if (/task|remind|assign|add|create|schedule/i.test(text)) {
        addUser(text);
        startFlow();
      } else {
        addUser(text);
        addAi("I can help you create tasks! Tap \"Create a task\" or describe what needs to get done.");
      }
      return;
    }
    if (step === STEPS.TITLE) { handleTitle(text); return; }

    // For other steps, nudge to use pills
    addUser(text);
    addAi("Tap one of the options above to continue.");
  }

  // ── Keyboard submit ─────────────────────────────────────────────────────────
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>

      {/* Message list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {messages.map((m, i) =>
          m.type === "ai"
            ? <AiBubble key={i} text={m.text} />
            : <UserBubble key={i} text={m.text} />
        )}

        {/* Active pill row */}
        {pillOptions.length > 0 && step !== STEPS.DONE && (
          <PillRow pills={pillOptions} onSelect={handlePill} selected={pillSel} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        flexShrink: 0, padding: "10px 12px 12px",
        background: T.surface, borderTop: `1px solid ${T.border}`,
        display: "flex", gap: 8, alignItems: "flex-end",
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={step === STEPS.TITLE ? "Type the task title…" : step === STEPS.IDLE ? "Tell me what needs to get done…" : "Or type a response…"}
          rows={1}
          style={{
            flex: 1, padding: "9px 12px", borderRadius: 20,
            border: `1px solid ${T.border}`, fontSize: 13,
            fontFamily: "DM Sans, sans-serif", color: T.textPrimary,
            background: T.bg, outline: "none", resize: "none",
            lineHeight: 1.5, maxHeight: 80, overflowY: "auto",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: 38, height: 38, borderRadius: 19, border: "none",
            background: input.trim() ? T.blue1 : T.gray2,
            cursor: input.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background 0.15s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
              stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Format due label for summary ──────────────────────────────────────────────
function formatDueLabel(date, time) {
  if (!date) return "No date";
  const today    = todayStr();
  const tomorrow = tomorrowStr();
  let label = date === today ? "Today" : date === tomorrow ? "Tomorrow" : date;
  if (time) {
    const [h, m] = time.split(":");
    const d = new Date(); d.setHours(+h, +m);
    label += ` at ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  return label;
}
