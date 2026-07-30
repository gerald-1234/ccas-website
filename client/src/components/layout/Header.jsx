import { Bell, LogOut, Menu, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../useAuth.js";

const ROLE_STYLES = {
  patient: "bg-blue-100 text-blue-700",
  receptionist: "bg-purple-100 text-purple-700",
  doctor: "bg-emerald-100 text-emerald-700",
  nurse: "bg-pink-100 text-pink-700",
  manager: "bg-amber-100 text-amber-700",
  admin: "bg-slate-800 text-white",
};

const initials = (user) => {
  if (!user) return "";
  const first = user.first_name?.[0] || "";
  const last = user.last_name?.[0] || "";
  return `${first}${last}`.toUpperCase();
};

const titleCase = (str) => {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
};

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export const Header = ({ onMenuClick, pageTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  const avatarStyle = ROLE_STYLES[user?.role] || "bg-slate-200 text-slate-600";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 backdrop-blur-sm px-4 sm:px-6 shadow-sm">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="sm:hidden -ml-1 p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </button>

      {/* Page Title */}
      <div className="min-w-0 flex-1">
        <p className="hidden sm:block text-xs font-medium text-slate-400 leading-none mb-0.5">
          Dashboard
        </p>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Notification Shortcut */}
        <button
          onClick={() => navigate("/dashboard/notifications")}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-full pr-1 sm:pr-2 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarStyle}`}
            >
              {initials(user)}
            </div>
            <div className="hidden sm:flex flex-col items-start min-w-0 max-w-[140px]">
              <span className="text-sm font-semibold text-slate-800 truncate w-full text-left">
                {user?.first_name} {user?.last_name}
              </span>
              <span className="text-xs text-slate-500">
                {titleCase(user?.role)}
              </span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl bg-white shadow-lg border border-slate-100 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 sm:hidden">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-slate-500">
                  {titleCase(user?.role)}
                </p>
              </div>
              <div className="py-1.5">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/dashboard/account");
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>My Account</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
