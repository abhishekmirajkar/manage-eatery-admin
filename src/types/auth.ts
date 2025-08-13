export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: User | null;
  getAccessToken: () => string | null;
  refreshToken: () => Promise<boolean>;
  validateToken: () => Promise<boolean>;
  isLoading: boolean;
}