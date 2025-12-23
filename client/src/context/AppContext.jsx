import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [credit, setCredit] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const loadCreditsData = async () => {
    try {
      if (!token) return;

      const base = backendUrl.replace(/\/$/, "");

      const { data } = await axios.get(`${base}/api/user/credits`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data?.success) {
        setCredit(data.credits);
        if (data.user) setUser(data.user);
      } else {
        toast.error(data?.message || "Unable to load credits");
      }
    } catch (error) {
      console.error(
        "loadCreditsData error:",
        error?.response?.data || error.message
      );
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const generateImage = async (prompt) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/image/generate-image`,
        { prompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        loadCreditsData();
        return data.resultImage;
      } else {
        toast.error(data.message);
        loadCreditsData();
        if (data.creditBalance === 0) navigate("/buy");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setCredit(false);
  };

  useEffect(() => {
    if (token) {
      loadCreditsData();
    }
  }, [token]);

  const value = {
    user,
    setUser,
    showLogin,
    setShowLogin,
    backendUrl,
    token,
    setToken,
    credit,
    setCredit,
    loadCreditsData,
    logout,
    generateImage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
