"use client";

import type { ReactNode } from "react";

export function Card({
  title,
  children,
  right,
}: {
  title?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        padding: "16px",
      }}
    >
      {(title || right) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          {title && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
              }}
            >
              {title}
            </div>
          )}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatPill({
  label,
  value,
  unit,
  tone = "default",
  size = "lg",
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "default" | "good" | "bad" | "warn";
  size?: "lg" | "md";
}) {
  const color =
    tone === "good"
      ? "var(--good)"
      : tone === "bad"
      ? "var(--bad)"
      : tone === "warn"
      ? "var(--warn)"
      : "var(--accent-2)";
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
        }}
      >
        {label}
      </div>
      <div
        className="tabular"
        style={{
          fontFamily: "var(--mono)",
          fontWeight: 700,
          fontSize: size === "lg" ? 30 : 20,
          color,
          lineHeight: 1.1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: size === "lg" ? 16 : 12, marginLeft: 4, color: "var(--fg-muted)" }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function Lamp({ on, label }: { on: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: on ? "var(--good)" : "var(--border)",
          boxShadow: on ? "0 0 8px var(--good)" : "none",
          display: "inline-block",
          flexShrink: 0,
          transition: "background 150ms, box-shadow 150ms",
        }}
      />
      <span style={{ fontSize: 12.5, color: "var(--fg)" }}>{label}</span>
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "good" | "bad" | "warn" }) {
  const color =
    tone === "good" ? "var(--good)" : tone === "bad" ? "var(--bad)" : tone === "warn" ? "var(--warn)" : "var(--fg-muted)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.03em",
        color,
        border: `1px solid ${color}`,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = "default",
  disabled,
  small,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "ghost";
  disabled?: boolean;
  small?: boolean;
  type?: "button" | "submit";
}) {
  const base = {
    fontSize: small ? 12.5 : 13.5,
    fontWeight: 600,
    padding: small ? "5px 10px" : "8px 14px",
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    border: "1px solid var(--border)",
    transition: "background 120ms, border-color 120ms",
  };
  const styles =
    variant === "primary"
      ? { ...base, background: "var(--accent)", color: "white", borderColor: "var(--accent)" }
      : variant === "ghost"
      ? { ...base, background: "transparent", color: "var(--fg)" }
      : { ...base, background: "var(--panel-2)", color: "var(--fg)" };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={styles}>
      {children}
    </button>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  width,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  width?: number | string;
  readOnly?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        width: width ?? "100%",
        background: readOnly ? "var(--panel-2)" : "var(--panel)",
        color: "var(--fg)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "6px 8px",
        fontSize: 13,
        fontFamily: "var(--mono)",
      }}
    />
  );
}
