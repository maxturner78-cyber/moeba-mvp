import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAFAFA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#FFFFFF",
          border: "1px solid #E8E8E8",
          borderRadius: 10,
          padding: 32,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            color: "#22C55E",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.05em",
            marginBottom: 12,
          }}
        >
          MOEBA
        </div>
        <h1
          className="font-heading"
          style={{ fontSize: 24, marginBottom: 24, color: "#0A0A0A" }}
        >
          Sign in
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{ color: "#DC2626", fontSize: 14 }}>{error}</div>
          )}

          <Button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#22C55E",
              color: "#FFFFFF",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            style={{
              background: "none",
              border: "none",
              color: "#6B7280",
              fontSize: 13,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Forgot password?
          </button>
          {showForgot && (
            <div style={{ marginTop: 12, fontSize: 13, color: "#4B5563" }}>
              Contact your administrator to reset your password.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}