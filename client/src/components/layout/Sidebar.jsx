import React from "react";
import { useAuth } from "../../useAuth";
import { BrandLockup } from "../common/BrandLockup";

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case "patient":
        return [
          { id: "dashboard", label: "Dashboard" },
          { id: "booking", label: "Book Appointment" },
          { id: "history", label: "Medical History" },
        ];
      case "receptionist":
        return [
          { id: "dashboard", label: "Reception Dashboard" },
          { id: "registration", label: "Register Patient" },
          { id: "booking", label: "Schedule Appointment" },
          { id: "patients", label: "Patient Directory" },
        ];
      case "doctor":
        return [
          { id: "dashboard", label: "Doctor Dashboard" },
          { id: "patients", label: "Patients" },
        ];
      case "nurse":
        return [
          { id: "dashboard", label: "Nurse Portal" },
          { id: "patients", label: "Patient Directory" },
        ];
      case "manager":
        return [{ id: "dashboard", label: "Manager Dashboard" }];
      case "admin":
        return [
          { id: "dashboard", label: "System Overview" },
          { id: "users", label: "User Administration" },
          { id: "patients", label: "Patients" },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between p-6">
      <div className="space-y-8">
        <BrandLockup light />
        <nav className="space-y-1">
          {getNavItems().map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition ${
                activeTab === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-800 space-y-4">
        <div className="px-2">
          <p className="text-sm font-semibold text-white truncate">
            {user?.email}
          </p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-blue-900 text-blue-200 capitalize font-medium">
            {user?.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/50 rounded-lg transition"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};
