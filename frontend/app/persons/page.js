"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";
import PageLayout from "../../components/PageLayout";

export default function Persons() {
  const [persons, setPersons] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [error, setError] = useState("");

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
        color="#0dcaf0"
        actions={
          <button className="btn btn-primary btn-sm fw-semibold" onClick={openCreate}>
            + Novo Cliente
          </button>
        }
      >
        <div className="card-body p-4">
          {persons.length === 0 ? (
            <div className="alert alert-info mb-0">Nenhum cliente cadastrado. Clique em &quot;+ Novo Cliente&quot; para começar.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                    <th>Observações</th>
                    <th style={{ width: 160 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {persons.map(person => (
                    <tr key={person.id}>
                      <td className="fw-semibold">{person.name}</td>
                      <td>{person.phone || "–"}</td>
                      <td className="text-muted">{person.email || "–"}</td>
                      <td className="text-muted">{person.notes || "–"}</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-1" onClick={() => openEdit(person)}>Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(person.id)}>Excluir</button>
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
              <div className="modal-header bg-primary text-white" style={{ borderRadius: "12px 12px 0 0" }}>
                <h5 className="modal-title">{editing ? "Editar Cliente" : "Novo Cliente"}</h5>
                <button className="btn-close btn-close-white" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nome *</label>
                    <input className="form-control" value={form.name} placeholder="Nome completo" onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Telefone / WhatsApp</label>
                    <input className="form-control" value={form.phone} placeholder="(11) 99999-9999" onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">E-mail</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Observações</label>
                    <textarea className="form-control" rows={3} value={form.notes} placeholder="Alergias, preferências, etc." onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
