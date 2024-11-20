import React, { createContext, useContext } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children, authUser }) => {
    return (
        <AuthContext.Provider value={authUser}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
