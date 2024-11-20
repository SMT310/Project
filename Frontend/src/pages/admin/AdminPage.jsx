import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Topbar from "../../scenes/global/Topbar";
import Sidebar from "../../scenes/global/Sidebar";
import Team from "../../scenes/team";
import Form from "../../scenes/form";
import Posts from "../../scenes/posts";
import '../../App.css'

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "../../utils/db/theme";

const AdminPage = () => {
    const [theme, colorMode] = useMode();
    const [isSidebar, setIsSidebar] = useState(true);


    return (
        // <ColorModeContext.Provider value={colorMode}>
        //     <ThemeProvider theme={theme}>
        //         <CssBaseline />
        <>
                <div className="app"></div>
                <Sidebar isSidebar={isSidebar} />
                <main className="content">
                    <Topbar setIsSidebar={setIsSidebar} />
                    <Routes>
                        <Route path="/team" element={<Team />} />
                        <Route path="/form" element={<Form />} />
                        <Route path="/posts" element={<Posts />} />
                    </Routes>
            </main>
        </>
        //     </ThemeProvider>
        // </ColorModeContext.Provider>
    );
}

export default AdminPage;