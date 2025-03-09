
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Utensils, FileText, Calendar, UtensilsCrossed, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon,
  path
}: { 
  title: string; 
  value: number; 
  description: string; 
  icon: React.ElementType;
  path: string;
}) => (
  <Link to={path}>
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

const Dashboard = () => {
  // In a real application, this data would come from an API
  const stats = [
    { title: "Restaurants", value: 12, description: "Active restaurants", icon: Utensils, path: "/restaurants" },
    { title: "Meals", value: 64, description: "Available meals", icon: UtensilsCrossed, path: "/meals" },
    { title: "Customers", value: 124, description: "Registered customers", icon: Users, path: "/customers" },
    { title: "Meal Types", value: 5, description: "Different categories", icon: FileText, path: "/meal-types" },
    { title: "Allergens", value: 8, description: "Tracked allergens", icon: AlertCircle, path: "/allergens" },
    { title: "Meal Plans", value: 38, description: "Active subscriptions", icon: Calendar, path: "/meal-planning" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <DashboardCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            path={stat.path}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
