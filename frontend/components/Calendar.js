"use client";

import { useState, useEffect } from "react";
import api from "../services/api";

export default function Calendar() {
  const [date, setDate] = useState(new Date());
  const [activities, setActivities] = useState([]);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  useEffect(() => {
    loadActivities();
  }, [month, year]);

  async function loadActivities() {
    const res = await api.get(`/activities?month=${month}&year=${year}`);
    setActivities(res.data);
  }

  async function createActivity(day) {
    const title = prompt("Título da atividade:");

    if (!title) return;

    const activityDate = `${year}-${month}-${day}`;

    await api.post("/activities", {
      title,
      activity_date: activityDate
    });

    loadActivities();
  }

  const days = new Date(year, month, 0).getDate();

  return (
    <div>
      <div className="flex justify-between">
        <button onClick={() => setDate(new Date(year, month - 2))}>←</button>
        <h2>{date.toLocaleString("pt-BR", { month: "long" })}</h2>
        <button onClick={() => setDate(new Date(year, month))}>→</button>
      </div>

      <div className="grid grid-cols-7 gap-2 mt-4">
        {[...Array(days)].map((_, i) => {
          const day = i + 1;

          const hasActivity = activities.some(a => {
            return new Date(a.activityDate).getDate() === day;
          });

          return (
            <div
              key={day}
              className={`border p-4 cursor-pointer ${hasActivity ? "bg-green-200" : ""}`}
              onClick={() => createActivity(day)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}