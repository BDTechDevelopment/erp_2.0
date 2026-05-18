"use client";

import { useState, useEffect } from "react";
import api from "../../services/api";
import PageLayout from "../../components/PageLayout";

const STATUS_LABEL = { pending: "Pendente", confirmed: "Confirmado", cancelled: "Cancelado" };
const STATUS_COLOR = { pending: "warning", confirmed: "success", cancelled: "danger" };

function formatPrice(v) {
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const today        = new Date().toISOString().split("T")[0];
const firstOfMonth = today.substring(0, 7) + "-01";

const EMPTY_REPORT = {
  activities: [],
  summary: {
    total: 0, pending: 0, confirmed: 0, cancelled: 0,
    financial: { received: 0, expected: 0, lost: 0, gross: 0, byService: [] },
  },
};

// ── Aba Balanço Financeiro ────────────────────────────────────────────────────
function TabFinanceiro() {
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate]     = useState(today);
  const [report, setReport]       = useState(EMPTY_REPORT);
  const [loading, setLoading]     = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await api.get(`/report/activities?${params}`);
      setReport(res.data);
    } finally { setLoading(false); }
  }

  async function exportFile(format) {
    const params = new URLSearchParams({ startDate, endDate, type: "balanco" });
    const res = await api.get(`/export/${format}?${params}`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `balanco.${format === "excel" ? "xlsx" : "pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fin = report.summary.financial || {};

  return (
    <>
      {/* Filtros */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: 11, letterSpacing: 1 }}>
            <i className="bi bi-funnel me-1"></i>Período
          </h6>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-semibold small">Data inicial</label>
              <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small">Data final</label>
              <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100 fw-semibold" onClick={load} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Carregando...</>
                  : <><i className="bi bi-search me-1"></i>Calcular</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de totais */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="rounded-3 p-4 h-100" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <div className="text-success fw-semibold text-uppercase mb-1" style={{ fontSize: 11 }}>
              <i className="bi bi-check-circle me-1"></i>Recebido
            </div>
            <div className="fw-bold text-success" style={{ fontSize: 32 }}>{formatPrice(fin.received || 0)}</div>
            <div className="text-muted small mt-1">Agendamentos confirmados</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="rounded-3 p-4 h-100" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
            <div className="text-warning fw-semibold text-uppercase mb-1" style={{ fontSize: 11 }}>
              <i className="bi bi-clock me-1"></i>Esperado
            </div>
            <div className="fw-bold text-warning" style={{ fontSize: 32 }}>{formatPrice(fin.expected || 0)}</div>
            <div className="text-muted small mt-1">Agendamentos pendentes</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="rounded-3 p-4 h-100" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
            <div className="text-danger fw-semibold text-uppercase mb-1" style={{ fontSize: 11 }}>
              <i className="bi bi-x-circle me-1"></i>Perdido
            </div>
            <div className="fw-bold text-danger" style={{ fontSize: 32 }}>{formatPrice(fin.lost || 0)}</div>
            <div className="text-muted small mt-1">Agendamentos cancelados</div>
          </div>
        </div>
      </div>

      {/* Por serviço */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: 11, letterSpacing: 1 }}>
            <i className="bi bi-tag me-1"></i>Por Serviço
          </h6>
          {fin.byService?.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="fw-semibold text-uppercase text-muted" style={{ fontSize: 11 }}>Serviço</th>
                    <th className="fw-semibold text-uppercase text-muted text-center" style={{ fontSize: 11 }}>Qtd</th>
                    <th className="fw-semibold text-uppercase text-muted text-end" style={{ fontSize: 11 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {fin.byService.map(s => (
                    <tr key={s.name}>
                      <td className="fw-semibold small">{s.name}</td>
                      <td className="text-center text-muted small">{s.count}x</td>
                      <td className="text-end fw-bold text-success small">{formatPrice(s.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <td colSpan={2} className="fw-bold small text-end">Total bruto</td>
                    <td className="text-end fw-bold text-primary small">{formatPrice(fin.gross || 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-tag fs-2 d-block mb-2 opacity-50"></i>
              <p className="mb-0 small">Nenhum serviço vinculado no período.</p>
            </div>
          )}
        </div>
      </div>

      {/* Exportação */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: 11, letterSpacing: 1 }}>
            <i className="bi bi-download me-1"></i>Exportar Balanço
          </h6>
          <div className="d-flex gap-2">
            <button className="btn btn-success fw-semibold" onClick={() => exportFile("excel")}>
              <i className="bi bi-file-earmark-spreadsheet me-1"></i>Excel
            </button>
            <button className="btn btn-danger fw-semibold" onClick={() => exportFile("pdf")}>
              <i className="bi bi-file-earmark-pdf me-1"></i>PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Aba Agendamentos ──────────────────────────────────────────────────────────
function TabAgendamentos() {
  const [startDate, setStartDate]       = useState(firstOfMonth);
  const [endDate, setEndDate]           = useState(today);
  const [statusFilter, setStatusFilter] = useState("");
  const [report, setReport]             = useState(EMPTY_REPORT);
  const [loading, setLoading]           = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (statusFilter) params.append("status", statusFilter);
      const res = await api.get(`/report/activities?${params}`);
      setReport(res.data);
    } finally { setLoading(false); }
  }

  async function exportFile(format) {
    const params = new URLSearchParams({ startDate, endDate, type: "agendamentos" });
    if (statusFilter) params.append("status", statusFilter);
    const res = await api.get(`/export/${format}?${params}`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agendamentos.${format === "excel" ? "xlsx" : "pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const { summary, activities } = report;

  return (
    <>
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
              <button className="btn btn-primary w-100 fw-semibold" onClick={load} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Carregando...</>
                  : <><i className="bi bi-search me-1"></i>Buscar</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contadores */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total",       value: summary.total,     color: "primary" },
          { label: "Pendentes",   value: summary.pending,   color: "warning" },
          { label: "Confirmados", value: summary.confirmed, color: "success" },
          { label: "Cancelados",  value: summary.cancelled, color: "danger"  },
        ].map(({ label, value, color }) => (
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

      {/* Tabela */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-0">
          {activities.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar-x fs-1 d-block mb-2 opacity-50"></i>
              <p className="mb-0">Nenhum agendamento encontrado para o período.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th className="fw-semibold text-uppercase text-muted ps-4" style={{ fontSize: 11 }}>Data</th>
                    <th className="fw-semibold text-uppercase text-muted" style={{ fontSize: 11 }}>Hora</th>
                    <th className="fw-semibold text-uppercase text-muted" style={{ fontSize: 11 }}>Título</th>
                    <th className="fw-semibold text-uppercase text-muted" style={{ fontSize: 11 }}>Cliente</th>
                    <th className="fw-semibold text-uppercase text-muted" style={{ fontSize: 11 }}>Serviços</th>
                    <th className="fw-semibold text-uppercase text-muted text-end" style={{ fontSize: 11 }}>Valor</th>
                    <th className="fw-semibold text-uppercase text-muted pe-4" style={{ fontSize: 11 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(a => (
                    <tr key={a.id}>
                      <td className="ps-4">{new Date(a.activityDate).toLocaleDateString("pt-BR")}</td>
                      <td className="text-muted">{a.time || "–"}</td>
                      <td className="fw-semibold">{a.title}</td>
                      <td className="text-muted">{a.person?.name || "–"}</td>
                      <td>
                        {a.pricings?.length > 0
                          ? a.pricings.map(ap => (
                              <span key={ap.pricingId} className="badge bg-secondary bg-opacity-10 text-secondary me-1 fw-normal" style={{ fontSize: 10 }}>
                                {ap.pricing?.name}
                              </span>
                            ))
                          : <span className="text-muted">–</span>
                        }
                      </td>
                      <td className="text-end fw-bold text-success">
                        {a.price != null ? formatPrice(a.price) : "–"}
                      </td>
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

      {/* Exportação */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: 11, letterSpacing: 1 }}>
            <i className="bi bi-download me-1"></i>Exportar Agendamentos
          </h6>
          <div className="d-flex gap-2">
            <button className="btn btn-success fw-semibold" onClick={() => exportFile("excel")}>
              <i className="bi bi-file-earmark-spreadsheet me-1"></i>Excel
            </button>
            <button className="btn btn-danger fw-semibold" onClick={() => exportFile("pdf")}>
              <i className="bi bi-file-earmark-pdf me-1"></i>PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Reports() {
  const [tab, setTab] = useState("financeiro");

  return (
    <PageLayout title="Relatórios" subtitle="Balanço financeiro e agendamentos por período">
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === "financeiro" ? "active" : ""}`}
            onClick={() => setTab("financeiro")}
          >
            <i className="bi bi-cash-stack me-2"></i>Balanço Financeiro
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === "agendamentos" ? "active" : ""}`}
            onClick={() => setTab("agendamentos")}
          >
            <i className="bi bi-calendar3 me-2"></i>Agendamentos
          </button>
        </li>
      </ul>

      {tab === "financeiro"  && <TabFinanceiro />}
      {tab === "agendamentos" && <TabAgendamentos />}
    </PageLayout>
  );
}
