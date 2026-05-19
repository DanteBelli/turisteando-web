import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../api/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isForgotPassword: boolean;
  forgotPasswordStep: 'email' | 'reset';
  forgotEmail: string;
  resetCode: string;
  newPassword: string;
  confirmNewPassword: string;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  loginWithGoogle: (googleData: any) => Promise<void>;
  setIsForgotPassword: (value: boolean) => void;
  setForgotPasswordStep: (step: 'email' | 'reset') => void;
  setForgotEmail: (email: string) => void;
  setResetCode: (code: string) => void;
  setNewPassword: (password: string) => void;
  setConfirmNewPassword: (password: string) => void;
  resetForgotPasswordForm: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'reset'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Check if user is already authenticated on mount
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await authService.getAuthToken();
      if (token) {
        setToken(token);
        // Fetch user data from API
        const currentUser = await authService.getCurrentUserFromAPI();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // If no user data, set a placeholder user
          setUser({
            id: 0,
            email: '',
            name: 'Usuario',
            last_name: '',
            celular: 0,
            tipo_user: 1,
          } as User);
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      setToken(response.token);
      
      // Fetch user data from API
      const userData = await authService.getCurrentUserFromAPI();
      if (userData) {
        setUser(userData);
      } else {
        // Fallback if API call fails
        setUser({
          id: 0,
          email: credentials.email,
          name: 'Usuario',
          last_name: '',
          celular: 0,
          tipo_user: 1,
        } as User);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.register(userData);
      
      // authService.register automatically logs in after registration
      // Set token from response
      if (response.token) {
        setToken(response.token);
      }
      
      // Fetch user data from API
      const user = await authService.getCurrentUserFromAPI();
      if (user) {
        setUser(user);
      } else {
        // Fallback if API call fails
        setUser({
          id: 0,
          email: userData.email,
          name: userData.name,
          last_name: userData.last_name,
          celular: userData.celular,
          tipo_user: 1,
        } as User);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Error durante el registro';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('Logout iniciado...');
      setIsLoading(true);
      await authService.logout();
      console.log('authService.logout() completado');
    } catch (err) {
      console.error('Logout falló:', err);
    } finally {
      // Always clear user and token, even if logout fails
      console.log('Limpiando estado de autenticación...');
      setUser(null);
      setToken(null);
      setError(null);
      setIsLoading(false);
      console.log('Logout completado');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetForgotPasswordForm = useCallback(() => {
    setIsForgotPassword(false);
    setForgotPasswordStep('email');
    setForgotEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.requestPasswordReset(email);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al solicitar reset de contraseña';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.resetPassword(email, code, newPassword);
      setToken(response.token);
      
      // Fetch user data from API
      const userData = await authService.getCurrentUserFromAPI();
      if (userData) {
        setUser(userData);
      } else {
        setUser({
          id: 0,
          email: email,
          name: 'Usuario',
          last_name: '',
          celular: 0,
          tipo_user: 1,
        } as User);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al resetear contraseña';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (googleData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.loginWithGoogle(googleData);
      setToken(response.token);
      
      // Fetch user data from API
      const userData = await authService.getCurrentUserFromAPI();
      if (userData) {
        setUser(userData);
      } else {
        setUser({
          id: 0,
          email: googleData.email,
          name: googleData.name || 'Usuario',
          last_name: googleData.last_name || '',
          celular: googleData.celular || 0,
          tipo_user: 1,
        } as User);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al iniciar sesión con Google';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    error,
    isForgotPassword,
    forgotPasswordStep,
    forgotEmail,
    resetCode,
    newPassword,
    confirmNewPassword,
    login,
    register,
    logout,
    clearError,
    checkAuth,
    requestPasswordReset,
    resetPassword,
    loginWithGoogle,
    setIsForgotPassword,
    setForgotPasswordStep,
    setForgotEmail,
    setResetCode,
    setNewPassword,
    setConfirmNewPassword,
    resetForgotPasswordForm,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
