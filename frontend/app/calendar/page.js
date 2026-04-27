"use client";

import { useState, useEffect } from "react";
import api from "../../services/api";
import { useRouter } from "next/navigation";
import PageLayout from "../../components/PageLayout";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const STATUS_LABEL = { pending: "Pendente", confirmed: "Confirmado", cancelled: "Cancelado" };
const STATUS_COLOR = { pending: "warning", confirmed: "success", cancelled: "danger" };

export default function Calendar() {
  const router = useRouter();
  const [date, setDate]               = useState(new Date());
  const [activities, setActivities]   = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayActivities, setDayActivities] = useState([]);

  const year  = date.getFullYear();
  const month = date.getMonth() + 1;

  const today      = new Date();
  const todayDay   = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear  = today.getFullYear();

  useEffect(() => {
    setSelectedDay(null);
    loadActivities();
  }, [month, year]);

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

  function padDate(n) { return String(n).padStart(2, "0"); }

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
        <button
          className="btn btn-primary btn-sm fw-semibold"
          onClick={() => {
            const now = new Date();
            router.push(`/calendar/new?date=${year}-${padDate(month)}-${padDate(now.getDate())}`);
          }}
        >
          <i className="bi bi-plus-lg me-1"></i>Novo Agendamento
        </button>
      }
    >
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3">

          {/* Navegação de mês */}
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

          {/* Dias da semana */}
          <div className="row g-1 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="col text-center fw-semibold text-muted" style={{ fontSize: 12 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grade do calendário */}
          <div className="row g-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} className="col" style={{ minHeight: 90 }} />;

              const dayActs    = activities.filter(a => new Date(a.activityDate).getUTCDate() === day);
              const isSelected = selectedDay === day;
              const isToday    = day === todayDay && month === todayMonth && year === todayYear;

              let cellClass = "col border rounded-2 p-1 ";
              if (isSelected)   cellClass += "border-primary border-2 bg-primary bg-opacity-10";
              else if (isToday) cellClass += "border-warning border-2 bg-warning bg-opacity-10";
              else              cellClass += "border-light bg-white";

              return (
                <div key={day} className={cellClass} style={{ cursor: "pointer", minHeight: 90 }} onClick={() => handleDayClick(day)}>
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className={`fw-bold small ${isToday ? "text-warning" : ""}`}>{day}</span>
                    <button
                      className="btn btn-success btn-sm p-0 lh-1"
                      style={{ width: 18, height: 18, fontSize: 12 }}
                      title="Novo agendamento"
                      onClick={e => { e.stopPropagation(); router.push(`/calendar/new?date=${year}-${padDate(month)}-${padDate(day)}`); }}
                    >
                      +
                    </button>
                  </div>
                  {dayActs.map(a => (
                    <div
                      key={a.id}
                      className={`badge bg-${STATUS_COLOR[a.status] || "secondary"} d-block text-truncate mb-1 text-start`}
                      style={{ fontSize: 10, padding: "3px 5px" }}
                    >
                      {a.time ? `${a.time} ` : ""}{a.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Painel do dia selecionado */}
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
            <button
              className="btn btn-primary btn-sm fw-semibold"
              onClick={() => router.push(`/calendar/new?date=${year}-${padDate(month)}-${padDate(selectedDay)}`)}
            >
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
                      <th className="fw-semibold text-uppercase text-muted ps-4" style={{ width: "10%" }}>Hora</th>
                      <th className="fw-semibold text-uppercase text-muted" style={{ width: "25%" }}>Serviço</th>
                      <th className="fw-semibold text-uppercase text-muted" style={{ width: "20%" }}>Cliente</th>
                      <th className="fw-semibold text-uppercase text-muted" style={{ width: "12%" }}>Status</th>
                      <th className="fw-semibold text-uppercase text-muted pe-4" style={{ width: "20%" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayActivities.map(a => (
                      <tr key={a.id} className="text-center align-middle">
                        <td className="fw-semibold ps-4">{a.time || "–"}</td>
                        <td>
                          <div className="fw-semibold">{a.title}</div>
                          {a.description && <div className="text-muted" style={{ fontSize: 11 }}>{a.description}</div>}
                        </td>
                        <td className="text-muted">{a.person?.name || "–"}</td>
                        <td>
                          <span className={`badge bg-${STATUS_COLOR[a.status] || "secondary"} bg-opacity-10 text-${STATUS_COLOR[a.status] || "secondary"} fw-semibold`}>
                            {STATUS_LABEL[a.status] || a.status}
                          </span>
                        </td>
                        <td className="pe-4">
                          <div className="d-flex gap-1 justify-content-center flex-wrap">
                            {a.status !== "confirmed" && (
                              <button className="btn btn-success btn-sm py-0 px-2" style={{ fontSize: 11 }} onClick={() => handleStatusChange(a.id, "confirmed")}>
                                Confirmar
                              </button>
                            )}
                            {a.status !== "cancelled" && (
                              <button className="btn btn-warning btn-sm py-0 px-2" style={{ fontSize: 11 }} onClick={() => handleStatusChange(a.id, "cancelled")}>
                                Cancelar
                              </button>
                            )}
                            {a.status === "cancelled" && (
                              <button className="btn btn-secondary btn-sm py-0 px-2" style={{ fontSize: 11 }} onClick={() => handleStatusChange(a.id, "pending")}>
                                Reabrir
                              </button>
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

    </PageLayout>
  );
}
