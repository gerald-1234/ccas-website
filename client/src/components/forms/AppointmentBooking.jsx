import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { apiRequest } from "../../config/api";

export const AppointmentBooking = ({ onSuccess }) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");

  // Patient ID for Receptionist/Admin overrides
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isStaff = user?.role === "receptionist" || user?.role === "admin";

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
    if (!selectedDoctor || !date) {
      setSlots([]);
      return;
    }

    async function loadSlots() {
      try {
        const res = await apiRequest(
          `/doctors/${selectedDoctor}/slots?date=${date}`,
        );
        setSlots(res.slots || []);
      } catch (err) {
        setError("Failed to fetch available slots");
      }
    }
    loadSlots();
  }, [selectedDoctor, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError("Please select an available time slot.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      doctor_id: selectedDoctor,
      appointment_date: date,
      appointment_time: selectedSlot.appointment_time,
      duration_minutes: selectedSlot.duration_minutes || 30,
      reason_for_visit: reason,
      ...(isStaff && patientId ? { patient_id: patientId } : {}),
    };

    try {
      await apiRequest("/appointments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSuccess("Appointment successfully scheduled.");
      setSelectedSlot(null);
      setReason("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        Schedule Consultation
      </h2>

      {error && (
        <div className="p-4 mb-4 text-sm bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 mb-4 text-sm bg-green-50 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isStaff && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient UUID
            </label>
            <input
              type="text"
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Doctor
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.first_name} {doc.last_name} (
                  {doc.specialization || "General"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {date && selectedDoctor && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Available Slots
            </label>
            {slots.length === 0 ? (
              <p className="text-sm text-slate-500 italic">
                No slots available for this date.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.appointment_time}
                    type="button"
                    onClick={() => setSelectedSlot(s)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                      selectedSlot?.appointment_time === s.appointment_time
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason for Visit
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Describe symptoms or primary consultation reason..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedSlot}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
        >
          {loading ? "Booking..." : "Confirm Appointment"}
        </button>
      </form>
    </div>
  );
};
