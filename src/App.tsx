
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/Layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Restaurants from "./pages/Restaurants";
import Meals from "./pages/Meals";
import MealTypes from "./pages/MealTypes";
import Allergens from "./pages/Allergens";
import Cuisines from "./pages/Cuisines";
import Customers from "./pages/Customers";
import Addresses from "./pages/Addresses";
import MealPlannings from "./pages/MealPlanning";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="meals" element={<Meals />} />
        <Route path="meal-types" element={<MealTypes />} />
        <Route path="allergens" element={<Allergens />} />
        <Route path="cuisines" element={<Cuisines />} />
        <Route path="customers" element={<Customers />} />
        <Route path="addresses" element={<Addresses />} />
        <Route path="meal-planning" element={<MealPlannings />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
