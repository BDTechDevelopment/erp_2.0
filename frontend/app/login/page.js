"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch {
      setError("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
      <div className="card border-0 shadow rounded-4 p-4" style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo / título */}
        <div className="text-center mb-4">
          <div
            className="bg-primary text-white rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: 52, height: 52 }}
          >
            <i className="bi bi-lightning-charge-fill fs-4"></i>
          </div>
          <h4 className="fw-bold mb-1">ERP System</h4>
          <p className="text-muted small mb-0">Faça login para continuar</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">E-mail</label>
            <input
              type="email"
              className="form-control"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Senha</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 small mb-3">
              <i className="bi bi-exclamation-circle me-1"></i>{error}
            </div>
          )}

          <button className="btn btn-primary w-100 fw-semibold py-2" disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Entrando...</>
              : <><i className="bi bi-box-arrow-in-right me-2"></i>Entrar</>
            }
          </button>
        </form>

        <hr className="my-3" />
        <p className="text-center text-muted small mb-0">
          Não tem conta?{" "}
          <a href="/register" className="fw-semibold text-primary text-decoration-none">Criar conta</a>
        </p>

      </div>
    </div>
  );
}
