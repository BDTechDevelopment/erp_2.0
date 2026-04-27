"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";
import PageLayout from "../../components/PageLayout";

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [error, setError]     = useState("");

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
        title="Gerenciar Usuários"
        subtitle="Controle os usuários com acesso ao sistema"
        actions={
          <button className="btn btn-primary btn-sm fw-semibold" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i>Novo Usuário
          </button>
        }
      >
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-0">
            {users.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-shield-lock fs-1 d-block mb-2 opacity-50"></i>
                <p className="mb-0">Nenhum usuário cadastrado.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold small text-uppercase text-muted ps-4">Nome</th>
                      <th className="fw-semibold small text-uppercase text-muted">E-mail</th>
                      <th className="fw-semibold small text-uppercase text-muted">Cadastrado em</th>
                      <th className="fw-semibold small text-uppercase text-muted pe-4" style={{ width: 140 }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="fw-semibold ps-4">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 32, height: 32, fontSize: 13 }}
                            >
                              {u.name[0].toUpperCase()}
                            </div>
                            {u.name}
                          </div>
                        </td>
                        <td className="text-muted small">{u.email}</td>
                        <td className="text-muted small">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td className="pe-4">
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(u)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </PageLayout>

      {modal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${editing ? "bi-pencil" : "bi-person-plus"} text-primary me-2`}></i>
                  {editing ? "Editar Usuário" : "Novo Usuário"}
                </h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Nome <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">E-mail <span className="text-danger">*</span></label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Senha {editing ? <span className="text-muted fw-normal">(deixe em branco para não alterar)</span> : <span className="text-danger">*</span>}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.password}
                      placeholder={editing ? "Nova senha (opcional)" : "Senha de acesso"}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary fw-semibold">
                    <i className="bi bi-check-lg me-1"></i>Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
