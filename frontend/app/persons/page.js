"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";
import PageLayout from "../../components/PageLayout";

export default function Persons() {
  const [persons, setPersons]   = useState([]);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState({ name: "", phone: "", email: "", notes: "" });
  const [error, setError]       = useState("");

  async function load() {
    const res = await api.get("/persons");
    setPersons(res.data);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", phone: "", email: "", notes: "" });
    setError("");
    setModal(true);
  }

  function openEdit(person) {
    setEditing(person);
    setForm({ name: person.name, phone: person.phone || "", email: person.email || "", notes: person.notes || "" });
    setError("");
    setModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Nome é obrigatório."); return; }
    try {
      if (editing) {
        await api.put(`/persons/${editing.id}`, form);
      } else {
        await api.post("/persons", form);
      }
      setModal(false);
      load();
    } catch { setError("Erro ao salvar cliente."); }
  }

  async function handleDelete(id) {
    if (!confirm("Deseja excluir este cliente?")) return;
    await api.delete(`/persons/${id}`);
    load();
  }

  return (
    <>
      <PageLayout
        title="Clientes"
        subtitle="Cadastro de clientes e informações de contato"
        actions={
          <button className="btn btn-primary btn-sm fw-semibold" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i>Novo Cliente
          </button>
        }
      >
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-0">
            {persons.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-people fs-1 d-block mb-2 opacity-50"></i>
                <p className="mb-0">Nenhum cliente cadastrado.</p>
                <small>Clique em &quot;+ Novo Cliente&quot; para começar.</small>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold small text-uppercase text-muted ps-4">Nome</th>
                      <th className="fw-semibold small text-uppercase text-muted">Telefone</th>
                      <th className="fw-semibold small text-uppercase text-muted">E-mail</th>
                      <th className="fw-semibold small text-uppercase text-muted">Observações</th>
                      <th className="fw-semibold small text-uppercase text-muted pe-4" style={{ width: 140 }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {persons.map(person => (
                      <tr key={person.id}>
                        <td className="fw-semibold ps-4">{person.name}</td>
                        <td className="text-muted small">{person.phone || "–"}</td>
                        <td className="text-muted small">{person.email || "–"}</td>
                        <td className="text-muted small">{person.notes || "–"}</td>
                        <td className="pe-4">
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(person)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(person.id)}>
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
                  {editing ? "Editar Cliente" : "Novo Cliente"}
                </h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Nome <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.name} placeholder="Nome completo" onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Telefone / WhatsApp</label>
                    <input className="form-control" value={form.phone} placeholder="(11) 99999-9999" onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">E-mail</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Observações</label>
                    <textarea className="form-control" rows={3} value={form.notes} placeholder="Alergias, preferências, etc." onChange={e => setForm({ ...form, notes: e.target.value })} />
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
