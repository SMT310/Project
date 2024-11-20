import { Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from './context/AuthContext';

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AdminPage from "./pages/admin/AdminPage";
import './App.css'

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./utils/db/theme";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const [theme, colorMode] = useMode();

  // const { data: authUser, isLoading } = useQuery({
  //   queryKey: ["authUser"],
  //   queryFn: async () => {
  //     try {
  //       const res = await fetch("/api/auth/me");
  //       const data = await res.json();
  //       const role = data.role;
  //       if (data.error) return null;
  //       if (!res.ok) {
  //         throw new Error(data.error || "Something went wrong");
  //       }
  //       console.log("authUser is here:", data);
  //       console.log("Role:", role);

  //       return data;
  //     } catch (error) {
  //       throw new Error(error);
  //     }
  //   },
  //   retry: false,
  // });
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      // Check localStorage first
      const savedUser = JSON.parse(localStorage.getItem("authUser"));
      if (savedUser) {
        console.log("Saved user:", savedUser);
        return savedUser;
      };

      // Fetch current user if not in localStorage
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.error) return null;
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      console.log("authUser is here:", data);
      // Persist current user
      localStorage.setItem("authUser", JSON.stringify(data));
      return data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }
  console.log("authUser in App:", authUser);

  return (
    <>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <div className='flex max-w-6xl mx-auto p-0'>
            <Routes>
              <Route path='/*' element={authUser
                ? authUser.role === 'user'
                  ? <HomePage />
                  : <AdminPage />
                : <Navigate to='/login' />
              } />
              <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
              <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
              <Route path='/notifications' element={authUser?.role === 'user' ? <NotificationPage /> : <Navigate to='/login' />} />
              <Route path='/profile/:username' element={authUser?.role === 'user' ? <ProfilePage /> : <Navigate to='/login' />} />
            </Routes>
            <Toaster />
          </div>
          <CssBaseline />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
}


export default App;
