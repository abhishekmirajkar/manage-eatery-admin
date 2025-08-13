import { Address, Allergen, Cuisine, MealType, Restaurant, Meal } from "@/types/models";
import { logger } from "@/lib/logger";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Utility function to handle authentication errors consistently
export const handleAuthError = (error: string): boolean => {
  if (error?.includes('Authentication failed') || error?.includes('Token expired')) {
    return true; // Indicates this is an auth error
  }
  return false;
};

// Utility function to extract data from potentially nested response structures
export const extractResponseData = <T>(responseData: any): T => {
  // Handle nested structure: {data: {data: [...]}} or {data: [...]}
  return responseData?.data || responseData;
};

// Check if token is expired or close to expiring
const isTokenExpired = (): boolean => {
  const storedTokens = localStorage.getItem("authTokens");
  if (!storedTokens) return true;

  try {
    const tokens = JSON.parse(storedTokens);
    if (!tokens.access_token) return true;

    // Decode JWT token to check expiration (simple base64 decode)
    const tokenParts = tokens.access_token.split('.');
    if (tokenParts.length !== 3) return true;

    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token expires within the next 5 minutes (300 seconds)
    const expirationBuffer = 300;
    return payload.exp <= (currentTime + expirationBuffer);
  } catch (error) {
    logger.error("Error checking token expiration:", error);
    return true;
  }
};

// Get auth token helper (synchronous)
const getAuthToken = (): string | null => {
  const storedTokens = localStorage.getItem("authTokens");
  if (!storedTokens) return null;

  try {
    const tokens = JSON.parse(storedTokens);
    return tokens.access_token || null;
  } catch (error) {
    logger.error("Error parsing stored tokens:", error);
    return null;
  }
};

// Get auth token with proactive refresh (async)
const getAuthTokenWithRefresh = async (): Promise<string | null> => {
  const storedTokens = localStorage.getItem("authTokens");
  if (!storedTokens) return null;

  try {
    const tokens = JSON.parse(storedTokens);
    if (!tokens.access_token) return null;

    // Check if token is expired or close to expiring
    if (isTokenExpired()) {
      const refreshSuccess = await refreshTokens();
      if (refreshSuccess) {
        // Get the refreshed token
        const newStoredTokens = localStorage.getItem("authTokens");
        if (newStoredTokens) {
          const newTokens = JSON.parse(newStoredTokens);
          return newTokens.access_token;
        }
      }
      return null;
    }

    return tokens.access_token;
  } catch (error) {
    logger.error("Error getting auth token:", error);
    return null;
  }
};

// Token refresh function
const refreshTokens = async (): Promise<boolean> => {
  const storedTokens = localStorage.getItem("authTokens");
  if (!storedTokens) {
    return false;
  }

  try {
    const tokens = JSON.parse(storedTokens);
    
    if (!tokens.refresh_token) {
      localStorage.removeItem("authTokens");
      localStorage.removeItem("user");
      return false;
    }
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: tokens.refresh_token }),
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.success && data.data && data.data.access_token) {
        // Update with new access token, keep existing refresh token
        const updatedTokens = {
          access_token: data.data.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: data.data.expires_in
        };
        
        localStorage.setItem("authTokens", JSON.stringify(updatedTokens));
        return true;
      }
    }
    
    // If refresh fails, clear stored tokens
    localStorage.removeItem("authTokens");
    localStorage.removeItem("user");
    
    // Only redirect if we're not already on the login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return false;
  } catch (error) {
    logger.error('Token refresh error:', error);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("user");
    
    // Only redirect if we're not already on the login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return false;
  }
};

