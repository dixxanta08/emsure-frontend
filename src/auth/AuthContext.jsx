import authService from "@/features/authentication/services/authService";
import { getCookie } from "@/utils/cookieUtils";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState();
  const [accessToken, setAccessToken] = useState();

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      if (response?.accessToken && response?.user) {
        setAccessToken(response.accessToken);
        setLoggedInUser(response.user);
        return true;
      }
      throw new Error("Invalid credentials or response");
    } catch (error) {
      console.error("Login failed:", error.message);
      setAccessToken(null);
      setLoggedInUser(null);
      return false;
    }
  };

  useEffect(() => {
    const accessToken = getCookie("accessToken");

    const fetchMe = async () => {
      const data = await authService.fetchMe();
      console.log("fetchMe", data);
      setLoggedInUser(data.user);
    };

    if (accessToken) {
      fetchMe();
      setAccessToken(accessToken);
    }
  }, []);

  const logout = () => {
    // backend clear tokens
    setAccessToken(null);
    setLoggedInUser(null);
  };

  useLayoutEffect(() => {
    const authInterceptor = authService.interceptors.request.use(
      (config) => {
        if (!config._retry && accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      authService.interceptors.request.eject(authInterceptor); // remove interceptor
    };
  }, [accessToken]);

  useLayoutEffect(() => {
    let refreshAttempted = false; // To prevent infinite loops
    const refreshInterceptor = authService.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401) {
          // If the request already tried to refresh the token, don't try again
          if (refreshAttempted || originalRequest._isRefreshTokenRequest) {
            // If we fail to refresh the token, reject immediately to avoid looping
            logout();
            return Promise.reject(error);
          }

          // Mark this request as refresh token request
          refreshAttempted = true;
          originalRequest._isRefreshTokenRequest = true;

          try {
            const data = await authService.refreshToken();

            if (data.refreshTokenError) {
              logout(); // Log the user out if refresh token is invalid or expired
              return Promise.reject(
                new Error("Refresh token is invalid or expired.")
              );
            }

            if (!data.accessToken) {
              logout();
              return Promise.reject(error);
            }

            setAccessToken(data.accessToken);
            setLoggedInUser(data.user);
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${data.accessToken}`;

            // Retry the original request with the new access token
            return authService(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error); // Reject error if not a 401 or invalid scenario
      }
    );

    return () => {
      authService.interceptors.response.eject(refreshInterceptor);
    };
  }, []);

  // useLayoutEffect(() => {
  //   const refreshInterceptor = authService.interceptors.response.use(
  //     (response) => response,
  //     async (error) => {
  //       const originalRequest = error.config;
  //       if (
  //         error.response &&
  //         error.response.status === 401
  //         // && !originalRequest._retry
  //       ) {
  //         try {
  //           const data = await authService.refreshToken();

  //           if (data.refreshTokenError) {
  //             logout();
  //             return Promise.reject(
  //               new Error("Refresh token is invalid or expired.")
  //             );
  //           }

  //           if (!data.accessToken) {
  //             logout();
  //             return Promise.reject(error);
  //           }

  //           setAccessToken(data.accessToken);
  //           originalRequest.headers[
  //             "Authorization"
  //           ] = `Bearer ${data.accessToken}`;

  //           // originalRequest._retry = true;
  //           return authService(originalRequest);
  //         } catch (refreshError) {
  //           logout();
  //           return Promise.reject(refreshError);
  //         }
  //       }

  //       return Promise.reject(error); // Reject error if not a 401 or invalid scenario
  //     }
  //   );

  //   return () => {
  //     authService.interceptors.response.eject(refreshInterceptor);
  //   };
  // }, []);

  //   changes on every render useMemo better alternative
  return (
    <AuthContext.Provider value={{ loggedInUser, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
