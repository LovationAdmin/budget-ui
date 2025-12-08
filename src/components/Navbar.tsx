import { BudgetNavbar } from "./budget/BudgetNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <BudgetNavbar 
      budgetTitle="Budget Famille"
      userName={user?.name || 'Utilisateur'}
      onMenuClick={() => {}} // Placeholder
      onSectionChange={(section) => {
        if (section === 'dashboard') navigate('/');
      }}
    />
  );
}