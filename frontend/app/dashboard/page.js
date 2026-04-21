"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";

const NAV_CARDS = [
  { href: "/calendar",  label: "Agenda",           desc: "Visualize e gerencie os agendamentos do mês",     color: "#198754" },
  { href: "/persons",   label: "Clientes",          desc: "Cadastro de clientes e informações de contato",   color: "#0dcaf0" },
  { href: "/items",     label: "Itens / Serviços",  desc: "Gerencie os serviços e produtos oferecidos",      color: "#6610f2" },
  { href: "/report",    label: "Relatórios",        desc: "Gere relatórios de agendamentos por período",     color: "#fd7e14" },
  { href: "/users",     label: "Gerenciar Logins",  desc: "Controle os usuários com acesso ao sistema",      color: "#dc3545" },
];

export default function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [persons, setPersons] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    const [actRes, personsRes, meRes] = await Promise.all([
      api.get(`/activities?month=${month}&year=${year}`),
      api.get("/persons"),
      api.get("/me"),
    ]);

    setActivities(actRes.data);
    setPersons(personsRes.data);
    setUserName(meRes.data.name);
  }

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  const confirmed = activities.filter(a => a.status === "confirmed").length;
  const pending   = activities.filter(a => a.status === "pending").length;
  const cancelled = activities.filter(a => a.status === "cancelled").length;
  const monthName = new Date().toLocaleString("pt-BR", { month: "long" });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0d6efd 0%, #3a8bfd 100%)" }}>

      {/* ── Topbar ── */}
      <div className="d-flex justify-content-between align-items-center px-4 py-4">
        <div>
          <h3 className="text-white fw-bold mb-0">ERP</h3>
          <small className="text-capitalize" style={{ color: "rgba(255,255,255,.75)" }}>
            {monthName} {new Date().getFullYear()}
          </small>
        </div>
        <div className="text-end">
          {userName && <div className="text-white fw-semibold">{userName}</div>}
          <button className="btn btn-light btn-sm mt-1" onClick={logout}>Sair</button>
        </div>
      </div>

      <div className="px-4 pb-5">

        {/* ── Métricas ── */}
        <div className="row g-3 mb-4">
          {[
            { label: "Agendamentos",  value: activities.length, bg: "rgba(255,255,255,.95)", color: "#0d6efd" },
            { label: "Confirmados",   value: confirmed,          bg: "rgba(255,255,255,.95)", color: "#198754" },
            { label: "Pendentes",     value: pending,            bg: "rgba(255,255,255,.95)", color: "#fd7e14" },
            { label: "Cancelados",    value: cancelled,          bg: "rgba(255,255,255,.95)", color: "#dc3545" },
            { label: "Clientes",      value: persons.length,     bg: "rgba(255,255,255,.95)", color: "#6f42c1" },
          ].map(({ label, value, bg, color }) => (
            <div className="col-6 col-md-4 col-lg" key={label}>
              <div
                className="card border-0 shadow text-center py-3"
                style={{ background: bg, borderRadius: 12, borderTop: `4px solid ${color}` }}
              >
                <div className="fw-bold" style={{ fontSize: 34, color }}>{value}</div>
                <small className="text-muted fw-semibold" style={{ fontSize: 12 }}>{label}</small>
              </div>
            </div>
          ))}
        </div>

        {/* ── Módulos ── */}
        <p className="text-white fw-semibold small mb-3" style={{ letterSpacing: 1, opacity: .85 }}>
          MÓDULOS
        </p>
        <div className="row g-3">
          {NAV_CARDS.map(({ href, label, desc, color }) => (
            <div className="col-12 col-sm-6 col-lg-4" key={href}>
              <a
                href={href}
                className="card border-0 shadow text-decoration-none h-100"
                style={{ borderRadius: 12, borderLeft: `5px solid ${color}`, transition: "transform .15s, box-shadow .15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <div className="card-body py-3">
                  <div className="fw-bold mb-1" style={{ color, fontSize: 16 }}>{label}</div>
                  <p className="text-muted small mb-2">{desc}</p>
                  <span style={{ color, fontSize: 13 }}>Acessar →</span>
                </div>
              </a>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
