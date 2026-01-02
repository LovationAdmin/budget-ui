import { useState } from 'react';
import { BudgetNavbar } from "./budget/BudgetNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <BudgetNavbar 
      budgetTitle="Budget Famille"
      userName={user?.name || 'Utilisateur'}
      userAvatar={user?.avatar}
      items={[]}
      menuOpen={menuOpen}
      onMenuClick={() => setMenuOpen(!menuOpen)}
      onSectionChange={(section) => {
        if (section === 'dashboard') navigate('/');
        setMenuOpen(false); // Fermer après navigation
      }}
    />
  );
}