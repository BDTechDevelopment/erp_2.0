"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import api from "../../../services/api";

function NewActivityForm() {
  const router = useRouter();
  const params = useSearchParams();
  const date   = params.get("date");

  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime]               = useState("");
  const [personId, setPersonId]       = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [priceOverride, setPriceOverride] = useState("");
  const [persons, setPersons]         = useState([]);
  const [pricings, setPricings]       = useState([]);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    api.get("/persons").then(r => setPersons(r.data)).catch(() => {});
    api.get("/pricings").then(r => setPricings(r.data)).catch(() => {});
  }, []);

  function togglePricing(id) {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      const sum = pricings.filter(p => next.includes(p.id)).reduce((acc, p) => acc + p.price, 0);
      setPriceOverride(sum > 0 ? String(sum) : "");
      return next;
    });
  }

  const autoTotal = pricings
    .filter(p => selectedIds.includes(p.id))
    .reduce((acc, p) => acc + p.price, 0);

  const displayDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setError("Título é obrigatório."); return; }
    setLoading(true);
    try {
      await api.post("/activities", {
        title,
        description,
        activity_date: date + "T00:00:00.000Z",
        time: time || null,
        personId: personId || null,
        pricingIds: selectedIds,
        price: priceOverride !== "" ? parseFloat(priceOverride) : null,
      });
      router.push("/calendar");
    } catch {
      setError("Erro ao salvar agendamento.");
      setLoading(false);
    }
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
      <div className="card border-0 shadow rounded-4 p-4" style={{ width: "100%", maxWidth: 520 }}>

        <div className="d-flex align-items-start justify-content-between mb-4">
          <div>
            <h5 className="fw-bold mb-1">
              <i className="bi bi-calendar-plus text-primary me-2"></i>Novo Agendamento
            </h5>
            <p className="text-muted small mb-0 text-capitalize">{displayDate}</p>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => router.back()}>
            <i className="bi bi-arrow-left"></i>
          </button>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-3">
            <i className="bi bi-exclamation-circle me-1"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Horário <span className="text-muted fw-normal">(opcional)</span></label>
            <input type="time" className="form-control" value={time} onChange={e => setTime(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Cliente</label>
            <select className="form-select" value={personId} onChange={e => setPersonId(e.target.value)}>
              <option value="">— Sem cliente vinculado —</option>
              {persons.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.phone ? ` — ${p.phone}` : ""}</option>
              ))}
            </select>
          </div>

          {/* Multi-seleção de serviços */}
          <div className="mb-3">
            <label className="form-label fw-semibold small d-flex justify-content-between">
              <span>Serviços</span>
              {pricings.length === 0 && (
                <a href="/pricing" className="small text-primary fw-normal">+ Cadastrar serviços</a>
              )}
            </label>
            {pricings.length === 0 ? (
              <div className="text-muted small border rounded-3 p-3 text-center">Nenhum serviço cadastrado ainda.</div>
            ) : (
              <div className="border rounded-3 p-2 d-flex flex-column gap-1" style={{ maxHeight: 180, overflowY: "auto" }}>
                {pricings.map(p => {
                  const checked = selectedIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`d-flex align-items-center justify-content-between gap-2 px-2 py-2 rounded-2 mb-0 ${checked ? "bg-primary bg-opacity-10" : "bg-white"}`}
                      style={{ cursor: "pointer", border: checked ? "1px solid var(--bs-primary)" : "1px solid transparent" }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          checked={checked}
                          onChange={() => togglePricing(p.id)}
                        />
                        <span className="small fw-semibold">{p.name}</span>
                        {p.description && <span className="text-muted" style={{ fontSize: 11 }}>— {p.description}</span>}
                      </div>
                      <span className="text-success fw-bold small flex-shrink-0">
                        R$ {Number(p.price).toFixed(2).replace(".", ",")}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            {selectedIds.length > 0 && (
              <div className="mt-2 d-flex flex-wrap gap-1">
                {pricings.filter(p => selectedIds.includes(p.id)).map(p => (
                  <span key={p.id} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 fw-normal">
                    {p.name}
                    <button type="button" className="btn-close btn-close ms-1" style={{ fontSize: 8 }} onClick={() => togglePricing(p.id)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Título <span className="text-danger">*</span></label>
            <input
              className="form-control"
              placeholder="Ex: Corte de cabelo, Manicure..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small d-flex justify-content-between align-items-center">
              <span>Valor (R$)</span>
              {autoTotal > 0 && (
                <span className="text-muted fw-normal" style={{ fontSize: 11 }}>
                  Soma: R$ {autoTotal.toFixed(2).replace(".", ",")}
                </span>
              )}
            </label>
            <div className="input-group">
              <span className="input-group-text">R$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                placeholder="0,00"
                value={priceOverride}
                onChange={e => setPriceOverride(e.target.value)}
              />
            </div>
            <div className="form-text">Preenchido automaticamente pela soma dos serviços. Edite se necessário.</div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold small">Descrição / Observação</label>
            <textarea className="form-control" rows={2} placeholder="Detalhes adicionais..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary fw-semibold flex-grow-1" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Salvando...</>
                : <><i className="bi bi-check-lg me-2"></i>Salvar Agendamento</>
              }
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => router.back()}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    }>
      <NewActivityForm />
    </Suspense>
  );
}
