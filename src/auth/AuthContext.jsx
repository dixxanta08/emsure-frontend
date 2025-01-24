import authService from "@/features/authentication/services/authService";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleAuthError = (error) => {
    console.error("Authentication error:", error?.message || error);
    setLoggedInUser(null);
    setLoading(false);
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const data = await authService.fetchMe();
        if (data?.user) {
          setLoggedInUser(data.user);
        } else {
          setLoggedInUser(null);
        }
      } catch (error) {
        handleAuthError(error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      if (response?.user) {
        setLoggedInUser(response.user);
        return true;
      }
      throw new Error("Invalid credentials or response");
    } catch (error) {
      handleAuthError(error);
      return false;
    }
  };

  const logout = () => {
    setLoggedInUser(null);
    authService.logout(); // Add token cleanup logic here
  };

  const authContextValue = useMemo(
    () => ({
      loggedInUser,
      loading,
      login,
      logout,
    }),
    [loggedInUser, loading]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
