"use client";

import { useConfig } from "../hooks/useConfig";

export default function PageLayout({ title, subtitle, actions, children }) {
  useConfig();
  return (
    <div className="min-vh-100 bg-white">

      {/* ── Cabeçalho da página ── */}
      <div className="bg-white border-bottom shadow-sm px-4 py-3 sticky-top">
        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div>
            <h5 className="fw-bold mb-0 text-dark">{title}</h5>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            {actions}
            <a href="/dashboard" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-arrow-left-short"></i> Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* ── Área de conteúdo ── */}
      <div className="container-fluid py-4 px-4">
        {children}
      </div>

      {/* ── Rodapé ── */}
      <footer className="border-top text-center py-3 mt-4">
        <small className="text-muted" style={{ fontSize: 11, letterSpacing: 0.5 }}>
          Powered by <span className="fw-semibold">BD Tech Development</span>
        </small>
      </footer>

    </div>
  );
}
