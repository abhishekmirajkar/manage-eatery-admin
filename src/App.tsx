
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";

import DashboardLayout from "@/components/Layout/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import Addresses from "@/pages/Addresses";
import Allergens from "@/pages/Allergens";
import Cuisines from "@/pages/Cuisines";
import Customers from "@/pages/Customers";
import Meals from "@/pages/Meals";
import MealPlanning from "@/pages/MealPlanning";
import MealTypes from "@/pages/MealTypes";
import Restaurants from "@/pages/Restaurants";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

import "./App.css";

// Authentication guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Check if user is authenticated from localStorage
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  if (!isAuthenticated) {
    // If not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <AuthProvider>
          <DatabaseProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="addresses" element={<Addresses />} />
                <Route path="allergens" element={<Allergens />} />
                <Route path="cuisines" element={<Cuisines />} />
                <Route path="customers" element={<Customers />} />
                <Route path="meals" element={<Meals />} />
                <Route path="meal-planning" element={<MealPlanning />} />
                <Route path="meal-types" element={<MealTypes />} />
                <Route path="restaurants" element={<Restaurants />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" />
          </DatabaseProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
