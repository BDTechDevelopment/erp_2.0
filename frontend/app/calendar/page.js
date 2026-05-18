"use client";

import { useState, useEffect } from "react";
import api from "../../services/api";
import { useRouter } from "next/navigation";
import PageLayout from "../../components/PageLayout";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const STATUS_LABEL = { pending: "Pendente", confirmed: "Confirmado", cancelled: "Cancelado" };
const STATUS_COLOR = { pending: "warning", confirmed: "success", cancelled: "danger" };

const EDIT_EMPTY = { title: "", description: "", time: "", personId: "", selectedIds: [], priceOverride: "" };

export default function Calendar() {
  const router = useRouter();
  const [date, setDate]               = useState(new Date());
  const [activities, setActivities]   = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayActivities, setDayActivities] = useState([]);
  const [persons, setPersons]         = useState([]);
  const [pricings, setPricings]       = useState([]);
  const [editModal, setEditModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [editForm, setEditForm]       = useState(EDIT_EMPTY);
  const [editError, setEditError]     = useState("");
  const [saving, setSaving]           = useState(false);

  const year  = date.getFullYear();
  const month = date.getMonth() + 1;
  const today      = new Date();
  const todayDay   = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear  = today.getFullYear();

  useEffect(() => { setSelectedDay(null); loadActivities(); }, [month, year]);

  useEffect(() => {
    api.get("/persons").then(r => setPersons(r.data)).catch(() => {});
    api.get("/pricings").then(r => setPricings(r.data)).catch(() => {});
  }, []);

  async function loadActivities() {
    const res = await api.get(`/activities?month=${month}&year=${year}`);
    setActivities(res.data);
  }

  async function refresh() {
    const res = await api.get(`/activities?month=${month}&year=${year}`);
    setActivities(res.data);
    if (selectedDay !== null) {
      setDayActivities(res.data.filter(a => new Date(a.activityDate).getUTCDate() === selectedDay));
    }
  }

  function handleDayClick(day) {
    setSelectedDay(day);
    setDayActivities(activities.filter(a => new Date(a.activityDate).getUTCDate() === day));
  }

  async function handleStatusChange(id, status) {
    await api.patch(`/activities/${id}/status`, { status });
    refresh();
  }

  async function handleDelete(id) {
    if (!confirm("Excluir este agendamento?")) return;
    await api.delete(`/activities/${id}`);
    refresh();
  }

  function openEdit(a) {
    const ids = (a.pricings || []).map(ap => ap.pricingId);
    setEditTarget(a);
    setEditForm({
      title: a.title,
      description: a.description || "",
      time: a.time || "",
      personId: a.personId || "",
      selectedIds: ids,
      priceOverride: a.price != null ? String(a.price) : "",
    });
    setEditError("");
    setEditModal(true);
  }

  function toggleEditPricing(id) {
    setEditForm(prev => {
      const next = prev.selectedIds.includes(id)
        ? prev.selectedIds.filter(x => x !== id)
        : [...prev.selectedIds, id];
      const sum = pricings.filter(p => next.includes(p.id)).reduce((acc, p) => acc + p.price, 0);
      return { ...prev, selectedIds: next, priceOverride: sum > 0 ? String(sum) : "" };
    });
  }

  function setEF(field, value) { setEditForm(prev => ({ ...prev, [field]: value })); }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editForm.title.trim()) { setEditError("Título é obrigatório."); return; }
    setSaving(true);
    try {
      await api.put(`/activities/${editTarget.id}`, {
        title: editForm.title,
        description: editForm.description,
        time: editForm.time || null,
        personId: editForm.personId || null,
        pricingIds: editForm.selectedIds,
        price: editForm.priceOverride !== "" ? parseFloat(editForm.priceOverride) : null,
      });
      setEditModal(false);
      refresh();
    } catch {
      setEditError("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  function padDate(n) { return String(n).padStart(2, "0"); }
  function formatPrice(v) { return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

  const editAutoTotal = pricings
    .filter(p => editForm.selectedIds.includes(p.id))
    .reduce((acc, p) => acc + p.price, 0);

  const totalDays      = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <PageLayout
      title="Agenda"
      subtitle="Visualize e gerencie os agendamentos do mês"
      actions={
        <button className="btn btn-primary btn-sm fw-semibold" onClick={() => {
          const now = new Date();
          router.push(`/calendar/new?date=${year}-${padDate(month)}-${padDate(now.getDate())}`);
        }}>
          <i className="bi bi-plus-lg me-1"></i>Novo Agendamento
        </button>
      }
    >
      {/* Calendário */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setDate(new Date(year, month - 2))}>
              <i className="bi bi-chevron-left"></i>
            </button>
            <h6 className="mb-0 fw-bold text-capitalize">
              {date.toLocaleString("pt-BR", { month: "long" })} {year}
            </h6>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setDate(new Date(year, month))}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>

          <div className="row g-1 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="col text-center fw-semibold text-muted" style={{ fontSize: 12 }}>{d}</div>
            ))}
          </div>

          <div className="row g-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} className="col" style={{ minHeight: 90 }} />;
              const dayActs    = activities.filter(a => new Date(a.activityDate).getUTCDate() === day);
              const isSelected = selectedDay === day;
              const isToday    = day === todayDay && month === todayMonth && year === todayYear;
              let cellClass = "col border rounded-2 p-1 ";
              if (isSelected)   cellClass += "border-primary border-2 bg-primary bg-opacity-10";
              else if (isToday) cellClass += "border-warning border-2 bg-warning bg-opacity-10";
              else              cellClass += "border bg-white";

              return (
                <div key={day} className={cellClass} style={{ cursor: "pointer", minHeight: 90 }} onClick={() => handleDayClick(day)}>
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className={`fw-bold small ${isToday ? "text-warning" : ""}`}>{day}</span>
                    <button
                      className="btn btn-success btn-sm p-0 lh-1"
                      style={{ width: 18, height: 18, fontSize: 12 }}
                      onClick={e => { e.stopPropagation(); router.push(`/calendar/new?date=${year}-${padDate(month)}-${padDate(day)}`); }}
                    >+</button>
                  </div>
                  {dayActs.map(a => (
                    <div key={a.id} className={`badge bg-${STATUS_COLOR[a.status] || "secondary"} d-block text-truncate mb-1 text-start`} style={{ fontSize: 10, padding: "3px 5px" }}>
                      {a.time ? `${a.time} ` : ""}{a.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Painel do dia */}
      {!selectedDay ? (
        <div className="card border-0 border-2 rounded-3 text-center py-5 text-muted" style={{ borderStyle: "dashed", borderColor: "#dee2e6" }}>
          <i className="bi bi-hand-index fs-3 d-block mb-2 opacity-50"></i>
          <p className="mb-0 fw-semibold">Selecione um dia no calendário</p>
          <small>Os agendamentos do dia aparecerão aqui</small>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
            <span className="fw-bold">
              <i className="bi bi-calendar-event text-primary me-2"></i>
              {padDate(selectedDay)}/{padDate(month)}/{year}
            </span>
            <button className="btn btn-primary btn-sm fw-semibold" onClick={() => router.push(`/calendar/new?date=${year}-${padDate(month)}-${padDate(selectedDay)}`)}>
              <i className="bi bi-plus-lg me-1"></i>Novo
            </button>
          </div>
          <div className="card-body p-0">
            {dayActivities.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-calendar2-x d-block fs-3 mb-2 opacity-50"></i>
                <p className="mb-0 small">Nenhum agendamento neste dia.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 small">
                  <thead className="table-light">
                    <tr className="text-center">
                      <th className="fw-semibold text-uppercase text-muted ps-4" style={{ fontSize: 11, width: "8%" }}>Hora</th>
                      <th className="fw-semibold text-uppercase text-muted text-start" style={{ fontSize: 11, width: "28%" }}>Serviço</th>
                      <th className="fw-semibold text-uppercase text-muted" style={{ fontSize: 11, width: "16%" }}>Cliente</th>
                      <th className="fw-semibold text-uppercase text-muted" style={{ fontSize: 11, width: "10%" }}>Valor</th>
                      <th className="fw-semibold text-uppercase text-muted" style={{ fontSize: 11, width: "10%" }}>Status</th>
                      <th className="fw-semibold text-uppercase text-muted pe-4" style={{ fontSize: 11, width: "20%" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayActivities.map(a => (
                      <tr key={a.id} className="text-center align-middle">
                        <td className="fw-semibold ps-4">{a.time || "–"}</td>
                        <td className="text-start">
                          <div className="fw-semibold">{a.title}</div>
                          {a.pricings?.length > 0 && (
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {a.pricings.map(ap => (
                                <span key={ap.pricingId} className="badge bg-secondary bg-opacity-10 text-secondary fw-normal" style={{ fontSize: 10 }}>
                                  {ap.pricing?.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {a.description && <div className="text-muted mt-1" style={{ fontSize: 11 }}>{a.description}</div>}
                        </td>
                        <td className="text-muted">{a.person?.name || "–"}</td>
                        <td className="fw-bold text-success">{a.price != null ? formatPrice(a.price) : "–"}</td>
                        <td>
                          <span className={`badge bg-${STATUS_COLOR[a.status] || "secondary"} bg-opacity-10 text-${STATUS_COLOR[a.status] || "secondary"} fw-semibold`}>
                            {STATUS_LABEL[a.status] || a.status}
                          </span>
                        </td>
                        <td className="pe-4">
                          <div className="d-flex gap-1 justify-content-center flex-wrap">
                            <button className="btn btn-outline-primary btn-sm py-0 px-2" style={{ fontSize: 11 }} onClick={() => openEdit(a)} title="Editar">
                              <i className="bi bi-pencil"></i>
                            </button>
                            {a.status !== "confirmed" && (
                              <button className="btn btn-success btn-sm py-0 px-2" style={{ fontSize: 11 }} onClick={() => handleStatusChange(a.id, "confirmed")}>Confirmar</button>
                            )}
                            {a.status !== "cancelled" && (
                              <button className="btn btn-warning btn-sm py-0 px-2" style={{ fontSize: 11 }} onClick={() => handleStatusChange(a.id, "cancelled")}>Cancelar</button>
                            )}
                            {a.status === "cancelled" && (
                              <button className="btn btn-secondary btn-sm py-0 px-2" style={{ fontSize: 11 }} onClick={() => handleStatusChange(a.id, "pending")}>Reabrir</button>
                            )}
                            <button className="btn btn-outline-danger btn-sm py-0 px-2" style={{ fontSize: 11 }} onClick={() => handleDelete(a.id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {editModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pencil text-primary me-2"></i>Editar Agendamento
                </h5>
                <button className="btn-close" onClick={() => setEditModal(false)} />
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body pt-3" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                  {editError && <div className="alert alert-danger py-2 small">{editError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Horário</label>
                    <input type="time" className="form-control" value={editForm.time} onChange={e => setEF("time", e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Cliente</label>
                    <select className="form-select" value={editForm.personId} onChange={e => setEF("personId", e.target.value)}>
                      <option value="">— Sem cliente —</option>
                      {persons.map(p => <option key={p.id} value={p.id}>{p.name}{p.phone ? ` — ${p.phone}` : ""}</option>)}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Serviços</label>
                    {pricings.length === 0 ? (
                      <div className="text-muted small border rounded-3 p-2 text-center">Nenhum serviço cadastrado.</div>
                    ) : (
                      <div className="border rounded-3 p-2 d-flex flex-column gap-1" style={{ maxHeight: 160, overflowY: "auto" }}>
                        {pricings.map(p => {
                          const checked = editForm.selectedIds.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className={`d-flex align-items-center justify-content-between gap-2 px-2 py-2 rounded-2 mb-0 ${checked ? "bg-primary bg-opacity-10" : ""}`}
                              style={{ cursor: "pointer", border: checked ? "1px solid var(--bs-primary)" : "1px solid transparent" }}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <input type="checkbox" className="form-check-input mt-0" checked={checked} onChange={() => toggleEditPricing(p.id)} />
                                <span className="small fw-semibold">{p.name}</span>
                              </div>
                              <span className="text-success fw-bold small">R$ {Number(p.price).toFixed(2).replace(".", ",")}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {editForm.selectedIds.length > 0 && (
                      <div className="mt-2 d-flex flex-wrap gap-1">
                        {pricings.filter(p => editForm.selectedIds.includes(p.id)).map(p => (
                          <span key={p.id} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 fw-normal">
                            {p.name}
                            <button type="button" className="btn-close ms-1" style={{ fontSize: 8 }} onClick={() => toggleEditPricing(p.id)} />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Título <span className="text-danger">*</span></label>
                    <input className="form-control" value={editForm.title} onChange={e => setEF("title", e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small d-flex justify-content-between">
                      <span>Valor (R$)</span>
                      {editAutoTotal > 0 && (
                        <span className="text-muted fw-normal" style={{ fontSize: 11 }}>
                          Soma: R$ {editAutoTotal.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">R$</span>
                      <input type="number" min="0" step="0.01" className="form-control" value={editForm.priceOverride} onChange={e => setEF("priceOverride", e.target.value)} />
                    </div>
                  </div>

                  <div className="mb-1">
                    <label className="form-label fw-semibold small">Descrição / Observação</label>
                    <textarea className="form-control" rows={2} value={editForm.description} onChange={e => setEF("description", e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary fw-semibold" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                    Salvar Alterações
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
