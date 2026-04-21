"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";
import PageLayout from "../../components/PageLayout";

export default function Items() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", quantity: 0, price: "" });
  const [error, setError] = useState("");

  async function load() {
    const res = await api.get("/items");
    setItems(res.data);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", quantity: 0, price: "" });
    setError("");
    setModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ name: item.name, description: item.description || "", quantity: item.quantity, price: item.price != null ? item.price : "" });
    setError("");
    setModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Nome é obrigatório."); return; }
    try {
      if (editing) {
        await api.put(`/items/${editing.id}`, form);
      } else {
        await api.post("/items", form);
      }
      setModal(false);
      load();
    } catch { setError("Erro ao salvar item."); }
  }

  async function handleDelete(id) {
    if (!confirm("Deseja excluir este item?")) return;
    await api.delete(`/items/${id}`);
    load();
  }

  return (
    <>
      <PageLayout
        title="Itens / Serviços"
        subtitle="Gerencie os serviços e produtos oferecidos"
        color="#0d6efd"
        actions={
          <button className="btn btn-primary btn-sm fw-semibold" onClick={openCreate}>
            + Novo Item
          </button>
        }
      >
        <div className="card-body p-4">
          {items.length === 0 ? (
            <div className="alert alert-info mb-0">Nenhum item cadastrado. Clique em &quot;+ Novo Item&quot; para começar.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Quantidade</th>
                    <th>Preço (R$)</th>
                    <th style={{ width: 160 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td className="fw-semibold">{item.name}</td>
                      <td className="text-muted">{item.description || "–"}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price != null ? Number(item.price).toFixed(2) : "–"}</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-1" onClick={() => openEdit(item)}>Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Excluir</button>
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
                <h5 className="modal-title">{editing ? "Editar Item" : "Novo Item"}</h5>
                <button className="btn-close btn-close-white" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nome *</label>
                    <input className="form-control" value={form.name} placeholder="Ex: Corte feminino, Manicure..." onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Descrição</label>
                    <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label fw-semibold">Quantidade</label>
                      <input type="number" min="0" className="form-control" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label fw-semibold">Preço (R$)</label>
                      <input type="number" step="0.01" min="0" className="form-control" value={form.price} placeholder="0,00" onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
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
