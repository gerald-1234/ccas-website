export default function BrandLockup({ subtitle = "Clinic System", size = 42 }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/assets/images/careconnect-logo.svg"
        alt="CareConnect Logo"
        width={size}
        height={size}
      />
      <div className="flex flex-col">
        <strong className="text-lg font-bold leading-tight text-white">
          CareConnect
        </strong>
        <span className="text-xs text-slate-400">{subtitle}</span>
      </div>
    </div>
  );
}
