import React, { useState, useEffect } from "react";
import { apiRequest } from "../../config/api";

export const PatientDirectory = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPatients = async (query = "") => {
    setLoading(true);
    try {
      const res = await apiRequest(
        `/patients?search=${encodeURIComponent(query)}&page=1&limit=20`,
      );
      setPatients(res.patients || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(search);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">Patient Directory</h2>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm py-4">
          Loading patient records...
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold border-b">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Gender</th>
                <th className="p-3">DOB</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Blood Group</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">
                    {p.first_name} {p.last_name}
                  </td>
                  <td className="p-3">{p.gender}</td>
                  <td className="p-3">{p.date_of_birth}</td>
                  <td className="p-3">{p.phone}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded text-xs">
                      {p.blood_group}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
