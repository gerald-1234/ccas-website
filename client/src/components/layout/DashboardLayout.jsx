import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../../config/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const location = useLocation();

  useEffect(() => {
    // Set initial page title based on the current path
    const pathKey = location.pathname.split("/").pop();
    const currentNavItem = NAV_ITEMS[pathKey];
    if (currentNavItem) {
      setPageTitle(currentNavItem.label);
    }
  }, [location.pathname]);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavChange={setPageTitle}
      />
      <div className="flex flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle={pageTitle}
        />
        <main className="flex-1 p-4 sm:p-6 bg-slate-50">
          {/*
            The original Dashboard.jsx had its own padding.
            We render the children directly here to avoid double padding.
          */}
          {children}
        </main>
      </div>
    </div>
  );
};
