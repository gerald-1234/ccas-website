import React, { useState } from "react";

export default function DoctorDashboard({ user, patients, setPatients }) {
  const doctorPatients = patients.filter((p) => p.status !== "Completed");
  const [selectedPatient, setSelectedPatient] = useState(
    doctorPatients[0] || null,
  );

  // Form State for Active Consultation
  const [vitals, setVitals] = useState({
    bp: "120/80",
    pulse: "72 bpm",
    temp: "98.6 °F",
  });
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [currentMed, setCurrentMed] = useState({
    name: "",
    dosage: "",
    frequency: "",
  });

  const handleAddMedication = () => {
    if (!currentMed.name || !currentMed.dosage) return;
    setPrescriptions((prev) => [...prev, currentMed]);
    setCurrentMed({ name: "", dosage: "", frequency: "" });
  };

  const handleRemoveMedication = (index) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCompleteConsultation = () => {
    if (!selectedPatient) return;

    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatient.id
          ? { ...p, status: "Completed", diagnosis, prescriptions }
          : p,
      ),
    );

    // Reset form & auto-select next waiting patient
    setDiagnosis("");
    setPrescriptions([]);
    const remaining = doctorPatients.filter((p) => p.id !== selectedPatient.id);
    setSelectedPatient(remaining[0] || null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Doctor Workstation
          </h1>
          <p className="text-xs text-slate-400">
            Welcome back, {user?.email || "Dr. Jenkins"}. You have{" "}
            {doctorPatients.length} pending patient(s).
          </p>
        </div>
        <span className="self-start sm:self-auto px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-full">
          On Duty • General Medicine
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Waiting / In-Consultation Queue */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Today's Patient Queue
          </h3>
          <div className="space-y-2">
            {doctorPatients.length === 0 ? (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                No active patients in queue.
              </div>
            ) : (
              doctorPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedPatient?.id === p.id
                      ? "bg-teal-500/10 border-teal-500/40 shadow-lg"
                      : "bg-slate-900 border-slate-800 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-semibold text-teal-400">
                      {p.id}
                    </span>
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                        p.status === "In Consultation"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mt-1">
                    {p.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {p.reason}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Active Consultation Workspace */}
        <div className="lg:col-span-8">
          {selectedPatient ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Patient Banner */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-950 border border-slate-800 rounded-xl gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-slate-100">
                      {selectedPatient.name}
                    </h2>
                    <span className="text-xs font-mono text-teal-400">
                      ({selectedPatient.id})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedPatient.age} yrs • {selectedPatient.gender} • Blood
                    Group:{" "}
                    <span className="text-teal-400 font-semibold">
                      {selectedPatient.bloodGroup}
                    </span>
                  </p>
                </div>
                <div className="text-xs text-slate-400 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Chief Complaint
                  </span>
                  <span className="text-slate-200 font-medium">
                    {selectedPatient.reason}
                  </span>
                </div>
              </div>

              {/* Vitals Logging Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Patient Vitals
                </h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">
                      Blood Pressure
                    </span>
                    <input
                      type="text"
                      value={vitals.bp}
                      onChange={(e) =>
                        setVitals({ ...vitals, bp: e.target.value })
                      }
                      className="w-full bg-transparent font-semibold text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">
                      Pulse Rate
                    </span>
                    <input
                      type="text"
                      value={vitals.pulse}
                      onChange={(e) =>
                        setVitals({ ...vitals, pulse: e.target.value })
                      }
                      className="w-full bg-transparent font-semibold text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">
                      Body Temp
                    </span>
                    <input
                      type="text"
                      value={vitals.temp}
                      onChange={(e) =>
                        setVitals({ ...vitals, temp: e.target.value })
                      }
                      className="w-full bg-transparent font-semibold text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Notes / Diagnosis */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Clinical Diagnosis & Notes
                </h4>
                <textarea
                  rows={3}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnostic findings, examination notes, and recommendations..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Prescription Builder */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Prescription Builder
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Medication name"
                    value={currentMed.name}
                    onChange={(e) =>
                      setCurrentMed({ ...currentMed, name: e.target.value })
                    }
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 500mg)"
                    value={currentMed.dosage}
                    onChange={(e) =>
                      setCurrentMed({ ...currentMed, dosage: e.target.value })
                    }
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Freq (e.g. 2x/day)"
                      value={currentMed.frequency}
                      onChange={(e) =>
                        setCurrentMed({
                          ...currentMed,
                          frequency: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      onClick={handleAddMedication}
                      className="px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Added Prescriptions List */}
                {prescriptions.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {prescriptions.map((med, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl text-xs"
                      >
                        <div>
                          <span className="font-semibold text-teal-400">
                            {med.name}
                          </span>
                          <span className="text-slate-400 ml-2">
                            ({med.dosage} - {med.frequency})
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveMedication(idx)}
                          className="text-rose-400 hover:text-rose-300 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Complete Consultation Button */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleCompleteConsultation}
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all"
                >
                  ✓ Complete Consultation
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 text-xs">
              Select a patient from the queue to start a consultation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
