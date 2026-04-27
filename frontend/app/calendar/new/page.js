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
  const [persons, setPersons]         = useState([]);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    api.get("/persons").then(res => setPersons(res.data)).catch(() => {});
  }, []);

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
      });
      router.push("/calendar");
    } catch {
      setError("Erro ao salvar agendamento.");
      setLoading(false);
    }
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
      <div className="card border-0 shadow rounded-4 p-4" style={{ width: "100%", maxWidth: 480 }}>

        {/* Cabeçalho */}
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
            <label className="form-label fw-semibold small">
              Horário <span className="text-muted fw-normal">(opcional)</span>
            </label>
            <input
              type="time"
              className="form-control"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold small">
              Título <span className="text-danger">*</span>
            </label>
            <input
              className="form-control"
              placeholder="Ex: Corte de cabelo, Manicure..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Cliente</label>
            <select
              className="form-select"
              value={personId}
              onChange={e => setPersonId(e.target.value)}
            >
              <option value="">— Sem cliente vinculado —</option>
              {persons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.phone ? ` — ${p.phone}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold small">Descrição / Observação</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Detalhes do serviço..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary fw-semibold flex-grow-1"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Salvando...</>
                : <><i className="bi bi-check-lg me-2"></i>Salvar Agendamento</>
              }
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => router.back()}>
              Cancelar
            </button>
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
