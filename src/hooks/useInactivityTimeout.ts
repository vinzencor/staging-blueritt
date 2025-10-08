import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/UserAuth";
import { logout } from "@/api/auth";
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
let lastActivityTime = Date.now();

export const useInactivityTimeout = () => {
  const navigate = useNavigate();
  const { accessToken, setAccessToken, setCurrentUser } = useAuth();

  const resetTimeout = useCallback(() => {
    let timeoutId: NodeJS.Timeout;

    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime;
      lastActivityTime = now;

      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        if (accessToken) {
          const inactiveTime = Date.now() - lastActivityTime;
          console.log(
            `[Inactivity Monitor] User has been inactive for ${Math.round(
              inactiveTime / 1000
            )} seconds. Logging out...`
          );

          // Clear authentication data from context
          setAccessToken("");
          setCurrentUser({
            firstName: "",
            lastName: "",
            fullName: "",
            email: "",
            phone: "",
          });

          // Call the logout API
          logout();

          // Clear all cookies
          const cookies = document.cookie.split(";");
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie =
              name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          }

          // Clear localStorage
          localStorage.clear();

          // Redirect to login page
          navigate("/login");
        }
      }, INACTIVITY_TIMEOUT);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    handleActivity();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      console.log("[Inactivity Monitor] Stopping inactivity monitoring");
    };
  }, [accessToken, setAccessToken, setCurrentUser, navigate]);

  useEffect(() => {
    if (accessToken) {
      return resetTimeout();
    }
  }, [accessToken, resetTimeout]);
};
