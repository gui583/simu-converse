
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

const AUTH_KEY = 'simuverse_user_session';

export const getCurrentUser = (): AuthUser | null => {
  const stored = localStorage.getItem(AUTH_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const loginWithGoogle = async (): Promise<AuthUser> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock Google User Data
  const mockUser: AuthUser = {
    id: 'google_user_' + Math.floor(Math.random() * 10000),
    name: 'Viajante do Tempo',
    email: 'usuario.simuverse@gmail.com',
    avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c' // Generic Google-like avatar
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
  return mockUser;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};
