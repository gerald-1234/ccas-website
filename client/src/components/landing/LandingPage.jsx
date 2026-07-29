export default function LandingPage({ onGetStarted }) {
  const features = [
    {
      title: "Doctor Portal",
      description:
        "Access patient electronic health records, daily consultation queues, and prescription management.",
      icon: (
        <svg
          className="w-6 h-6 text-teal-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      badge: "Clinicians",
    },
    {
      title: "Front-Desk Reception",
      description:
        "Streamline patient check-ins, process walk-ins, and manage real-time waiting room statuses.",
      icon: (
        <svg
          className="w-6 h-6 text-teal-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4"
          />
        </svg>
      ),
      badge: "Receptionists",
    },
    {
      title: "Practice Management",
      description:
        "Monitor daily operations, track clinic capacity analytics, and manage staff schedules.",
      icon: (
        <svg
          className="w-6 h-6 text-teal-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      badge: "Managers",
    },
  ];

  const stats = [
    { value: "99.9%", label: "System Uptime" },
    { value: "< 2 min", label: "Patient Check-in Time" },
    { value: "HIPAA", label: "Compliant Security" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Header / Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-lg">
              ┼
            </div>
            <span className="font-bold text-lg text-slate-100 tracking-tight">
              CareConnect
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onGetStarted}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/10"
            >
              Access Portal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
            <span>Clinical Workspace System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
            Modern Patient Care, <br />
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Simplified Workflows.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            CareConnect is an integrated clinic platform designed for doctors,
            receptionists, and practice managers. Streamline appointments,
            manage patient flow, and enhance consultations in one place.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-xl shadow-teal-500/20"
            >
              Sign In to Demo Workspace
            </button>
          </div>
        </div>

        {/* System Highlights / Stats */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-3 gap-4 border border-slate-800 bg-slate-900/40 p-6 rounded-2xl backdrop-blur-xl">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-xl sm:text-3xl font-extrabold text-teal-400">
                {stat.value}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-slate-900/60 border-t border-b border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Tailored for Every Role
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Designed specifically for healthcare teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all hover:border-slate-700 hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="mt-auto py-8 text-center border-t border-slate-800/80 text-xs text-slate-500">
        <p>© CareConnect Workspace System. All rights reserved.</p>
      </footer>
    </div>
  );
}
