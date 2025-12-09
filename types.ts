export interface User {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  provider: 'apple' | 'google' | 'facebook' | 'email';
  token: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

// Keeping architecture types for reference
export type TagColor = 'blue' | 'purple' | 'red' | 'green' | 'orange';

export interface Tag {
  label: string;
  color: TagColor;
}

export interface Requirement {
  id: string;
  category: string;
  subLabel: string;
  principles: {
    tags: Tag[];
    description: string;
  };
  implementation: {
    title: string;
    details: string;
    items?: string[];
  }[];
}