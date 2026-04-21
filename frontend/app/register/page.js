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
  const [msg, setMsg] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await api.post("/register", {
        name,
        email,
        password
      });

      setMsg("Conta criada com sucesso!");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setMsg("Erro ao criar conta");
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
        
        <h3 className="text-center mb-3">Criar Conta</h3>

        <form onSubmit={handleRegister}>
          
          <div className="mb-3">
            <input
              className="form-control"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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

          {msg && (
            <div className="alert alert-info p-2">{msg}</div>
          )}

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Criando..." : "Criar Conta"}
          </button>
        </form>

        <p className="text-center mt-3">
          Já tem conta?{" "}
          <a href="/login" className="text-primary fw-bold">
            Fazer login
          </a>
        </p>

      </div>
    </div>
  );
}