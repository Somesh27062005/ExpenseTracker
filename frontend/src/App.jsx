import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Home from './pages/Dashboard/Home';
import Income from './pages/Dashboard/Income';
import Expense from './pages/Dashboard/Expense';
import Budgets from './pages/Dashboard/Budgets';
import Recurring from './pages/Dashboard/Recurring';
import Settings from './pages/Dashboard/Settings';
import UserProvider from './context/UserContext';
import { Toaster } from 'react-hot-toast';

const Root = () => {
    const isAuthenticated = !!localStorage.getItem("token");

    return isAuthenticated ? (
        <Navigate to="/dashboard" replace />
    ) : (
        <Navigate to="/login" replace />
    );
};

const App = () => {
    return (
        <UserProvider>
            <div>
                <Router>
                    <Routes>
                        <Route path="/" element={<Root />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signUp" element={<SignUp />} />
                        <Route path="/dashboard" element={<Home />} />
                        <Route path="/income" element={<Income />} />
                        <Route path="/expense" element={<Expense />} />
                        <Route path="/budgets" element={<Budgets />} />
                        <Route path="/recurring" element={<Recurring />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Root />} />
                    </Routes>
                </Router>
            </div>

            <Toaster
                toastOptions={{
                    className: "",
                    style: {
                        fontSize: '13px',
                    },
                }}
            />
        </UserProvider>
    );
};

export default App;
