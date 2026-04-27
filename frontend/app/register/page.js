"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      await api.post("/register", { name, email, password });
      setMsg({ text: "Conta criada com sucesso! Redirecionando...", type: "success" });
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setMsg({ text: "Erro ao criar conta. Tente novamente.", type: "danger" });
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
          <h4 className="fw-bold mb-1">Criar Conta</h4>
          <p className="text-muted small mb-0">Preencha os dados para se registrar</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Nome completo</label>
            <input
              className="form-control"
              placeholder="Seu nome"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
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

          {msg.text && (
            <div className={`alert alert-${msg.type} py-2 small mb-3`}>{msg.text}</div>
          )}

          <button className="btn btn-primary w-100 fw-semibold py-2" disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Criando...</>
              : <><i className="bi bi-person-check me-2"></i>Criar Conta</>
            }
          </button>
        </form>

        <hr className="my-3" />
        <p className="text-center text-muted small mb-0">
          Já tem conta?{" "}
          <a href="/login" className="fw-semibold text-primary text-decoration-none">Fazer login</a>
        </p>

      </div>
    </div>
  );
}
