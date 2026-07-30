import { useEffect, useState } from "react";
import { apiRequest } from "../../config/api";
import { BLOOD_GROUPS } from "../../config/constants";

export const WalkInRegistration = ({ onSuccess }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState([]);
  const [today] = useState(() => new Date().toISOString().split("T")[0]);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "Male",
    date_of_birth: "",
    phone: "",
    email: "",
    residential_address: "",
    blood_group: "O+",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    doctor_id: "",
    appointment_time: "",
    duration_minutes: 30,
    reason_for_visit: "",
  });

  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await apiRequest("/doctors");
        setDoctors(res.doctors || res || []);
      } catch (err) {
        setError("Failed to fetch doctor list");
      }
    }
    loadDoctors();
  }, []);

  useEffect(() => {
    if (!form.doctor_id) {
      setSlots([]);
      return;
    }

    async function loadSlots() {
      try {
        const res = await apiRequest(
          `/doctors/${form.doctor_id}/slots?date=${today}`,
        );
        setSlots(res.slots || []);
      } catch (err) {
        setError("Failed to fetch available slots for today");
      }
    }
    loadSlots();
  }, [form.doctor_id, today]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSlotSelect = (slot) => {
    setForm({
      ...form,
      appointment_time: slot.appointment_time,
      duration_minutes: slot.duration_minutes || 30,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.appointment_time) {
      setError("Please select an available time slot.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: create the patient record (no login account, per staff-registration contract)
      const patientPayload = {
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender,
        date_of_birth: form.date_of_birth,
        phone: form.phone,
        email: form.email || undefined,
        residential_address: form.residential_address,
        blood_group: form.blood_group,
        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_phone: form.emergency_contact_phone,
      };

      const patientRes = await apiRequest("/patients", {
        method: "POST",
        body: JSON.stringify(patientPayload),
      });

      const patientId = patientRes.patient?.id || patientRes.id;

      // Step 2: book the appointment for the newly created patient
      await apiRequest("/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctor_id: form.doctor_id,
          patient_id: patientId,
          appointment_date: today,
          appointment_time: form.appointment_time,
          duration_minutes: form.duration_minutes,
          reason_for_visit: form.reason_for_visit,
        }),
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.message ||
          "An unexpected error occurred during walk-in registration.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        Walk-In Patient Registration
      </h2>
      {error && (
        <div className="p-4 mb-4 text-sm bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="First Name *"
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Last Name *"
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input
            name="date_of_birth"
            type="date"
            value={form.date_of_birth}
            onChange={handleChange}
            placeholder="Date of Birth *"
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <select
            name="blood_group"
            value={form.blood_group}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone *"
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email (Optional)"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <input
          name="residential_address"
          value={form.residential_address}
          onChange={handleChange}
          placeholder="Residential Address *"
          required
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            name="emergency_contact_name"
            value={form.emergency_contact_name}
            onChange={handleChange}
            placeholder="Emergency Contact Name *"
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            name="emergency_contact_phone"
            value={form.emergency_contact_phone}
            onChange={handleChange}
            placeholder="Emergency Contact Phone *"
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <select
            name="doctor_id"
            value={form.doctor_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Select Doctor *</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                Dr. {doc.first_name} {doc.last_name} (
                {doc.specialization || "General"})
              </option>
            ))}
          </select>
          <div className="text-xs text-slate-500 flex items-center px-1">
            Booking for today, {today}
          </div>
        </div>

        {form.doctor_id && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Available Slots Today
            </label>
            {slots.length === 0 ? (
              <p className="text-sm text-slate-500 italic">
                No slots available today for this doctor.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.appointment_time}
                    type="button"
                    onClick={() => handleSlotSelect(s)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                      form.appointment_time === s.appointment_time
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {s.appointment_time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <textarea
          name="reason_for_visit"
          value={form.reason_for_visit}
          onChange={handleChange}
          rows={3}
          placeholder="Reason for Visit *"
          required
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />

        <button
          type="submit"
          disabled={loading || !form.appointment_time}
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
        >
          {loading ? "Registering..." : "Complete Walk-In Registration"}
        </button>
      </form>
    </div>
  );
};
