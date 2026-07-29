import { useState } from "react";

// Static choices for options
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function PatientRegistration() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Male",
    bloodGroup: "O+",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    knownAllergies: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Static Patient Registration Data:", formData);
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      dob: "",
      gender: "Male",
      bloodGroup: "O+",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      knownAllergies: "",
    });
    setSubmitted(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 shadow-md rounded-xl border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        Patient Registration
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Enter details to register a new patient into the system.
      </p>

      {submitted ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 text-center space-y-4">
          <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">
            Patient Registered Successfully (Static Preview)
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1.5 text-left bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
            <p>
              <strong>Name:</strong> {formData.fullName}
            </p>
            <p>
              <strong>Contact:</strong> {formData.phone} | {formData.email}
            </p>
            <p>
              <strong>DOB & Gender:</strong> {formData.dob} ({formData.gender})
            </p>
            <p>
              <strong>Blood Group:</strong> {formData.bloodGroup}
            </p>
            <p>
              <strong>Emergency Contact:</strong>{" "}
              {formData.emergencyContactName} ({formData.emergencyContactPhone})
            </p>
            <p>
              <strong>Allergies:</strong>{" "}
              {formData.knownAllergies || "None reported"}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:opacity-90 font-medium"
          >
            Register Another Patient
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Jane Doe"
                className="w-full px-3 py-2 border border-slate-300 dark:border-sl3ate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="jane.doe@example.com"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Phone & Date of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Gender & Blood Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g} className="dark:bg-slate-900">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg} className="dark:bg-slate-900">
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Residential Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Health Ave, Suite 4B"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Emergency Contact */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Contact Name"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="Contact Phone"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Allergies / Medical Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Known Allergies or Medical Conditions
            </label>
            <textarea
              name="knownAllergies"
              rows={2}
              value={formData.knownAllergies}
              onChange={handleChange}
              placeholder="e.g. Penicillin, Asthma, Latex (leave blank if none)"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Register Patient
          </button>
        </form>
      )}
    </div>
  );
}
