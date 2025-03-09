
import React, { useState } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { MealPlanning, Customer, Meal } from "@/types/models";
import { getMealPlanningsWithRelationships, mockCustomers, getMealsWithRelationships } from "@/lib/mockData";
import InputWithLabel from "@/components/ui/input-with-label";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const MealPlannings = () => {
  const [mealPlannings, setMealPlannings] = useState<MealPlanning[]>(getMealPlanningsWithRelationships());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMealPlanning, setEditingMealPlanning] = useState<MealPlanning | null>(null);
  const [formData, setFormData] = useState<Partial<MealPlanning>>({
    customer_id: "",
    meal_choice: "",
    surecart_user_id: "",
    surecart_subscription_id: "",
  });

  const allMeals = getMealsWithRelationships();

  const columns = [
    { 
      header: "Customer", 
      accessor: (mp: MealPlanning) => 
        mp.customer ? `${mp.customer.first_name} ${mp.customer.last_name}` : "Unknown"
    },
    { 
      header: "Email", 
      accessor: (mp: MealPlanning) => mp.customer?.email || "Unknown"
    },
    { 
      header: "Meal Choice", 
      accessor: (mp: MealPlanning) => mp.meal?.name || "Unknown"
    },
    { 
      header: "Restaurant", 
      accessor: (mp: MealPlanning) => mp.meal?.restaurant?.name || "Unknown"
    },
    { header: "SureCart User ID", accessor: "surecart_user_id" },
    { header: "Subscription ID", accessor: "surecart_subscription_id" },
  ];

  const handleAddNew = () => {
    setEditingMealPlanning(null);
    setFormData({
      customer_id: "",
      meal_choice: "",
      surecart_user_id: "",
      surecart_subscription_id: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (mealPlanning: MealPlanning) => {
    setEditingMealPlanning(mealPlanning);
    setFormData({
      customer_id: mealPlanning.customer_id,
      meal_choice: mealPlanning.meal_choice,
      surecart_user_id: mealPlanning.surecart_user_id,
      surecart_subscription_id: mealPlanning.surecart_subscription_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (mealPlanning: MealPlanning) => {
    setMealPlannings(mealPlannings.filter((mp) => mp.id !== mealPlanning.id));
    toast.success(`Deleted meal planning for ${mealPlanning.customer?.first_name || "customer"}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMealPlanning) {
      // Update existing meal planning
      setMealPlannings(
        mealPlannings.map((mp) =>
          mp.id === editingMealPlanning.id
            ? { ...mp, ...formData }
            : mp
        )
      );
      
      const customer = mockCustomers.find(c => c.id === formData.customer_id);
      toast.success(`Updated meal planning for ${customer?.first_name || "customer"}`);
    } else {
      // Create new meal planning
      const newMealPlanning: MealPlanning = {
        id: `mp${mealPlannings.length + 1}`,
        ...formData as MealPlanning
      };
      setMealPlannings([...mealPlannings, newMealPlanning]);
      
      const customer = mockCustomers.find(c => c.id === formData.customer_id);
      toast.success(`Added meal planning for ${customer?.first_name || "customer"}`);
    }
    
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div>
      <DataTable
        data={mealPlannings}
        columns={columns}
        title="Meal Planning"
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMealPlanning ? "Edit Meal Planning" : "Add New Meal Planning"}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer_id">Customer</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {mockCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name} ({customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meal_choice">Meal Choice</Label>
            <Select
              value={formData.meal_choice}
              onValueChange={(value) => setFormData({ ...formData, meal_choice: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select meal" />
              </SelectTrigger>
              <SelectContent>
                {allMeals.map((meal) => (
                  <SelectItem key={meal.id} value={meal.id}>
                    {meal.name} ({meal.restaurant?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <InputWithLabel
            label="SureCart User ID"
            id="surecart_user_id"
            name="surecart_user_id"
            value={formData.surecart_user_id}
            onChange={handleInputChange}
            required
          />
          
          <InputWithLabel
            label="SureCart Subscription ID"
            id="surecart_subscription_id"
            name="surecart_subscription_id"
            value={formData.surecart_subscription_id}
            onChange={handleInputChange}
            required
          />
        </div>
      </FormModal>
    </div>
  );
};

export default MealPlannings;
