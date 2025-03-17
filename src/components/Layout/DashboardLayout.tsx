import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  AlertOctagon,
  Coffee,
  Users,
  UtensilsCrossed,
  CalendarDays,
  LucideIcon,
  Menu,
  LogOut,
  ChevronDown,
  SunMoon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/ui/theme-provider";
import DatabaseStatus from "@/components/DatabaseStatus";

interface NavLink {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface NavItemProps {
  link: NavLink;
  sidebarOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ link, sidebarOpen }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(link.path);

  return (
    <li>
      <Link
        to={link.path}
        className={`flex items-center space-x-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground ${
          isActive ? "bg-accent text-accent-foreground" : ""
        }`}
      >
        <link.icon className="h-4 w-4" />
        {sidebarOpen && <span>{link.name}</span>}
      </Link>
    </li>
  );
};

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const routes: NavLink[] = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Addresses", path: "/dashboard/addresses", icon: MapPin },
    { name: "Allergens", path: "/dashboard/allergens", icon: AlertOctagon },
    { name: "Cuisines", path: "/dashboard/cuisines", icon: Coffee },
    { name: "Customers", path: "/dashboard/customers", icon: Users },
    { name: "Meals", path: "/dashboard/meals", icon: UtensilsCrossed },
    { name: "Meal Planning", path: "/dashboard/meal-planning", icon: CalendarDays },
    { name: "Meal Types", path: "/dashboard/meal-types", icon: Coffee },
    { name: "Restaurants", path: "/dashboard/restaurants", icon: UtensilsCrossed },
  ];

  const location = useLocation();
  const locationPath = location.pathname;

  return (
    <div className="flex h-screen bg-background">
      {!isMobile && (
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } flex-shrink-0 border-r border-border transition-all duration-300 ease-in-out`}
        >
          <ScrollArea className="py-4 h-full">
            <div className="space-y-4">
              <div className="px-3 py-2">
                <Link to="/dashboard" className="font-bold flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {sidebarOpen && <span>Dashboard</span>}
                </Link>
              </div>
              <Separator />
              <div className="px-3 py-2">
                <ul>
                  {routes.map((route) => (
                    <NavItem
                      key={route.path}
                      link={route}
                      sidebarOpen={sidebarOpen}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </aside>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="flex items-center space-x-4">
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <ScrollArea className="py-4 h-full">
                    <div className="space-y-4">
                      <div className="px-3 py-2">
                        <Link to="/dashboard" className="font-bold flex items-center">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </div>
                      <Separator />
                      <div className="px-3 py-2">
                        <ul>
                          {routes.map((route) => (
                            <NavItem key={route.path} link={route} sidebarOpen={true} />
                          ))}
                        </ul>
                      </div>
                      <Separator />
                      <div className="px-3 py-2">
                        <Button variant="outline" className="w-full" onClick={logout}>
                          Logout
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">Restaurant Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <DatabaseStatus />
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <SunMoon className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <span>{user?.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
