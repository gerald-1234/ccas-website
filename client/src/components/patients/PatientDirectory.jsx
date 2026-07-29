import React, { useState } from "react";

export default function PatientDirectory({ patients }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Patient Directory & EHR Records
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search demographic data, medical histories, and emergency contacts.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, ID or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Directory Table & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table List */}
        <div className={selectedPatient ? "lg:col-span-7" : "lg:col-span-12"}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Patient Name</th>
                    <th className="p-3.5">Age / Gender</th>
                    <th className="p-3.5">Blood Group</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        selectedPatient?.id === patient.id
                          ? "bg-slate-800/60"
                          : ""
                      }`}
                    >
                      <td className="p-3.5 font-mono text-teal-400 font-semibold">
                        {patient.id}
                      </td>
                      <td className="p-3.5 font-medium text-slate-100">
                        {patient.name}
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {patient.age} yrs / {patient.gender}
                      </td>
                      <td className="p-3.5 text-slate-300 font-medium">
                        {patient.bloodGroup}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            patient.status === "Waiting"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : patient.status === "In Consultation"
                                ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="px-3 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg text-[11px] font-medium border border-teal-500/20 transition-all"
                        >
                          View EHR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Patient Drawer */}
        {selectedPatient && (
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative space-y-4">
              <button
                onClick={() => setSelectedPatient(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-sm font-bold"
              >
                ✕
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-lg">
                  {selectedPatient.name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {selectedPatient.name}
                  </h3>
                  <p className="text-xs text-teal-400 font-mono">
                    {selectedPatient.id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-800 py-3">
                <div>
                  <p className="text-slate-500">Phone</p>
                  <p className="text-slate-200 font-medium">
                    {selectedPatient.phone}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="text-slate-200 font-medium truncate">
                    {selectedPatient.email}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Blood Group</p>
                  <p className="text-teal-400 font-bold">
                    {selectedPatient.bloodGroup}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Known Allergies</p>
                  <p className="text-rose-400 font-medium">
                    {selectedPatient.allergies}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Medical History
                </h4>
                <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedPatient.medicalHistory ||
                    "No prior medical conditions logged."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Emergency Contact
                </h4>
                <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedPatient.emergencyContact || "Not provided."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
