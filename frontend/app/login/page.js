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
      setError("Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #0d6efd, #3a8bfd)"
      }}
    >
      <div className="card shadow-lg p-4" style={{ width: "350px", borderRadius: "15px" }}>
        
        <h3 className="text-center mb-3">ERP System</h3>
        <p className="text-center text-muted">Faça login para continuar</p>

        <form onSubmit={handleLogin}>
          
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="alert alert-danger p-2">{error}</div>
          )}

          <button
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center mt-3">
              Não tem conta?{" "}
            <a href="/register" className="text-primary fw-bold">
                Criar conta
            </a>
          </p>

        </form>
      </div>
    </div>
  );
}