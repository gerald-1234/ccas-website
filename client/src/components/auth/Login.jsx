import React, { useState } from "react";
import { ShieldCheck, UserCheck } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Doctor");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username) return alert("Username is required");
    onLogin({ name: username, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-center mb-6 text-blue-600 gap-2">
          <ShieldCheck className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">
            CareConnect CCAS
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Dr. M. Adams"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="Doctor">Doctor</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Nurse">Nurse</option>
              <option value="Clinic Manager">Clinic Manager</option>
              <option value="System Administrator">System Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" /> Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
