import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Topbar from "../../scenes/global/Topbar";
import Sidebar from "../../scenes/global/Sidebar";
import Dashboard from "../../scenes/dashboard";
import Team from "../../scenes/team";
import Form from "../../scenes/form";
import '../../App.css'

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "../../utils/db/theme";

const AdminPage = () => {
    const [theme, colorMode] = useMode();
    const [isSidebar, setIsSidebar] = useState(true);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div className="app"></div>
                <Sidebar isSidebar={isSidebar} />
                <main className="content">
                    <Topbar setIsSidebar={setIsSidebar} />
                    <Routes>
                        <Route path="/" element={<Team />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/form" element={<Form />} />
                    </Routes>
                </main>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default AdminPage;