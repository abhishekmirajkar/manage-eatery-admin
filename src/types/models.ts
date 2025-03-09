
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  county: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  additional_info: string;
}

export interface Allergen {
  id: string;
  name: string;
  description: string;
}

export interface Cuisine {
  id: string;
  name: string;
}

export interface MealType {
  id: string;
  name: string;
  image: string;
}

export interface Customer {
  id: string;
  surecart_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export interface Restaurant {
  id: string;
  address_id: string;
  address?: Address;
  is_closed: boolean;
  name: string;
  phone_number: string;
  email: string;
}

export interface Meal {
  id: string;
  restaurant_id: string;
  restaurant?: Restaurant;
  allergen: string[];
  allergens?: Allergen[];
  mealtype: string;
  mealType?: MealType;
  cuisine: string;
  cuisineDetails?: Cuisine;
  alcohol: boolean;
  availability: boolean;
  name: string;
  description: string;
  image: string;
}

export interface MealPlanning {
  id: string;
  customer_id: string;
  customer?: Customer;
  meal_choice: string;
  meal?: Meal;
  surecart_user_id: string;
  surecart_subscription_id: string;
}
