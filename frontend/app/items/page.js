"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";
import PageLayout from "../../components/PageLayout";

export default function Items() {
  const [items, setItems]   = useState([]);
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({ name: "", description: "", quantity: 0, price: "" });
  const [error, setError]   = useState("");

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
        actions={
          <button className="btn btn-primary btn-sm fw-semibold" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i>Novo Item
          </button>
        }
      >
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-0">
            {items.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-box-seam fs-1 d-block mb-2 opacity-50"></i>
                <p className="mb-0">Nenhum item cadastrado.</p>
                <small>Clique em &quot;+ Novo Item&quot; para começar.</small>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold small text-uppercase text-muted ps-4">Nome</th>
                      <th className="fw-semibold small text-uppercase text-muted">Descrição</th>
                      <th className="fw-semibold small text-uppercase text-muted">Qtd.</th>
                      <th className="fw-semibold small text-uppercase text-muted">Preço (R$)</th>
                      <th className="fw-semibold small text-uppercase text-muted pe-4" style={{ width: 140 }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id}>
                        <td className="fw-semibold ps-4">{item.name}</td>
                        <td className="text-muted small">{item.description || "–"}</td>
                        <td>
                          <span className="badge bg-secondary bg-opacity-10 text-secondary fw-semibold">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="fw-semibold">
                          {item.price != null ? `R$ ${Number(item.price).toFixed(2)}` : "–"}
                        </td>
                        <td className="pe-4">
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(item)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>
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
                  <i className={`bi ${editing ? "bi-pencil" : "bi-plus-circle"} text-primary me-2`}></i>
                  {editing ? "Editar Item" : "Novo Item"}
                </h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Nome <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.name} placeholder="Ex: Corte feminino, Manicure..." onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Descrição</label>
                    <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Quantidade</label>
                      <input type="number" min="0" className="form-control" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Preço (R$)</label>
                      <input type="number" step="0.01" min="0" className="form-control" value={form.price} placeholder="0,00" onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
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
