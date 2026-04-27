"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";

const MODULES = [
  { href: "/calendar", label: "Agenda",          desc: "Visualize e gerencie os agendamentos do mês",   icon: "bi-calendar3",        color: "primary"   },
  { href: "/persons",  label: "Clientes",         desc: "Cadastro de clientes e informações de contato", icon: "bi-people-fill",      color: "info"      },
  { href: "/items",    label: "Itens / Serviços", desc: "Gerencie os serviços e produtos oferecidos",    icon: "bi-box-seam-fill",    color: "secondary" },
  { href: "/report",   label: "Relatórios",       desc: "Gere relatórios de agendamentos por período",   icon: "bi-bar-chart-fill",   color: "warning"   },
  { href: "/users",    label: "Usuários",         desc: "Controle os usuários com acesso ao sistema",    icon: "bi-shield-lock-fill", color: "danger"    },
];

export default function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [persons, setPersons] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const now = new Date();
    const [actRes, personsRes, meRes] = await Promise.all([
      api.get(`/activities?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
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
  const monthYear = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });

  const STATS = [
    { label: "Agendamentos", value: activities.length, color: "primary"   },
    { label: "Confirmados",  value: confirmed,          color: "success"   },
    { label: "Pendentes",    value: pending,            color: "warning"   },
    { label: "Cancelados",   value: cancelled,          color: "danger"    },
    { label: "Clientes",     value: persons.length,     color: "secondary" },
  ];

  return (
    <div className="min-vh-100 bg-white">

      {/* ── Barra de navegação superior ── */}
      <nav className="navbar bg-white border-bottom shadow-sm px-4 py-2">
        <div className="container-fluid px-0">
          <div>
            <span className="fw-bold fs-5 text-primary">ERP System</span>
            <br />
            <small className="text-muted text-capitalize">{monthYear}</small>
          </div>
          <div className="d-flex align-items-center gap-3">
            {userName && (
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36, fontSize: 14 }}
                >
                  {userName[0].toUpperCase()}
                </div>
                <span className="fw-semibold small d-none d-sm-inline">{userName}</span>
              </div>
            )}
            <button className="btn btn-sm btn-outline-secondary" onClick={logout}>
              <i className="bi bi-box-arrow-right me-1"></i>Sair
            </button>
          </div>
        </div>
      </nav>

      {/* ── Conteúdo principal ── */}
      <div className="container-fluid p-4">

        {/* Métricas do mês */}
        <div className="row g-3 mb-4">
          {STATS.map(({ label, value, color }) => (
            <div className="col-6 col-md-4 col-xl" key={label}>
              <div className={`card border-0 border-top border-3 border-${color} shadow-sm h-100`}>
                <div className="card-body text-center py-3">
                  <div className={`fw-bold text-${color} lh-1`} style={{ fontSize: 36 }}>
                    {value}
                  </div>
                  <div className="text-muted fw-semibold text-uppercase mt-1" style={{ fontSize: 11, letterSpacing: 1 }}>
                    {label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Label de seção */}
        <p className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: 11, letterSpacing: 1 }}>
          Módulos do Sistema
        </p>

        {/* Cards de módulos */}
        <div className="row g-3">
          {MODULES.map(({ href, label, desc, icon, color }) => (
            <div className="col-12 col-sm-6 col-lg-4" key={href}>
              <a
                href={href}
                className={`card border-0 border-start border-4 border-${color} shadow-sm h-100 text-decoration-none text-dark`}
              >
                <div className="card-body d-flex align-items-center gap-3 py-3">
                  <div
                    className={`bg-${color} bg-opacity-10 text-${color} rounded-3 d-flex align-items-center justify-content-center flex-shrink-0`}
                    style={{ width: 48, height: 48 }}
                  >
                    <i className={`bi ${icon} fs-5`}></i>
                  </div>
                  <div className="overflow-hidden">
                    <div className="fw-bold small mb-1">{label}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: 12 }}>{desc}</div>
                  </div>
                  <i className="bi bi-chevron-right ms-auto text-muted small flex-shrink-0"></i>
                </div>
              </a>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