// Generic API request function with automatic token refresh
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry: boolean = false
): Promise<ApiResponse<T>> => {
  try {
    // Use proactive token refresh to get a valid token
    let token = await getAuthTokenWithRefresh();
    
    // If no token is available and this isn't a retry, try to refresh again
    if (!token && !isRetry) {
      const refreshSuccess = await refreshTokens();
      if (refreshSuccess) {
        token = getAuthToken();
      } else {
        return {
          success: false,
          error: 'Authentication required. Please log in again.'
        };
      }
    }
    
    // If still no token after refresh attempt, return error
    if (!token) {
      return {
        success: false,
        error: 'Authentication required. Please log in again.'
      };
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });

    // Handle 401 (Unauthorized) - try to refresh token
    if (response.status === 401 && !isRetry) {
      const refreshSuccess = await refreshTokens();
      
      if (refreshSuccess) {
        // Retry the original request with new token
        return makeRequest<T>(endpoint, options, true);
      } else {
        return {
          success: false,
          error: 'Authentication failed. Please log in again.'
        };
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'An error occurred');
    }

    // Handle both wrapped {success: true, data: [...]} and unwrapped [...] responses
    if (Array.isArray(data) || (data && typeof data === 'object' && !data.hasOwnProperty('success'))) {
      // If response is an array or object without 'success' property, wrap it
      return {
        success: true,
        data: data
      };
    }

    // If response has success property but no data property, wrap the non-success fields in data
    if (data && data.hasOwnProperty('success') && !data.hasOwnProperty('data')) {
      const { success, ...otherFields } = data;
      return {
        success: success,
        data: otherFields
      };
    }

    // If response already has success/data structure, return as is
    return data;
  } catch (error) {
    logger.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// ADDRESS API
export interface AddressCreateData {
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  additional_info?: string;
  phone?: string;
}

export const addressAPI = {
  create: async (data: AddressCreateData): Promise<ApiResponse<Address>> => {
    return makeRequest<Address>('/api/address', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getAll: async (): Promise<ApiResponse<Address[]>> => {
    return makeRequest<Address[]>('/api/address');
  },
  update: async (id: string, data: Partial<AddressCreateData>): Promise<ApiResponse<Address>> => {
    return makeRequest<Address>(`/api/address/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return makeRequest<{ message: string }>(`/api/address/${id}`, {
      method: 'DELETE',
    });
  },
};

// ALLERGEN API
export interface AllergenCreateData {
  name: string;
  description?: string;
}

export const allergenAPI = {
  create: async (data: AllergenCreateData): Promise<ApiResponse<Allergen>> => {
    return makeRequest<Allergen>('/api/allergens', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getAll: async (): Promise<ApiResponse<Allergen[]>> => {
    return makeRequest<Allergen[]>('/api/allergens');
  },
  update: async (id: string, data: Partial<AllergenCreateData>): Promise<ApiResponse<Allergen>> => {
    return makeRequest<Allergen>(`/api/allergens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return makeRequest<{ message: string }>(`/api/allergens/${id}`, {
      method: 'DELETE',
    });
  },
};

// CUISINE API
export interface CuisineCreateData {
  name: string;
}

export const cuisineAPI = {
  create: async (data: CuisineCreateData): Promise<ApiResponse<Cuisine>> => {
    return makeRequest<Cuisine>('/api/cuisine', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getAll: async (): Promise<ApiResponse<Cuisine[]>> => {
    return makeRequest<Cuisine[]>('/api/cuisine');
  },
  update: async (id: string, data: Partial<CuisineCreateData>): Promise<ApiResponse<Cuisine>> => {
    return makeRequest<Cuisine>(`/api/cuisine/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return makeRequest<{ message: string }>(`/api/cuisine/${id}`, {
      method: 'DELETE',
    });
  },
};

// MEAL TYPE API
export interface MealTypeCreateData {
  name: string;
  image?: string;
}

export const mealTypeAPI = {
  create: async (data: MealTypeCreateData): Promise<ApiResponse<MealType>> => {
    return makeRequest<MealType>('/api/meal-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getAll: async (): Promise<ApiResponse<MealType[]>> => {
    return makeRequest<MealType[]>('/api/meal-types');
  },
  update: async (id: string, data: Partial<MealTypeCreateData>): Promise<ApiResponse<MealType>> => {
    return makeRequest<MealType>(`/api/meal-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return makeRequest<{ message: string }>(`/api/meal-types/${id}`, {
      method: 'DELETE',
    });
  },
};

// RESTAURANT API
export interface RestaurantCreateData {
  name: string;
  address_id: string;
  is_closed: boolean;
  phone_number?: string;
  email?: string;
}

export const restaurantAPI = {
  create: async (data: RestaurantCreateData): Promise<ApiResponse<Restaurant>> => {
    return makeRequest<Restaurant>('/api/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getAll: async (): Promise<ApiResponse<Restaurant[]>> => {
    return makeRequest<Restaurant[]>('/api/restaurants');
  },
  update: async (id: string, data: Partial<RestaurantCreateData>): Promise<ApiResponse<Restaurant>> => {
    return makeRequest<Restaurant>(`/api/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return makeRequest<{ message: string }>(`/api/restaurants/${id}`, {
      method: 'DELETE',
    });
  },
};

// MEAL API
export interface MealCreateData {
  restaurant_id: string;
  name: string;
  allergen: string[];
  mealtype: string[];
  cuisine: string[];
  food_type: 'veg' | 'non_veg' | 'vegan';
  description?: string;
  alcohol?: boolean;
  image?: string;
}

export const mealAPI = {
  create: async (data: MealCreateData): Promise<ApiResponse<Meal>> => {
    // Fetch full objects for allergens, meal types, and cuisine
    try {
      const [allergensResponse, mealTypesResponse, cuisinesResponse] = await Promise.all([
        allergenAPI.getAll(),
        mealTypeAPI.getAll(),
        cuisineAPI.getAll(),
      ]);

      if (!allergensResponse.success || !mealTypesResponse.success || !cuisinesResponse.success) {
        return {
          success: false,
          message: 'Failed to fetch reference data for meal creation',
          data: null,
          error: 'Failed to fetch allergens, meal types, or cuisines'
        };
      }

      // Filter and get full objects based on IDs
      const allergenObjects = allergensResponse.data.filter(allergen => 
        data.allergen.includes(allergen.id)
      );
      
      const mealTypeObjects = mealTypesResponse.data.filter(mealType => 
        data.mealtype.includes(mealType.id)
      );
      
      const cuisineObjects = cuisinesResponse.data.filter(cuisine => 
        data.cuisine.includes(cuisine.id)
      );

      // Prepare data with full objects
      const mealDataWithObjects = {
        ...data,
        allergen: allergenObjects,
        mealtype: mealTypeObjects,
        cuisine: cuisineObjects,
      };

      
      return makeRequest<Meal>('/api/meals', {
        method: 'POST',
        body: JSON.stringify(mealDataWithObjects),
      });
    } catch (error) {
      logger.error('Error in meal creation:', error);
      return {
        success: false,
        message: 'Failed to create meal',
        data: null,
        error: 'An error occurred during meal creation'
      };
    }
  },
  getAll: async (): Promise<ApiResponse<Meal[]>> => {
    return makeRequest<Meal[]>('/api/meals');
  },
  update: async (id: string, data: Partial<MealCreateData>): Promise<ApiResponse<Meal>> => {
    return makeRequest<Meal>(`/api/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return makeRequest<{ message: string }>(`/api/meals/${id}`, {
      method: 'DELETE',
    });
  },
};

// AUTH API
export const authAPI = {
  checkAdmin: async (): Promise<ApiResponse<{ is_admin: boolean }>> => {
    return makeRequest<{ is_admin: boolean }>('/api/auth/check-admin');
  },
  validateToken: async (): Promise<ApiResponse<{ valid: boolean }>> => {
    return makeRequest<{ valid: boolean }>('/api/auth/validate', {
      method: 'POST'
    });
  },
};

// MEAL SCHEDULE API
export interface MealScheduleEntry {
  date: string;
  meal_1: string;
  meal_2: string;
  meal_3: string;
  meal_4: string;
  meal_5: string;
}

export const mealScheduleAPI = {
  scheduleMultipleMeals: async (mealSchedules: MealScheduleEntry[]): Promise<ApiResponse<{ scheduled_count: number }>> => {
    return makeRequest<{ scheduled_count: number }>('/api/schedule_meals', {
      method: 'POST',
      body: JSON.stringify({ meal_schedules: mealSchedules }),
    });
  },
  
  getMealSchedule: async (startDate?: string, endDate?: string): Promise<ApiResponse<MealScheduleEntry[]>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/meal_schedule?${queryString}` : '/api/meal_schedule';
    
    return makeRequest<MealScheduleEntry[]>(endpoint);
  },
  
  deleteMealSchedule: async (date: string): Promise<ApiResponse<{ message: string }>> => {
    return makeRequest<{ message: string }>(`/api/meal_schedule/${date}`, {
      method: 'DELETE',
    });
  },
}; 