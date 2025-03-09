
import React, { useState } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Home,
  AlignLeft,
  LogOut,
  FileText,
  MapPin,
  Utensils,
  AlertCircle,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Utensils, label: "Restaurants", path: "/restaurants" },
    { icon: UtensilsCrossed, label: "Meals", path: "/meals" },
    { icon: AlignLeft, label: "Meal Types", path: "/meal-types" },
    { icon: AlertCircle, label: "Allergens", path: "/allergens" },
    { icon: FileText, label: "Cuisines", path: "/cuisines" },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: Calendar, label: "Meal Planning", path: "/meal-planning" },
    { icon: MapPin, label: "Addresses", path: "/addresses" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="p-4 flex items-center justify-between h-16 border-b border-sidebar-border">
          <h1 className={cn("font-semibold truncate", collapsed ? "hidden" : "block")}>
            Restaurant Admin
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span className={cn("ml-3 truncate", collapsed ? "hidden" : "block")}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-5 w-5" />
            <span className={cn("ml-3", collapsed ? "hidden" : "block")}>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-background flex items-center px-6">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Welcome, {user?.username}</h2>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
