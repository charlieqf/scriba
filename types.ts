export interface User {
  id: string;
  name: string;
  email: string;
  provider: 'email' | 'google' | 'apple' | 'facebook';
  token?: string;
  avatar?: string;
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