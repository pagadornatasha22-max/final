import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: Omit<User, 'id' | 'role' | 'createdAt'>) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  updateUserById: (userId: string, userData: Partial<User>) => void;
  refreshUsers: () => void;
  getAllCustomers: () => User[];
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const apiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;

  useEffect(() => {
    const savedUser = localStorage.getItem('macels_currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (apiUrl) {
      refreshUsers();
    } else {
      setUsers(JSON.parse(localStorage.getItem('macels_users') || '[]'));
    }
  }, [apiUrl]);

  const refreshUsers = () => {
    if (apiUrl) {
      void (async () => {
        const response = await fetch(`${apiUrl}/api/users`);
        if (response.ok) setUsers(await response.json());
      })();
      return;
    }
    setUsers(JSON.parse(localStorage.getItem('macels_users') || '[]'));
  };

  const login = async (identifier: string, password: string) => {
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      if (response.ok) {
        const user: User = await response.json();
        setCurrentUser(user);
        localStorage.setItem('macels_currentUser', JSON.stringify(user));
        return { success: true, message: 'Login successful!' };
      }
      return { success: false, message: 'Invalid email/username or password.' };
    }

    const users: User[] = JSON.parse(localStorage.getItem('macels_users') || '[]');
    const user = users.find(
      (u) => (u.email === identifier || u.username === identifier) && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('macels_currentUser', JSON.stringify(user));
      return { success: true, message: 'Login successful!' };
    }
    return { success: false, message: 'Invalid email/username or password.' };
  };

  const register = async (userData: Omit<User, 'id' | 'role' | 'createdAt'>) => {
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { success: false, message: data.message || 'Registration failed.' };
      }
      const newUser: User = await response.json();
      setUsers((prev) => [newUser, ...prev]);
      return { success: true, message: 'Registration successful! You can now login.' };
    }

    const users: User[] = JSON.parse(localStorage.getItem('macels_users') || '[]');
    const emailExists = users.find((u) => u.email === userData.email);
    if (emailExists) {
      return { success: false, message: 'Email already registered.' };
    }
    const usernameExists = users.find((u) => u.username === userData.username);
    if (usernameExists) {
      return { success: false, message: 'Username already taken.' };
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem('macels_users', JSON.stringify(users));
    return { success: true, message: 'Registration successful! You can now login.' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('macels_currentUser');
    localStorage.removeItem('macels_currentPage');
    localStorage.removeItem('macels_directOrderProductId');
  };

  const updateProfile = (userData: Partial<User>) => {
    if (!currentUser) return;
    if (apiUrl) {
      void (async () => {
        const response = await fetch(`${apiUrl}/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentUser, ...userData }),
        });
        if (response.ok) {
          const updatedUser = await response.json();
          setCurrentUser(updatedUser);
          localStorage.setItem('macels_currentUser', JSON.stringify(updatedUser));
        }
      })();
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem('macels_users') || '[]');
    const index = users.findIndex((u) => u.id === currentUser.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      localStorage.setItem('macels_users', JSON.stringify(users));
      const updatedUser = { ...currentUser, ...userData };
      setUsers(users);
      setCurrentUser(updatedUser);
      localStorage.setItem('macels_currentUser', JSON.stringify(updatedUser));
    }
  };

  const updateUserById = (userId: string, userData: Partial<User>) => {
    const existing = users.find((u) => u.id === userId);
    if (!existing) return;

    if (apiUrl) {
      void (async () => {
        const response = await fetch(`${apiUrl}/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...existing, ...userData }),
        });
        if (response.ok) {
          const updatedUser: User = await response.json();
          setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
          if (currentUser?.id === userId) {
            setCurrentUser(updatedUser);
            localStorage.setItem('macels_currentUser', JSON.stringify(updatedUser));
          }
        }
      })();
      return;
    }

    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, ...userData } : u));
    setUsers(updatedUsers);
    localStorage.setItem('macels_users', JSON.stringify(updatedUsers));
    if (currentUser?.id === userId) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('macels_currentUser', JSON.stringify(updatedUser));
    }
  };

  const getAllCustomers = () => {
    return users.filter((u) => u.role === 'customer');
  };

  const getAllUsers = () => users;

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, updateProfile, updateUserById, refreshUsers, getAllCustomers, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
