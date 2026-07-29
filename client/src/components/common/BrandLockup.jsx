import React from "react";

export const BrandLockup = ({ size = "md", light = false }) => {
  const isLarge = size === "lg";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md ${isLarge ? "w-12 h-12 text-2xl" : "w-9 h-9 text-lg"}`}
      >
        CC
      </div>
      <div>
        <h1
          className={`font-bold tracking-tight leading-none ${light ? "text-white" : "text-slate-900"} ${isLarge ? "text-2xl" : "text-lg"}`}
        >
          CareConnect
        </h1>
        <p
          className={`text-xs font-medium mt-0.5 ${light ? "text-blue-200" : "text-slate-500"}`}
        >
          Clinic Appointment System
        </p>
      </div>
    </div>
  );
};
