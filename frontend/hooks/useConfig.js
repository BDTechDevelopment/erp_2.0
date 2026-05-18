"use client";

import { useEffect, useState } from "react";
import api from "../services/api";

const DEFAULT = { companyName: "ERP System", primaryColor: "#0d6efd" };

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function applyColor(color) {
  const root = document.documentElement;
  root.style.setProperty("--bs-primary", color);
  root.style.setProperty("--bs-primary-rgb", hexToRgb(color));
  root.style.setProperty("--bs-link-color", color);
  root.style.setProperty("--bs-link-hover-color", color);
  root.style.setProperty("--bs-btn-bg", color);
}

export function useConfig() {
  const [config, setConfig] = useState(DEFAULT);

  useEffect(() => {
    api.get("/config").then((r) => {
      const data = { ...DEFAULT, ...r.data };
      setConfig(data);
      if (data.primaryColor) applyColor(data.primaryColor);
    }).catch(() => {});
  }, []);

  return config;
}
