import { Calendar, LayoutDashboard, LogOut, UserPlus } from "lucide-react";

export default function Sidebar({ user, activeTab, setActiveTab, onLogout }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4">
      <div className="space-y-6">
        <div className="px-2 pt-2 text-white font-bold text-lg tracking-wider border-b border-slate-800 pb-4">
          CareConnect CCAS
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>

          {(user.role === "Receptionist" ||
            user.role === "System Administrator") && (
            <button
              onClick={() => setActiveTab("register")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "register"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800"
              }`}
            >
              <UserPlus className="w-4 h-4" /> Register Patient
            </button>
          )}

          <button
            onClick={() => setActiveTab("booking")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "booking"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" /> Book Appointment
          </button>
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4">
        <div className="px-2 mb-3">
          <p className="text-xs text-slate-500 uppercase font-semibold">
            User Role
          </p>
          <p className="text-sm font-medium text-slate-200">{user.role}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
