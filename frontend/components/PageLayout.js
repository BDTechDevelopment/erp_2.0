"use client";

export default function PageLayout({ title, subtitle, actions, color = "#0d6efd", children }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>

      {/* Barra de topo */}
      <div
        className="d-flex justify-content-between align-items-center px-4 py-3 shadow-sm"
        style={{ backgroundColor: "#fff", borderBottom: `3px solid ${color}` }}
      >
        <div>
          <h5 className="mb-0 fw-bold" style={{ color }}>{title}</h5>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div className="d-flex gap-2 flex-wrap align-items-center">
          {actions}
          <a href="/dashboard" className="btn btn-outline-secondary btn-sm">← Dashboard</a>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container-fluid px-4 py-4">
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          {children}
        </div>
      </div>

    </div>
  );
}
