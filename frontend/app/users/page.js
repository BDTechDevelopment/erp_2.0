"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";
import PageLayout from "../../components/PageLayout";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function load() {
    const res = await api.get("/users");
    setUsers(res.data);
  }

  useEffect(() => { load(); }, []);

  function openEdit(user) {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: "" });
    setError("");
    setModal(true);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", email: "", password: "" });
    setError("");
    setModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError("Nome e e-mail são obrigatórios."); return; }
    if (!editing && !form.password.trim()) { setError("Senha é obrigatória para novo usuário."); return; }
    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, form);
      } else {
        await api.post("/register", form);
      }
      setModal(false);
      load();
    } catch (err) { setError(err.response?.data?.error || "Erro ao salvar."); }
  }

  async function handleDelete(id) {
    if (!confirm("Excluir este usuário? Todos os dados vinculados serão removidos.")) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err) { alert(err.response?.data?.error || "Erro ao excluir."); }
  }

  return (
    <>
      <PageLayout
        title="Gerenciar Logins"
        subtitle="Usuários com acesso ao sistema"
        actions={
          <button className="btn btn-danger btn-sm fw-semibold" onClick={openCreate}>
            + Novo Usuário
          </button>
        }
      >
        <div className="card-body p-4">
          {users.length === 0 ? (
            <div className="alert alert-info mb-0">Nenhum usuário cadastrado.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Cadastrado em</th>
                    <th style={{ width: 160 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="fw-semibold">{u.name}</td>
                      <td className="text-muted">{u.email}</td>
                      <td className="text-muted">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-1" onClick={() => openEdit(u)}>Editar</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageLayout>

      {modal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{ borderRadius: 12 }}>
              <div className="modal-header bg-danger text-white" style={{ borderRadius: "12px 12px 0 0" }}>
                <h5 className="modal-title">{editing ? "Editar Usuário" : "Novo Usuário"}</h5>
                <button className="btn-close btn-close-white" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nome *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">E-mail *</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Senha {editing ? "(deixe em branco para não alterar)" : "*"}
                    </label>
                    <input type="password" className="form-control" value={form.password} placeholder={editing ? "Nova senha (opcional)" : "Senha de acesso"} onChange={e => setForm({ ...form, password: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-danger">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
