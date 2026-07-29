import React from "react";

export default function ManagerDashboard({ patients }) {
  const totalPatients = patients.length;
  const waitingCount = patients.filter((p) => p.status === "Waiting").length;
  const completedCount = patients.filter(
    (p) => p.status === "Completed",
  ).length;
  const inConsultationCount = patients.filter(
    (p) => p.status === "In Consultation",
  ).length;

  const estimatedRevenue = completedCount * 150 + inConsultationCount * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-100">
          Practice & Operational Analytics
        </h1>
        <p className="text-xs text-slate-400">
          High-level insights into patient throughput, clinic capacity, and
          revenue.
        </p>
      </div>

      {/* Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
            Total Registrations
          </span>
          <p className="text-2xl font-bold text-slate-100 mt-1">
            {totalPatients}
          </p>
          <span className="text-[10px] text-teal-400 mt-1 block">
            Active today
          </span>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
            Waiting Room Queue
          </span>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {waitingCount}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Avg wait time: ~14 mins
          </span>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
            Completed Consultations
          </span>
          <p className="text-2xl font-bold text-teal-400 mt-1">
            {completedCount}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Discharged today
          </span>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
            Est. Consultation Revenue
          </span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            ${estimatedRevenue}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Based on $150 standard fee
          </span>
        </div>
      </div>

      {/* Staff Roster Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Staff Duty Roster & Workload
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">
                Dr. Sarah Jenkins
              </span>
              <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/20">
                On Duty
              </span>
            </div>
            <p className="text-slate-500">General Medicine • Morning Shift</p>
            <p className="text-slate-400 text-[11px]">
              Active Queue:{" "}
              <span className="text-teal-400 font-semibold">
                {waitingCount + inConsultationCount} patients
              </span>
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">Dr. Robert Chen</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                In Surgery
              </span>
            </div>
            <p className="text-slate-500">Cardiology • Morning Shift</p>
            <p className="text-slate-400 text-[11px]">
              Active Queue:{" "}
              <span className="text-teal-400 font-semibold">1 patient</span>
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">Dr. Amara Okafor</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                Off Duty
              </span>
            </div>
            <p className="text-slate-500">Pediatrics • Evening Shift</p>
            <p className="text-slate-400 text-[11px]">
              Starts at:{" "}
              <span className="text-slate-300 font-semibold">02:00 PM</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
