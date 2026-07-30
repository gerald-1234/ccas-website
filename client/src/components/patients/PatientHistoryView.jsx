import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../config/api";

export const PatientHistoryView = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [historyRes, patientRes] = await Promise.all([
          apiRequest(`/medical/patients/${patientId}/history`),
          apiRequest(`/patients/${patientId}`),
        ]);
        setRecords(historyRes.records || historyRes || []);
        setPatient(patientRes.patient || patientRes);
      } catch (err) {
        console.error("Failed to load patient history:", err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  if (loading) {
    return <div className="text-slate-500">Loading medical history...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 mb-2"
          >
            ← Back to directory
          </button>
          <h2 className="text-lg font-bold text-slate-900">
            {patient
              ? `${patient.first_name} ${patient.last_name} — Medical History`
              : "Medical History"}
          </h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {records.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">
            No medical history records found for this patient.
          </p>
        ) : (
          <div className="space-y-4">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="p-4 border border-slate-200 rounded-lg space-y-2"
              >
                <div className="flex justify-between items-center text-xs text-slate-500 border-b pb-2">
                  <span>
                    {rec.created_at
                      ? new Date(rec.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                  <span className="font-semibold text-slate-700">
                    Dr. {rec.doctor_name || "Attending Doctor"}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700">
                    Diagnosis:{" "}
                  </span>
                  <span className="text-sm text-slate-900 font-medium">
                    {rec.diagnosis}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700">
                    Treatment:{" "}
                  </span>
                  <p className="text-sm text-slate-600">{rec.treatment}</p>
                </div>
                {rec.prescription && (
                  <div className="bg-blue-50 p-2.5 rounded text-xs text-blue-900">
                    <strong>Rx:</strong> {rec.prescription}
                  </div>
                )}
                {rec.doctor_notes && (
                  <div className="bg-amber-50 p-2.5 rounded text-xs text-amber-900">
                    <strong>Doctor Notes:</strong> {rec.doctor_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
