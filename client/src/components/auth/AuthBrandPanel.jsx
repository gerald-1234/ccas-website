// src/components/auth/AuthBrandPanel.jsx
import BrandLockup from "../common/BrandLockup";

export default function AuthBrandPanel() {
  return (
    <section className="flex flex-col justify-between p-8 bg-slate-900 rounded-2xl border border-slate-800">
      <BrandLockup subtitle="Clinic Appointment System" size={48} />

      <div className="my-8">
        <p className="text-xs uppercase tracking-wider text-teal-400 font-semibold mb-2">
          Connected clinic care
        </p>
        <h1 className="text-2xl font-bold text-white mb-3 leading-snug">
          Appointments, records, and clinic teams in one place.
        </h1>
        <p className="text-slate-400 text-sm">
          Secure access for patients, doctors, nurses, receptionists, managers,
          and administrators.
        </p>
      </div>

      {/* Main pattern asset */}
      <img
        className="w-full max-w-xs mx-auto my-4 opacity-90"
        src="/assets/images/care-pattern.svg"
        alt="Care network pattern showing connected clinic services"
      />

      <p className="text-xs text-slate-500 text-center">
        CareConnect Clinic &copy; {new Date().getFullYear()}
      </p>
    </section>
  );
}
