"use client";

import { useState, useEffect } from "react";
import api from "../../services/api";
import PageLayout from "../../components/PageLayout";

const STATUS_LABEL = { pending: "Pendente", confirmed: "Confirmado", cancelled: "Cancelado" };
const STATUS_COLOR = { pending: "warning", confirmed: "success", cancelled: "danger" };

export default function Reports() {
  const today         = new Date().toISOString().split("T")[0];
  const firstOfMonth  = today.substring(0, 7) + "-01";

  const [startDate, setStartDate]     = useState(firstOfMonth);
  const [endDate, setEndDate]         = useState(today);
  const [statusFilter, setStatusFilter] = useState("");
  const [report, setReport]           = useState({ activities: [], summary: { total: 0, pending: 0, confirmed: 0, cancelled: 0 } });
  const [loading, setLoading]         = useState(false);

  async function loadReport() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (statusFilter) params.append("status", statusFilter);
      const res = await api.get(`/report/activities?${params}`);
      setReport(res.data);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadReport(); }, []);

  async function handleExport(format) {
    const params = new URLSearchParams({ startDate, endDate });
    if (statusFilter) params.append("status", statusFilter);
    const res = await api.get(`/export/${format}?${params}`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agendamentos.${format === "excel" ? "xlsx" : "pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageLayout
      title="Relatórios"
      subtitle="Gere relatórios de agendamentos por período"
    >
      <div className="card-body p-4">

        {/* Filtros */}
        <div className="rounded-3 p-3 mb-4" style={{ background: "#f1f5ff", border: "1px solid #d0deff" }}>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold small">Data inicial</label>
              <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold small">Data final</label>
              <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold small">Status</label>
              <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100 fw-semibold" onClick={loadReport} disabled={loading}>
                {loading ? "Carregando..." : "Gerar Relatório"}
              </button>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total",       value: report.summary.total,     color: "#0d6efd" },
            { label: "Pendentes",   value: report.summary.pending,   color: "#fd7e14" },
            { label: "Confirmados", value: report.summary.confirmed, color: "#198754" },
            { label: "Cancelados",  value: report.summary.cancelled, color: "#dc3545" },
          ].map(({ label, value, color }) => (
            <div className="col-6 col-md-3" key={label}>
              <div className="card border-0 shadow-sm text-center py-3" style={{ borderTop: `4px solid ${color}`, borderRadius: 10 }}>
                <div className="fw-bold" style={{ fontSize: 30, color }}>{value}</div>
                <small className="text-muted fw-semibold" style={{ fontSize: 12 }}>{label}</small>
              </div>
            </div>
          ))}
        </div>

        {/* Tabela */}
        {report.activities.length === 0 ? (
          <div className="alert alert-info">Nenhum agendamento encontrado para o período selecionado.</div>
        ) : (
          <div className="table-responsive mb-4">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Título</th>
                  <th>Cliente</th>
                  <th>Descrição</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.activities.map(a => (
                  <tr key={a.id}>
                    <td>{new Date(a.activityDate).toLocaleDateString("pt-BR")}</td>
                    <td>{a.time || "–"}</td>
                    <td className="fw-semibold">{a.title}</td>
                    <td>{a.person?.name || "–"}</td>
                    <td className="text-muted">{a.description || "–"}</td>
                    <td>
                      <span className={`badge bg-${STATUS_COLOR[a.status] || "secondary"}`}>
                        {STATUS_LABEL[a.status] || a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Exportar */}
        <div className="d-flex gap-2">
          <button className="btn btn-success fw-semibold" onClick={() => handleExport("excel")}>Exportar Excel</button>
          <button className="btn btn-danger fw-semibold" onClick={() => handleExport("pdf")}>Exportar PDF</button>
        </div>

      </div>
    </PageLayout>
  );
}
