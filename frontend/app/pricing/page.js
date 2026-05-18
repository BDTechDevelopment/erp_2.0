"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";
import PageLayout from "../../components/PageLayout";

const EMPTY = { name: "", description: "", price: "" };

export default function PricingPage() {
  const [pricings, setPricings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [error, setError]         = useState("");
  const [saving, setSaving]       = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get("/pricings");
      setPricings(res.data);
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setShowModal(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", price: String(p.price) });
    setError("");
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setError(""); }

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Nome é obrigatório."); return; }
    if (form.price === "" || isNaN(parseFloat(form.price))) { setError("Preço inválido."); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/pricings/${editing.id}`, form);
      } else {
        await api.post("/pricings", form);
      }
      await load();
      closeModal();
    } catch {
      setError("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Excluir este serviço?")) return;
    await api.delete(`/pricings/${id}`);
    load();
  }

  function formatPrice(v) {
    return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <PageLayout
      title="Precificação"
      subtitle="Cadastre os serviços e seus valores"
      actions={
        <button className="btn btn-primary btn-sm fw-semibold" onClick={openNew}>
          <i className="bi bi-plus-lg me-1"></i>Novo Serviço
        </button>
      }
    >
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : pricings.length === 0 ? (
        <div className="card border-0 rounded-3 text-center py-5 text-muted" style={{ border: "2px dashed #dee2e6" }}>
          <i className="bi bi-tag fs-2 d-block mb-2 opacity-50"></i>
          <p className="fw-semibold mb-1">Nenhum serviço cadastrado</p>
          <small>Clique em "Novo Serviço" para começar</small>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold text-uppercase text-muted ps-4" style={{ fontSize: 11 }}>Serviço</th>
                  <th className="fw-semibold text-uppercase text-muted" style={{ fontSize: 11 }}>Descrição</th>
                  <th className="fw-semibold text-uppercase text-muted text-end" style={{ fontSize: 11 }}>Valor</th>
                  <th className="fw-semibold text-uppercase text-muted text-center pe-4" style={{ fontSize: 11 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pricings.map(p => (
                  <tr key={p.id}>
                    <td className="ps-4 fw-semibold">{p.name}</td>
                    <td className="text-muted">{p.description || "–"}</td>
                    <td className="text-end fw-bold text-success">{formatPrice(p.price)}</td>
                    <td className="text-center pe-4">
                      <div className="d-flex gap-1 justify-content-center">
                        <button className="btn btn-outline-primary btn-sm py-0 px-2" onClick={() => openEdit(p)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-outline-danger btn-sm py-0 px-2" onClick={() => handleDelete(p.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-tag text-primary me-2"></i>
                  {editing ? "Editar Serviço" : "Novo Serviço"}
                </h5>
                <button className="btn-close" onClick={closeModal} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body pt-3">
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Nome do Serviço <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      placeholder="Ex: Corte de Cabelo, Manicure..."
                      value={form.name}
                      onChange={e => set("name", e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Descrição</label>
                    <input
                      className="form-control"
                      placeholder="Detalhes do serviço (opcional)"
                      value={form.description}
                      onChange={e => set("description", e.target.value)}
                    />
                  </div>
                  <div className="mb-1">
                    <label className="form-label fw-semibold small">Valor (R$) <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        placeholder="0,00"
                        value={form.price}
                        onChange={e => set("price", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="btn btn-primary fw-semibold" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                    {editing ? "Salvar Alterações" : "Cadastrar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
