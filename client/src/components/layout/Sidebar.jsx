import { NavLink } from "react-router-dom";
// import { useAuth } from "../../AuthContext";
import { useAuth } from "../../useAuth.js";
import { NAV_ITEMS, ROLE_PAGES } from "../../config/navigation";
import { BrandLockup } from "../common/BrandLockup";

export const Sidebar = ({ isOpen, onClose, onNavChange }) => {
  const { user } = useAuth();
  const allowedPages = ROLE_PAGES[user?.role] || [];

  const groupedPages = allowedPages.reduce((acc, pageKey) => {
    const item = NAV_ITEMS[pageKey];
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push({ key: pageKey, ...item });
    return acc;
  }, {});

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity sm:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r bg-white p-4 transition-transform sm:translate-x-0 sm:static sm:z-auto ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="mb-6">
          <BrandLockup size="sm" />
        </div>
        <nav className="flex flex-col gap-4">
          {Object.entries(groupedPages).map(([section, items]) => (
            <div key={section}>
              <p className="mb-2 px-2 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                {section}
              </p>
              <div className="flex flex-col gap-1">
                {items.map((item) => (
                  <NavLink
                    key={item.key}
                    to={`/dashboard/${item.key}`}
                    onClick={() => {
                      onNavChange(item.label);
                      onClose();
                    }}
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "text-slate-600 hover:bg-slate-100"
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};
