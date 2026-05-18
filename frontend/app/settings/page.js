"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";
import PageLayout from "../../components/PageLayout";

const DEFAULT = {
  companyName: "",
  logoUrl: "",
  primaryColor: "#0d6efd",
  address: "",
  phone: "",
  email: "",
};

export default function Settings() {
  const [form, setForm]       = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [logoError, setLogoError] = useState("");

  useEffect(() => {
    api.get("/config")
      .then((r) => setForm({ ...DEFAULT, ...r.data }))
      .finally(() => setLoading(false));
  }, []);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLogoError("");
    if (file.size > 500 * 1024) {
      setLogoError("Imagem muito grande. Use até 500 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => set("logoUrl", ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/config", form);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <PageLayout title="Configurações do Sistema" subtitle="Personalize o nome, cores e informações do seu ERP">
      <div className="row g-4">

        {/* Formulário */}
        <div className="col-12 col-lg-7">
          <form onSubmit={handleSubmit}>

            {/* Identidade */}
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-body p-4">
                <h6 className="fw-bold text-uppercase text-muted mb-3" style={{ fontSize: 11, letterSpacing: 1 }}>
                  Identidade
                </h6>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Nome da Empresa</label>
                  <input
                    className="form-control"
                    placeholder="Ex: Minha Empresa Ltda"
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Logo</label>
                  <div className="d-flex align-items-center gap-3">
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
                        alt="Logo"
                        style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 8, border: "1px solid #dee2e6", background: "#f8f9fa", padding: 4 }}
                      />
                    ) : (
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                        style={{ width: 56, height: 56, background: form.primaryColor, fontSize: 22 }}
                      >
                        {(form.companyName || "E")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control form-control-sm"
                        onChange={handleLogoUpload}
                      />
                      <div className="form-text">PNG, JPG ou SVG. Máx. 500 KB.</div>
                      {logoError && <div className="text-danger small mt-1">{logoError}</div>}
                    </div>
                    {form.logoUrl && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger flex-shrink-0"
                        onClick={() => { set("logoUrl", ""); setLogoError(""); }}
                        title="Remover logo"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-1">
                  <label className="form-label fw-semibold small">Cor Primária</label>
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={form.primaryColor}
                      onChange={(e) => set("primaryColor", e.target.value)}
                      style={{ width: 56, height: 40 }}
                    />
                    <span className="text-muted small font-monospace">{form.primaryColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-body p-4">
                <h6 className="fw-bold text-uppercase text-muted mb-3" style={{ fontSize: 11, letterSpacing: 1 }}>
                  Informações de Contato
                </h6>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Endereço</label>
                  <input
                    className="form-control"
                    placeholder="Rua Exemplo, 123 – Cidade/UF"
                    value={form.address || ""}
                    onChange={(e) => set("address", e.target.value)}
                  />
                </div>

                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small">Telefone</label>
                    <input
                      className="form-control"
                      placeholder="(11) 99999-9999"
                      value={form.phone || ""}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small">E-mail</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="contato@empresa.com"
                      value={form.email || ""}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                {saving ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Salvando...</>
                ) : (
                  <><i className="bi bi-check-lg me-1"></i>Salvar Configurações</>
                )}
              </button>
              {saved && (
                <span className="text-success small fw-semibold">
                  <i className="bi bi-check-circle me-1"></i>Salvo com sucesso!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-3 sticky-top" style={{ top: 80 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase text-muted mb-3" style={{ fontSize: 11, letterSpacing: 1 }}>
                Pré-visualização
              </h6>

              {/* Navbar simulada */}
              <div
                className="rounded-3 p-3 mb-3 d-flex align-items-center justify-content-between"
                style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
              >
                <div className="d-flex align-items-center gap-2">
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt="Logo"
                      style={{ height: 32, width: 32, objectFit: "contain", borderRadius: 4 }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div
                      className="rounded-2 d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{ width: 32, height: 32, background: form.primaryColor, fontSize: 14 }}
                    >
                      {(form.companyName || "E")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="fw-bold small" style={{ color: form.primaryColor }}>
                    {form.companyName || "ERP System"}
                  </span>
                </div>
                <div
                  className="rounded-pill px-3 py-1 text-white small"
                  style={{ background: form.primaryColor, fontSize: 11 }}
                >
                  Dashboard
                </div>
              </div>

              {/* Card de módulo simulado */}
              <div
                className="rounded-3 p-3 d-flex align-items-center gap-3"
                style={{
                  border: `3px solid ${form.primaryColor}`,
                  borderLeft: `4px solid ${form.primaryColor}`,
                  background: "#fff",
                }}
              >
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: 40, height: 40, background: form.primaryColor, opacity: 0.85 }}
                >
                  <i className="bi bi-calendar3"></i>
                </div>
                <div>
                  <div className="fw-bold small">Agenda</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>Visualize os agendamentos</div>
                </div>
              </div>

              {/* Infos de contato */}
              {(form.address || form.phone || form.email) && (
                <div className="mt-3 pt-3 border-top">
                  {form.address && (
                    <div className="text-muted small mb-1">
                      <i className="bi bi-geo-alt me-1"></i>{form.address}
                    </div>
                  )}
                  {form.phone && (
                    <div className="text-muted small mb-1">
                      <i className="bi bi-telephone me-1"></i>{form.phone}
                    </div>
                  )}
                  {form.email && (
                    <div className="text-muted small">
                      <i className="bi bi-envelope me-1"></i>{form.email}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
