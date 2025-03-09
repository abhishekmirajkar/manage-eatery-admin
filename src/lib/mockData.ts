
import { 
  Address, 
  Allergen, 
  Cuisine, 
  Customer, 
  Meal, 
  MealPlanning, 
  MealType, 
  Restaurant 
} from "@/types/models";

// Mock data for testing and development
export const mockAddresses: Address[] = [
  {
    id: "addr1",
    street: "123 Main St",
    city: "New York",
    state: "NY",
    county: "Manhattan",
    zip_code: "10001",
    latitude: "40.7128",
    longitude: "-74.0060",
    additional_info: "Near Central Park"
  },
  {
    id: "addr2",
    street: "456 Elm St",
    city: "Los Angeles",
    state: "CA",
    county: "Los Angeles",
    zip_code: "90001",
    latitude: "34.0522",
    longitude: "-118.2437",
    additional_info: "Corner building"
  },
];

export const mockAllergens: Allergen[] = [
  {
    id: "alg1",
    name: "Peanuts",
    description: "Tree nuts and peanut derivatives"
  },
  {
    id: "alg2",
    name: "Gluten",
    description: "Wheat and gluten-containing grains"
  },
  {
    id: "alg3",
    name: "Dairy",
    description: "Milk and dairy products"
  },
  {
    id: "alg4",
    name: "Shellfish",
    description: "All types of shellfish"
  },
];

export const mockCuisines: Cuisine[] = [
  {
    id: "cus1",
    name: "Italian"
  },
  {
    id: "cus2",
    name: "Mexican"
  },
  {
    id: "cus3",
    name: "Chinese"
  },
  {
    id: "cus4",
    name: "Indian"
  },
];

export const mockMealTypes: MealType[] = [
  {
    id: "mt1",
    name: "Breakfast",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop"
  },
  {
    id: "mt2",
    name: "Lunch",
    image: "https://images.unsplash.com/photo-1547592180-85f173990888?w=800&auto=format&fit=crop"
  },
  {
    id: "mt3",
    name: "Dinner",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop"
  },
];

export const mockRestaurants: Restaurant[] = [
  {
    id: "res1",
    address_id: "addr1",
    is_closed: false,
    name: "The Italian Place",
    phone_number: "212-555-1234",
    email: "contact@italianplace.com"
  },
  {
    id: "res2",
    address_id: "addr2",
    is_closed: false,
    name: "Taco Heaven",
    phone_number: "323-555-5678",
    email: "info@tacoheaven.com"
  },
];

export const mockCustomers: Customer[] = [
  {
    id: "cust1",
    surecart_id: "sc_123456",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone_number: "555-123-4567"
  },
  {
    id: "cust2",
    surecart_id: "sc_789012",
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@example.com",
    phone_number: "555-987-6543"
  },
];

export const mockMeals: Meal[] = [
  {
    id: "meal1",
    restaurant_id: "res1",
    allergen: ["alg1", "alg3"],
    mealtype: "mt2",
    cuisine: "cus1",
    alcohol: false,
    availability: true,
    name: "Spaghetti Carbonara",
    description: "Classic Italian pasta with pancetta, eggs, and cheese",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop"
  },
  {
    id: "meal2",
    restaurant_id: "res2",
    allergen: ["alg2"],
    mealtype: "mt2",
    cuisine: "cus2",
    alcohol: false,
    availability: true,
    name: "Street Tacos",
    description: "Authentic Mexican street tacos with choice of meat",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop"
  },
];

export const mockMealPlannings: MealPlanning[] = [
  {
    id: "mp1",
    customer_id: "cust1",
    meal_choice: "meal1",
    surecart_user_id: "scu_123456",
    surecart_subscription_id: "sub_123456"
  },
  {
    id: "mp2",
    customer_id: "cust2",
    meal_choice: "meal2",
    surecart_user_id: "scu_789012",
    surecart_subscription_id: "sub_789012"
  },
];

// Function to get mock data with relationships filled in
export function getRestaurantsWithAddresses(): Restaurant[] {
  return mockRestaurants.map(restaurant => {
    const address = mockAddresses.find(addr => addr.id === restaurant.address_id);
    return {
      ...restaurant,
      address
    };
  });
}

export function getMealsWithRelationships(): Meal[] {
  return mockMeals.map(meal => {
    const restaurant = mockRestaurants.find(r => r.id === meal.restaurant_id);
    const allergens = meal.allergen.map(algId => 
      mockAllergens.find(a => a.id === algId)
    ).filter(Boolean) as Allergen[];
    const mealType = mockMealTypes.find(mt => mt.id === meal.mealtype);
    const cuisineDetails = mockCuisines.find(c => c.id === meal.cuisine);
    
    return {
      ...meal,
      restaurant,
      allergens,
      mealType,
      cuisineDetails
    };
  });
}

export function getMealPlanningsWithRelationships(): MealPlanning[] {
  return mockMealPlannings.map(mp => {
    const customer = mockCustomers.find(c => c.id === mp.customer_id);
    const meal = mockMeals.find(m => m.id === mp.meal_choice);
    
    return {
      ...mp,
      customer,
      meal
    };
  });
}
