import { BrandLockup } from "../common/BrandLockup";

export const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="px-8 py-6 bg-white border-b flex justify-between items-center">
        <BrandLockup />
        <button
          onClick={onGetStarted}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Access Portal
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 text-center space-y-8 my-auto">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Modernizing Patient Appointments & Healthcare Workflow
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          CareConnect eliminates manual filing, double booking, and scheduling
          delays with an automated, role-based clinic platform.
        </p>
        <div>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            Get Started Now
          </button>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-slate-500 border-t bg-white">
        © 2026 CareConnect Clinic System. Federal University of Technology,
        Owerri (FUTO).
      </footer>
    </div>
  );
};
