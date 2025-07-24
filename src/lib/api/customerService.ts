import { Customer } from "@/types/models";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface CustomerCreateData {
  first_name: string;
  last_name: string;
  email: string;
  password: string; // Required for auth/signup
  phone_number?: string;
  role?: 'user' | 'admin';
}

interface CustomerUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  role?: 'user' | 'admin';
  email_verified?: boolean;
}

interface SignupResponse {
  success: boolean;
  data?: {
    customer: Customer;
    tokens: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  };
  error?: string;
}

class CustomerService {
  private getAuthToken(): string | null {
    const storedTokens = localStorage.getItem("authTokens");
    if (storedTokens) {
      try {
        const tokens = JSON.parse(storedTokens);
        return tokens.access_token || null;
      } catch (error) {
        console.error("Error parsing stored tokens:", error);
        return null;
      }
    }
    return null;
  }

  private async refreshTokens(): Promise<boolean> {
    const storedTokens = localStorage.getItem("authTokens");
    if (!storedTokens) {
      return false;
    }

    try {
      const tokens = JSON.parse(storedTokens);
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
          // Get existing tokens to preserve refresh_token
          const existingTokens = JSON.parse(storedTokens);
          
          // Update with new access token, keep existing refresh token
          const updatedTokens = {
            access_token: data.data.access_token,
            refresh_token: existingTokens.refresh_token,
            expires_in: data.data.expires_in
          };
          
          localStorage.setItem("authTokens", JSON.stringify(updatedTokens));
          return true;
        }
      }
      
      // If refresh fails, clear stored tokens and redirect to login
      localStorage.removeItem("authTokens");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      localStorage.removeItem("authTokens");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return false;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<ApiResponse<T>> {
    try {
      let token = this.getAuthToken();
      
      // If no token and this isn't a retry, try to refresh first
      if (!token && !isRetry) {
        console.log('No token available in customerService, attempting refresh...');
        const refreshSuccess = await this.refreshTokens();
        if (refreshSuccess) {
          token = this.getAuthToken();
        } else {
          return {
            success: false,
            error: 'Authentication required. Please log in again.'
          };
        }
      }
      
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

      // If we get a 401 and haven't already retried, try to refresh the token
      if (response.status === 401 && !isRetry) {
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          // Retry the request with the new token
          return this.makeRequest(endpoint, options, true);
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getAllCustomers(): Promise<ApiResponse<Customer[]>> {
    return this.makeRequest<Customer[]>('/api/customers');
  }

  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    return this.makeRequest<Customer>(`/api/customers/${id}`);
  }

  async createCustomer(customerData: CustomerCreateData): Promise<ApiResponse<Customer>> {
    // Use auth/signup endpoint for creating new customers
    const signupData = {
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      email: customerData.email,
      password: customerData.password,
      phone_number: customerData.phone_number,
      role: customerData.role || 'user'
    };

    try {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('Token unavailable');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(signupData),
      });

      const data: SignupResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create customer');
      }

      if (data.success && data.data) {
        // Return just the customer data in the expected format
        return {
          success: true,
          data: data.data.customer
        };
      }

      return {
        success: false,
        error: 'Unexpected response format'
      };
    } catch (error) {
      console.error('Customer creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create customer'
      };
    }
  }

  async updateCustomer(id: string, customerData: CustomerUpdateData): Promise<ApiResponse<Customer>> {
    return this.makeRequest<Customer>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/api/customers/${id}`, {
      method: 'DELETE',
    });
  }
}

export const customerService = new CustomerService();
export type { CustomerCreateData, CustomerUpdateData }; 