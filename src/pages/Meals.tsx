
import React, { useState } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { Meal, Allergen, Restaurant, MealType, Cuisine } from "@/types/models";
import { 
  getMealsWithRelationships, 
  mockAllergens, 
  mockCuisines, 
  mockMealTypes, 
  mockRestaurants 
} from "@/lib/mockData";
import InputWithLabel from "@/components/ui/input-with-label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Meals = () => {
  const [meals, setMeals] = useState<Meal[]>(getMealsWithRelationships());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [formData, setFormData] = useState<Partial<Meal>>({
    name: "",
    description: "",
    restaurant_id: "",
    mealtype: "",
    cuisine: "",
    allergen: [],
    alcohol: false,
    availability: true,
    image: "",
  });

  const columns = [
    { 
      header: "Image", 
      accessor: "image",
      cell: (meal: Meal) => (
        <Avatar className="h-10 w-10">
          <AvatarImage src={meal.image} alt={meal.name} />
          <AvatarFallback>{meal.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )
    },
    { header: "Name", accessor: "name" },
    { 
      header: "Restaurant", 
      accessor: (meal: Meal) => meal.restaurant?.name || "Unknown"
    },
    { 
      header: "Meal Type", 
      accessor: (meal: Meal) => meal.mealType?.name || "Unknown"
    },
    { 
      header: "Cuisine", 
      accessor: (meal: Meal) => meal.cuisineDetails?.name || "Unknown" 
    },
    { 
      header: "Allergens", 
      accessor: (meal: Meal) => (
        <div className="flex flex-wrap gap-1">
          {meal.allergens && meal.allergens.map((allergen) => (
            <Badge key={allergen.id} variant="outline">{allergen.name}</Badge>
          ))}
        </div>
      )
    },
    { 
      header: "Alcohol", 
      accessor: (meal: Meal) => (
        meal.alcohol ? 
          <Badge className="bg-yellow-500">Contains Alcohol</Badge> : 
          <Badge variant="outline">No Alcohol</Badge>
      )
    },
    { 
      header: "Availability", 
      accessor: (meal: Meal) => (
        meal.availability ? 
          <Badge className="bg-green-500">Available</Badge> : 
          <Badge variant="destructive">Unavailable</Badge>
      )
    },
  ];

  const handleAddNew = () => {
    setEditingMeal(null);
    setFormData({
      name: "",
      description: "",
      restaurant_id: "",
      mealtype: "",
      cuisine: "",
      allergen: [],
      alcohol: false,
      availability: true,
      image: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      description: meal.description,
      restaurant_id: meal.restaurant_id,
      mealtype: meal.mealtype,
      cuisine: meal.cuisine,
      allergen: meal.allergen,
      alcohol: meal.alcohol,
      availability: meal.availability,
      image: meal.image,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (meal: Meal) => {
    setMeals(meals.filter((m) => m.id !== meal.id));
    toast.success(`Deleted ${meal.name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMeal) {
      // Update existing meal
      setMeals(
        meals.map((m) =>
          m.id === editingMeal.id
            ? { ...m, ...formData }
            : m
        )
      );
      toast.success(`Updated ${formData.name}`);
    } else {
      // Create new meal
      const newMeal: Meal = {
        id: `meal${meals.length + 1}`,
        ...formData as Meal
      };
      setMeals([...meals, newMeal]);
      toast.success(`Added ${formData.name}`);
    }
    
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAllergenChange = (allergenId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        allergen: [...(formData.allergen || []), allergenId],
      });
    } else {
      setFormData({
        ...formData,
        allergen: (formData.allergen || []).filter((id) => id !== allergenId),
      });
    }
  };

  return (
    <div>
      <DataTable
        data={meals}
        columns={columns}
        title="Meals"
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMeal ? "Edit Meal" : "Add New Meal"}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="md:col-span-2">
            <InputWithLabel
              label="Meal Name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the meal"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="restaurant_id">Restaurant</Label>
            <Select
              value={formData.restaurant_id}
              onValueChange={(value) => setFormData({ ...formData, restaurant_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select restaurant" />
              </SelectTrigger>
              <SelectContent>
                {mockRestaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mealtype">Meal Type</Label>
            <Select
              value={formData.mealtype}
              onValueChange={(value) => setFormData({ ...formData, mealtype: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {mockMealTypes.map((mealType) => (
                  <SelectItem key={mealType.id} value={mealType.id}>
                    {mealType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cuisine">Cuisine</Label>
            <Select
              value={formData.cuisine}
              onValueChange={(value) => setFormData({ ...formData, cuisine: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                {mockCuisines.map((cuisine) => (
                  <SelectItem key={cuisine.id} value={cuisine.id}>
                    {cuisine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label>Allergens</Label>
            <div className="grid grid-cols-2 gap-2">
              {mockAllergens.map((allergen) => (
                <div key={allergen.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`allergen-${allergen.id}`}
                    checked={(formData.allergen || []).includes(allergen.id)}
                    onCheckedChange={(checked) => 
                      handleAllergenChange(allergen.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={`allergen-${allergen.id}`} className="cursor-pointer">
                    {allergen.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="alcohol"
              checked={formData.alcohol}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, alcohol: checked })
              }
            />
            <Label htmlFor="alcohol">Contains alcohol</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="availability"
              checked={formData.availability}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, availability: checked })
              }
            />
            <Label htmlFor="availability">Available for ordering</Label>
          </div>
          
          <div className="md:col-span-2">
            <InputWithLabel
              label="Image URL"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>
          
          {formData.image && (
            <div className="md:col-span-2">
              <p className="text-sm mb-2">Preview:</p>
              <Avatar className="h-16 w-16">
                <AvatarImage src={formData.image} alt="Preview" />
                <AvatarFallback>{formData.name?.substring(0, 2).toUpperCase() || "IMG"}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
};

export default Meals;
