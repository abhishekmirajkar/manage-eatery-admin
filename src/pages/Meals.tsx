
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { Meal, Allergen, Restaurant, MealType, Cuisine } from "@/types/models";
import { 
  mealAPI, 
  allergenAPI, 
  cuisineAPI, 
  mealTypeAPI, 
  restaurantAPI, 
  MealCreateData,
  extractResponseData 
} from "@/lib/api/apiService";
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
  const [meals, setMeals] = useState<Meal[]>([]);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<MealCreateData>>({
    name: "",
    description: "",
    restaurant_id: "",
    mealtype: [],
    cuisine: [],
    allergen: [],
    food_type: "veg",
    alcohol: false,
    image: "",
  });

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load all required data
      const [
        mealsResponse,
        allergensResponse,
        cuisinesResponse,
        mealTypesResponse,
        restaurantsResponse
      ] = await Promise.all([
        mealAPI.getAll(),
        allergenAPI.getAll(),
        cuisineAPI.getAll(),
        mealTypeAPI.getAll(),
        restaurantAPI.getAll()
      ]);

      if (mealsResponse.success && mealsResponse.data) {
        const mealData = extractResponseData<Meal[]>(mealsResponse.data);
        setMeals(mealData);
      }

      if (allergensResponse.success && allergensResponse.data) {
        const allergenData = extractResponseData<Allergen[]>(allergensResponse.data);
        setAllergens(allergenData);
      }

      if (cuisinesResponse.success && cuisinesResponse.data) {
        const cuisineData = extractResponseData<Cuisine[]>(cuisinesResponse.data);
        setCuisines(cuisineData);
      }

      if (mealTypesResponse.success && mealTypesResponse.data) {
        const mealTypeData = extractResponseData<MealType[]>(mealTypesResponse.data);
        setMealTypes(mealTypeData);
      }

      if (restaurantsResponse.success && restaurantsResponse.data) {
        const restaurantData = extractResponseData<Restaurant[]>(restaurantsResponse.data);
        setRestaurants(restaurantData);
      }

    } catch (error) {
      toast.error("Failed to load data");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

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
    { 
      header: "Name", 
      accessor: "name",
      cell: (meal: Meal) => (
        <div>
          <div className="font-medium">{meal.name}</div>
          {meal.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs" title={meal.description}>
              {meal.description}
            </div>
          )}
        </div>
      )
    },
    { 
      header: "Restaurant", 
      accessor: (meal: Meal) => {
        // Find restaurant by restaurant_id since API may return reference
        const restaurant = restaurants.find(r => r.id === meal.restaurant_id);
        return restaurant?.name || "Unknown";
      }
    },
    { 
      header: "Food Type", 
      accessor: (meal: Meal) => {
        const foodType = (meal as any).food_type;
        return foodType === 'veg' ? 'Vegetarian' : 
               foodType === 'non_veg' ? 'Non-Vegetarian' : 
               foodType === 'vegan' ? 'Vegan' : 'Unknown';
      }
    },
    { 
      header: "Meal Types", 
      accessor: (meal: Meal) => (
        <div className="flex flex-wrap gap-1">
          {(meal as any).mealtype && Array.isArray((meal as any).mealtype) && 
            (meal as any).mealtype.map((mealType: any) => {
              // Handle both full objects and ID strings
              let displayName = '';
              let key = '';
              
              if (typeof mealType === 'string') {
                // If it's just an ID, look up the name in safeMealTypes
                const foundMealType = safeMealTypes.find(mt => mt.id === mealType);
                displayName = foundMealType?.name || mealType;
                key = mealType;
              } else {
                // If it's an object, use its properties
                displayName = mealType.name || mealType.id;
                key = mealType.id || mealType;
              }
              
              return (
                <Badge key={key} variant="secondary">
                  {displayName}
                </Badge>
              );
            })
          }
        </div>
      )
    },
    { 
      header: "Cuisines", 
      accessor: (meal: Meal) => (
        <div className="flex flex-wrap gap-1">
          {(meal as any).cuisine && Array.isArray((meal as any).cuisine) && 
            (meal as any).cuisine.map((cuisine: any) => {
              // Handle both full objects and ID strings
              let displayName = '';
              let key = '';
              
              if (typeof cuisine === 'string') {
                // If it's just an ID, look up the name in safeCuisines
                const foundCuisine = safeCuisines.find(c => c.id === cuisine);
                displayName = foundCuisine?.name || cuisine;
                key = cuisine;
              } else {
                // If it's an object, use its properties
                displayName = cuisine.name || cuisine.id;
                key = cuisine.id || cuisine;
              }
              
              return (
                <Badge key={key} variant="outline">
                  {displayName}
                </Badge>
              );
            })
          }
        </div>
      )
    },
    { 
      header: "Allergens", 
      accessor: (meal: Meal) => {
        // Handle both 'allergen' and 'allergens' property names from backend
        const allergenData = (meal as any).allergen || meal.allergens || [];
        
        return (
          <div className="flex flex-wrap gap-1">
            {Array.isArray(allergenData) && allergenData.length > 0 ? (
              allergenData.map((allergen: any) => {
                // Handle both full objects and ID strings
                let displayName = '';
                let key = '';
                
                if (typeof allergen === 'string') {
                  // If it's just an ID, look up the name in safeAllergens
                  const foundAllergen = safeAllergens.find(a => a.id === allergen);
                  displayName = foundAllergen?.name || allergen;
                  key = allergen;
                } else {
                  // If it's an object, use its properties
                  displayName = allergen.name || allergen.id;
                  key = allergen.id || allergen;
                }
                
                return (
                  <Badge key={key} variant="destructive" className="bg-red-100 text-red-800">
                    {displayName}
                  </Badge>
                );
              })
            ) : (
              <span className="text-sm text-gray-500">No allergens</span>
            )}
          </div>
        );
      }
    },
    { 
      header: "Alcohol", 
      accessor: (meal: Meal) => (
        meal.alcohol ? 
          <Badge className="bg-yellow-500">Contains Alcohol</Badge> : 
          <Badge variant="outline">No Alcohol</Badge>
      )
    },
  ];

  const handleAddNew = () => {
    setEditingMeal(null);
    setFormData({
      name: "",
      description: "",
      restaurant_id: "",
      mealtype: [],
      cuisine: [],
      allergen: [],
      food_type: "veg",
      alcohol: false,
      image: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    
    // Handle arrays that might contain full objects or just IDs
    const extractIds = (items: any[]): string[] => {
      if (!items) return [];
      return items.map(item => typeof item === 'string' ? item : item.id);
    };
    
    // Handle both 'allergen' and 'allergens' property names from backend
    const allergenData = (meal as any).allergen || meal.allergens || [];
    
    setFormData({
      name: meal.name,
      description: meal.description,
      restaurant_id: meal.restaurant_id,
      mealtype: extractIds((meal as any).mealtype || []),
      cuisine: extractIds((meal as any).cuisine || []),
      allergen: extractIds(allergenData),
      food_type: (meal as any).food_type || "veg",
      alcohol: meal.alcohol,
      image: meal.image,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (meal: Meal) => {
    try {
      const response = await mealAPI.delete(meal.id);
      if (response.success) {
        setMeals(meals.filter((m) => m.id !== meal.id));
        toast.success(`Deleted ${meal.name}`);
      } else {
        toast.error(response.error || "Failed to delete meal");
      }
    } catch (error) {
      toast.error("Failed to delete meal");
      console.error("Error deleting meal:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingMeal) {
        // Update existing meal
        const response = await mealAPI.update(editingMeal.id, formData);
        if (response.success && response.data) {
          setMeals(
            meals.map((m) =>
              m.id === editingMeal.id ? response.data! : m
            )
          );
          toast.success(`Updated ${formData.name}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to update meal");
        }
      } else {
        // Create new meal
        const createData: MealCreateData = {
          name: formData.name!,
          restaurant_id: formData.restaurant_id!,
          allergen: formData.allergen || [],
          mealtype: formData.mealtype || [],
          cuisine: formData.cuisine || [],
          food_type: formData.food_type!,
          description: formData.description,
          alcohol: formData.alcohol,
          image: formData.image,
        };
        
        console.log('Form data before API call:', JSON.stringify(createData, null, 2));
        
        const response = await mealAPI.create(createData);
        if (response.success && response.data) {
          setMeals([...meals, response.data]);
          toast.success(`Added ${formData.name}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to create meal");
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving the meal");
      console.error("Error saving meal:", error);
    } finally {
      setSubmitting(false);
    }
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

  const handleMealTypeChange = (mealTypeId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        mealtype: [...(formData.mealtype || []), mealTypeId],
      });
    } else {
      setFormData({
        ...formData,
        mealtype: (formData.mealtype || []).filter((id) => id !== mealTypeId),
      });
    }
  };

  const handleCuisineChange = (cuisineId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        cuisine: [...(formData.cuisine || []), cuisineId],
      });
    } else {
      setFormData({
        ...formData,
        cuisine: (formData.cuisine || []).filter((id) => id !== cuisineId),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading meals...</div>
      </div>
    );
  }

  // Add defensive check for data
  const safeMeals = Array.isArray(meals) ? meals : [];
  const safeAllergens = Array.isArray(allergens) ? allergens : [];
  const safeCuisines = Array.isArray(cuisines) ? cuisines : [];
  const safeMealTypes = Array.isArray(mealTypes) ? mealTypes : [];
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];



  try {
    return (
      <div>
        <DataTable
          data={safeMeals}
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
        isLoading={submitting}
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
                {safeRestaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="food_type">Food Type</Label>
            <Select
              value={formData.food_type}
              onValueChange={(value) => setFormData({ ...formData, food_type: value as 'veg' | 'non_veg' | 'vegan' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select food type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="veg">Vegetarian</SelectItem>
                <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label>Meal Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {safeMealTypes.map((mealType) => (
                <div key={mealType.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`mealtype-${mealType.id}`}
                    checked={(formData.mealtype || []).includes(mealType.id)}
                    onCheckedChange={(checked) => 
                      handleMealTypeChange(mealType.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={`mealtype-${mealType.id}`} className="cursor-pointer">
                    {mealType.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label>Cuisines</Label>
            <div className="grid grid-cols-2 gap-2">
              {safeCuisines.map((cuisine) => (
                <div key={cuisine.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`cuisine-${cuisine.id}`}
                    checked={(formData.cuisine || []).includes(cuisine.id)}
                    onCheckedChange={(checked) => 
                      handleCuisineChange(cuisine.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={`cuisine-${cuisine.id}`} className="cursor-pointer">
                    {cuisine.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label>Allergens</Label>
            <div className="grid grid-cols-2 gap-2">
              {safeAllergens.map((allergen) => (
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
  } catch (error) {
    console.error("Error rendering meals page:", error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading meals. Please check console for details.</div>
      </div>
    );
  }
};

export default Meals;
