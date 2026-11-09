import React, { createContext, useCallback, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Function to update user data
    const updateUser = useCallback((userData) => {
        setUser(userData);
    }, []);

    // Function to clear user data (e.g., on logout)
    const clearUser = useCallback(() => {
        setUser(null);
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                updateUser,
                clearUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
