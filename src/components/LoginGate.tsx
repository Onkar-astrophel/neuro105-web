"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input } from "./ui";

export function LoginGate({ children }: { children: ReactNode }) {
  const { user, loading, error, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div style={centerStyle}>
        <span style={{ color: "var(--fg-muted)", fontSize: 13 }}>Loading…</span>
      </div>
    );
  }

  if (!user) {
    async function handleSubmit(e: FormEvent) {
      e.preventDefault();
      setSubmitting(true);
      try {
        await login(email, password);
      } catch {
        // error surfaced via useAuth().error
      } finally {
        setSubmitting(false);
      }
    }

    return (
      <div style={centerStyle}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)",
            padding: 32,
            width: 320,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Neuro 105</div>
            <div style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>
              Sign in to view the remote dashboard
            </div>
          </div>
          <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>
            Email
            <div style={{ marginTop: 4 }}>
              <Input value={email} onChange={setEmail} placeholder="you@example.com" />
            </div>
          </label>
          <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>
            Password
            <div style={{ marginTop: 4 }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--panel)",
                  color: "var(--fg)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "6px 8px",
                  fontSize: 13,
                }}
              />
            </div>
          </label>
          {error && <div style={{ color: "var(--bad)", fontSize: 12.5 }}>{error}</div>}
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}

const centerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--bg)",
};
