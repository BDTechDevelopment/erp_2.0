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
  const [date, setDate] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayActivities, setDayActivities] = useState([]);

  const year  = date.getFullYear();
  const month = date.getMonth() + 1;

  const today = new Date();
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
    ...Array.from({ length: totalDays }, (_, i) => i + 1)
  ];

  return (
    <PageLayout title="Agenda" subtitle="Visualize e gerencie os agendamentos do mês" color="#198754">
      <div className="card-body p-3">
      <div className="row g-3">

        {/* ══════════════ CALENDÁRIO ══════════════ */}
        <div className="col-12">

          {/* Navegação de mês */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <button
              className="btn btn-outline-primary"
              onClick={() => setDate(new Date(year, month - 2))}
            >
              ← Anterior
            </button>
            <h4 className="mb-0 fw-semibold text-capitalize">
              {date.toLocaleString("pt-BR", { month: "long" })} {year}
            </h4>
            <button
              className="btn btn-outline-primary"
              onClick={() => setDate(new Date(year, month))}
            >
              Próximo →
            </button>
          </div>

          {/* Cabeçalho dias da semana */}
          <div className="row g-2 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="col text-center fw-bold text-secondary" style={{ fontSize: 14 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grade */}
          <div className="row g-2">
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} className="col" style={{ minHeight: 140 }} />;

              const dayActs    = activities.filter(a => new Date(a.activityDate).getUTCDate() === day);
              const isSelected = selectedDay === day;
              const isToday    = day === todayDay && month === todayMonth && year === todayYear;

              let cellClass = "border rounded p-2 h-100 ";
              if (isSelected)   cellClass += "border-primary border-2 bg-primary bg-opacity-10";
              else if (isToday) cellClass += "border-warning border-2 bg-warning bg-opacity-10";

              return (
                <div key={day} className="col">
                  <div
                    className={cellClass}
                    style={{ cursor: "pointer", minHeight: 140 }}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span
                        className={`fw-bold ${isToday ? "text-warning" : ""}`}
                        style={{ fontSize: 18 }}
                      >
                        {day}
                      </span>
                      <button
                        className="btn btn-success btn-sm"
                        style={{ fontSize: 14, lineHeight: 1, padding: "2px 7px" }}
                        title="Novo agendamento"
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/calendar/new?date=${year}-${padDate(month)}-${padDate(day)}`);
                        }}
                      >
                        +
                      </button>
                    </div>

                    {dayActs.map(a => (
                      <div
                        key={a.id}
                        className={`badge bg-${STATUS_COLOR[a.status] || "secondary"} d-block text-truncate mb-1 text-start`}
                        style={{ fontSize: 11, maxWidth: "100%", padding: "4px 6px" }}
                      >
                        {a.time ? a.time + "  " : ""}{a.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════ PAINEL DO DIA (abaixo) ══════════════ */}
        <div className="col-12">
          <div>

            {!selectedDay ? (
              <div
                className="card shadow-sm text-center text-muted py-5"
                style={{ border: "2px dashed #dee2e6" }}
              >
                <p className="mb-1 fs-5">Selecione um dia</p>
                <small>Clique em qualquer data do calendário para ver os agendamentos</small>
              </div>
            ) : (
              <div className="card shadow-sm">

                {/* Cabeçalho do painel */}
                <div className="card-header bg-primary text-white d-flex justify-content-center align-items-center gap-3 py-2">
                  <span className="fw-semibold">
                    {padDate(selectedDay)}/{padDate(month)}/{year}
                  </span>
                  <button
                    className="btn btn-sm btn-light"
                    onClick={() =>
                      router.push(`/calendar/new?date=${year}-${padDate(month)}-${padDate(selectedDay)}`)
                    }
                  >
                    + Novo
                  </button>
                </div>

                {/* Lista de agendamentos */}
                <div>
                  {dayActivities.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <p className="mb-0">Nenhum agendamento neste dia.</p>
                    </div>
                  ) : (
                    <table className="table table-hover table-sm mb-0 small w-100">
                      <thead className="table-light">
                        <tr className="text-center">
                          <th style={{ width: "8%" }}>Hora</th>
                          <th style={{ width: "25%" }}>Serviço</th>
                          <th style={{ width: "20%" }}>Cliente</th>
                          <th style={{ width: "12%" }}>Status</th>
                          <th style={{ width: "18%" }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayActivities.map(a => (
                          <tr key={a.id} className="text-center align-middle">
                            <td className="fw-semibold">{a.time || "–"}</td>
                            <td className="text-center">
                              <div className="fw-medium">{a.title}</div>
                              {a.description && (
                                <div className="text-muted" style={{ fontSize: 11 }}>
                                  {a.description}
                                </div>
                              )}
                            </td>
                            <td>{a.person?.name || "–"}</td>
                            <td>
                              <span className={`badge bg-${STATUS_COLOR[a.status] || "secondary"}`}>
                                {STATUS_LABEL[a.status] || a.status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex flex-row gap-1 justify-content-center flex-wrap">
                                {a.status !== "confirmed" && (
                                  <button
                                    className="btn btn-success btn-sm py-0 px-1"
                                    style={{ fontSize: 11 }}
                                    onClick={() => handleStatusChange(a.id, "confirmed")}
                                  >
                                    Confirmar
                                  </button>
                                )}
                                {a.status !== "cancelled" && (
                                  <button
                                    className="btn btn-warning btn-sm py-0 px-1"
                                    style={{ fontSize: 11 }}
                                    onClick={() => handleStatusChange(a.id, "cancelled")}
                                  >
                                    Cancelar
                                  </button>
                                )}
                                {a.status === "cancelled" && (
                                  <button
                                    className="btn btn-secondary btn-sm py-0 px-1"
                                    style={{ fontSize: 11 }}
                                    onClick={() => handleStatusChange(a.id, "pending")}
                                  >
                                    Reabrir
                                  </button>
                                )}
                                <button
                                  className="btn btn-outline-danger btn-sm py-0 px-1"
                                  style={{ fontSize: 11 }}
                                  onClick={() => handleDelete(a.id)}
                                >
                                  Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
      </div>
    </PageLayout>
  );
}
