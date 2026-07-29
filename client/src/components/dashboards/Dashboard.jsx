import { useAuth } from "../../AuthContext";
import { AdminDashboard } from "./AdminDashboard";
import { DoctorDashboard } from "./DoctorDashboard";
import { ManagerDashboard } from "./ManagerDashboard";
import { NurseDashboard } from "./NurseDashboard";
import { PatientDashboard } from "./PatientDashboard";
import { ReceptionistDashboard } from "./ReceptionistDashboard";

export const Dashboard = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case "doctor":
      return <DoctorDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "receptionist":
      return <ReceptionistDashboard />;
    case "nurse":
      return <NurseDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "patient":
    default:
      return <PatientDashboard />;
  }
};
