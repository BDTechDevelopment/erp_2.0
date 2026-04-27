"use client";

import { useState, useEffect } from "react";
import api from "../../services/api";
import PageLayout from "../../components/PageLayout";

const STATUS_LABEL = { pending: "Pendente", confirmed: "Confirmado", cancelled: "Cancelado" };
const STATUS_COLOR = { pending: "warning", confirmed: "success", cancelled: "danger" };

export default function Reports() {
  const today        = new Date().toISOString().split("T")[0];
  const firstOfMonth = today.substring(0, 7) + "-01";

  const [startDate, setStartDate]       = useState(firstOfMonth);
  const [endDate, setEndDate]           = useState(today);
  const [statusFilter, setStatusFilter] = useState("");
  const [report, setReport]             = useState({ activities: [], summary: { total: 0, pending: 0, confirmed: 0, cancelled: 0 } });
  const [loading, setLoading]           = useState(false);

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

  const STATS = [
    { label: "Total",       value: report.summary.total,     color: "primary" },
    { label: "Pendentes",   value: report.summary.pending,   color: "warning" },
    { label: "Confirmados", value: report.summary.confirmed, color: "success" },
    { label: "Cancelados",  value: report.summary.cancelled, color: "danger"  },
  ];

  return (
    <PageLayout title="Relatórios" subtitle="Gere relatórios de agendamentos por período">

      {/* Filtros */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: 11, letterSpacing: 1 }}>
            <i className="bi bi-funnel me-1"></i>Filtros
          </h6>
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
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Carregando...</>
                  : <><i className="bi bi-search me-1"></i>Gerar Relatório</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="row g-3 mb-4">
        {STATS.map(({ label, value, color }) => (
          <div className="col-6 col-md-3" key={label}>
            <div className={`card border-0 border-top border-3 border-${color} shadow-sm h-100`}>
              <div className="card-body text-center py-3">
                <div className={`fw-bold text-${color} lh-1`} style={{ fontSize: 32 }}>{value}</div>
                <div className="text-muted fw-semibold text-uppercase mt-1" style={{ fontSize: 11, letterSpacing: 1 }}>{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de resultados */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-0">
          {report.activities.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar-x fs-1 d-block mb-2 opacity-50"></i>
              <p className="mb-0">Nenhum agendamento encontrado para o período.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="fw-semibold small text-uppercase text-muted ps-4">Data</th>
                    <th className="fw-semibold small text-uppercase text-muted">Horário</th>
                    <th className="fw-semibold small text-uppercase text-muted">Título</th>
                    <th className="fw-semibold small text-uppercase text-muted">Cliente</th>
                    <th className="fw-semibold small text-uppercase text-muted">Descrição</th>
                    <th className="fw-semibold small text-uppercase text-muted pe-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.activities.map(a => (
                    <tr key={a.id}>
                      <td className="fw-semibold ps-4 small">{new Date(a.activityDate).toLocaleDateString("pt-BR")}</td>
                      <td className="text-muted small">{a.time || "–"}</td>
                      <td className="fw-semibold">{a.title}</td>
                      <td className="text-muted small">{a.person?.name || "–"}</td>
                      <td className="text-muted small">{a.description || "–"}</td>
                      <td className="pe-4">
                        <span className={`badge bg-${STATUS_COLOR[a.status] || "secondary"} bg-opacity-10 text-${STATUS_COLOR[a.status] || "secondary"} fw-semibold`}>
                          {STATUS_LABEL[a.status] || a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Exportar */}
      <div className="d-flex gap-2">
        <button className="btn btn-success fw-semibold" onClick={() => handleExport("excel")}>
          <i className="bi bi-file-earmark-spreadsheet me-1"></i>Exportar Excel
        </button>
        <button className="btn btn-danger fw-semibold" onClick={() => handleExport("pdf")}>
          <i className="bi bi-file-earmark-pdf me-1"></i>Exportar PDF
        </button>
      </div>

    </PageLayout>
  );
}
