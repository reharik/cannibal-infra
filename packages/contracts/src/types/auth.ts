// Shared auth and user types for API and web

export type UserRole = "adult" | "kid";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}
