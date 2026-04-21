"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import api from "../../../services/api";

function NewActivityForm() {
  const router = useRouter();
  const params = useSearchParams();
  const date   = params.get("date");

  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime]             = useState("");
  const [personId, setPersonId]     = useState("");
  const [persons, setPersons]       = useState([]);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

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
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0d6efd 0%, #3a8bfd 100%)" }}
    >
      <div className="card shadow-lg p-4 border-0" style={{ width: 460, borderRadius: 15 }}>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h5 className="fw-bold mb-0 text-primary">Novo Agendamento</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => router.back()}>← Voltar</button>
        </div>
        <p className="text-muted small mb-4 text-capitalize">{displayDate}</p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Horário</label>
            <input type="time" className="form-control" value={time} onChange={e => setTime(e.target.value)} />
            <small className="text-muted">Opcional — deixe em branco para o dia todo.</small>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Título *</label>
            <input className="form-control" placeholder="Ex: Corte de cabelo, Manicure..." value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Cliente</label>
            <select className="form-select" value={personId} onChange={e => setPersonId(e.target.value)}>
              <option value="">— Sem cliente vinculado —</option>
              {persons.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.phone ? ` — ${p.phone}` : ""}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Descrição / Observação</label>
            <textarea className="form-control" rows={3} placeholder="Detalhes do serviço..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary fw-semibold flex-grow-1" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Agendamento"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewActivityPage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0d6efd, #3a8bfd)" }}>
        <div className="text-white">Carregando...</div>
      </div>
    }>
      <NewActivityForm />
    </Suspense>
  );
}
