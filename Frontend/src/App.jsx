import { Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AdminPage from "./pages/admin/AdminPage";
import Topbar from "./scenes/global/Topbar";
import AdminSidebar from "./scenes/global/Sidebar";
// import Sidebar from "./components/common/Sidebar";
// import RightPanel from "./components/common/RightPanel";
import './App.css'

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./utils/db/theme";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        const role = data.role;
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        console.log("authUser is here:", data);
        console.log("Role:", role);

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

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
          {/* <div className="app">
            <AdminSidebar isSidebar={isSidebar} />
            <main className="content">
              <Topbar setIsSidebar={setIsSidebar} />
              <Routes>
                <Route path='/*' element={<AdminPage />} />
              </Routes>
            </main>
          </div> */}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
}


export default App;
