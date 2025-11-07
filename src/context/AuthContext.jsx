import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Login handler (works for student & admin)
  const login = async (identifier, password, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? "/admin/login" : "/auth/login";
      const payload = isAdmin
        ? { username: identifier, password }
        : { email: identifier, password };

      const res = await axios.post(endpoint, payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", isAdmin ? "admin" : "student");

      setUser({
        ...res.data[isAdmin ? "admin" : "user"],
        role: isAdmin ? "admin" : "student",
      });

      toast.success("Login successful!");
      return res;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    toast.info("Logged out");
  };

  // 🔹 Load user profile automatically if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/me");
        setUser({ ...res.data, role: role || "student" });
      } catch (err) {
        console.warn("Auth verification failed:", err.response?.status);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
