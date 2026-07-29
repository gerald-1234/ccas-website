import { useState } from "react";

// Static dummy data for doctors and time slots
const DOCTORS = [
  {
    id: "d1",
    name: "Dr. Sarah Jenkins",
    specialty: "General Practitioner",
    availableDays: ["Mon", "Wed", "Fri"],
  },
  {
    id: "d2",
    name: "Dr. Marcus Vance",
    specialty: "Cardiology",
    availableDays: ["Tue", "Thu"],
  },
  {
    id: "d3",
    name: "Dr. Elena Rostova",
    specialty: "Pediatrics",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  },
];

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:30 AM",
  "01:30 PM",
  "02:45 PM",
  "04:00 PM",
];

export default function AppointmentBooking() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlotSelect = (slot) => {
    setFormData((prev) => ({ ...prev, appointmentTime: slot }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Static submit behavior for now
    console.log("Static Booking Data:", formData);
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      patientName: "",
      patientPhone: "",
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      reason: "",
    });
    setSubmitted(false);
  };

  const selectedDoctor = DOCTORS.find((d) => d.id === formData.doctorId);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 shadow-md rounded-xl border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        Book an Appointment
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Fill in the details below to schedule a consultation.
      </p>

      {submitted ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 text-center space-y-4">
          <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">
            Appointment Booked (Static Preview)
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1 text-left bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
            <p>
              <strong>Patient:</strong> {formData.patientName}
            </p>
            <p>
              <strong>Doctor:</strong> {selectedDoctor?.name || "N/A"}
            </p>
            <p>
              <strong>Date & Time:</strong> {formData.appointmentDate} at{" "}
              {formData.appointmentTime}
            </p>
            <p>
              <strong>Reason:</strong> {formData.reason || "None specified"}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:opacity-90 font-medium"
          >
            Book Another Appointment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Patient Name
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="patientPhone"
                value={formData.patientPhone}
                onChange={handleChange}
                required
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Doctor
            </label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" className="dark:bg-slate-900">
                -- Choose a Doctor --
              </option>
              {DOCTORS.map((doc) => (
                <option
                  key={doc.id}
                  value={doc.id}
                  className="dark:bg-slate-900"
                >
                  {doc.name} ({doc.specialty})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Appointment Date
            </label>
            <input
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => handleSlotSelect(slot)}
                  className={`py-2 text-sm rounded-md border text-center transition-colors ${
                    formData.appointmentTime === slot
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Reason for Visit
            </label>
            <textarea
              name="reason"
              rows={3}
              value={formData.reason}
              onChange={handleChange}
              placeholder="Brief description of symptoms or consultation..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Confirm Appointment
          </button>
        </form>
      )}
    </div>
  );
}
