import React from "react";
import { BrandLockup } from "../common/BrandLockup";

export const AuthBrandPanel = () => {
  return (
    <div className="hidden lg:flex flex-col justify-between w-1/2 bg-blue-600 p-12 text-white">
      <BrandLockup size="lg" light />
      <div className="space-y-6 max-w-lg">
        <h2 className="text-4xl font-extrabold leading-tight">
          Streamlined healthcare scheduling for modern practices.
        </h2>
        <p className="text-blue-100 text-lg leading-relaxed">
          Access complete medical records instantly, schedule consultations
          without overlaps, and maintain seamless clinic operations.
        </p>
      </div>
      <div className="text-xs text-blue-200">
        © 2026 CareConnect Clinic. All rights reserved.
      </div>
    </div>
  );
};
