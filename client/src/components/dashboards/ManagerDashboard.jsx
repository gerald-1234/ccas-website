import React, { useState, useEffect } from "react";
import { apiRequest } from "../../config/api";

export const ManagerDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await apiRequest("/reports/summary");
        setSummary(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Clinic Analytics & Performance
      </h1>
      {loading ? (
        <p className="text-slate-500">Generating analytical aggregates...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Total Appointments
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              {summary?.total_appointments || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Attendance Rate
            </p>
            <p className="text-3xl font-extrabold text-green-600 mt-2">
              {summary?.attendance_rate || "0%"}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Completed Cases
            </p>
            <p className="text-3xl font-extrabold text-blue-600 mt-2">
              {summary?.completed_count || 0}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
