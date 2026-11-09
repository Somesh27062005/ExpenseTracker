import React, { useContext, useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';
import { LuLoaderCircle } from 'react-icons/lu';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [slowNotice, setSlowNotice] = useState(false);

    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (!validateEmail(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!password) {
            setError("Please enter the password.");
            return;
        }

        setError("");
        setLoading(true);
        setSlowNotice(false);

        const slowTimer = setTimeout(() => {
            setSlowNotice(true);
        }, 4000);

        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
                email: email.trim(),
                password,
            });
            const { token, user } = response.data;

            if (token) {
                localStorage.setItem("token", token);
                updateUser(user);
                navigate("/dashboard");
            }
        } catch (err) {
            if (err.response && err.response.data?.message) {
                setError(err.response.data.message);
            } else if (err.code === "ECONNABORTED") {
                setError("Request timed out while waking the server. Please try again.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            clearTimeout(slowTimer);
            setLoading(false);
            setSlowNotice(false);
        }
    };

    return (
        <AuthLayout>
            <div className="lg:w-[70%] flex flex-col justify-center py-6">
                <h3 className="text-xl font-semibold text-black">Welcome Back</h3>
                <p className="text-xs text-slate-700 mt-[5px] mb-6">
                    Please enter your details to log in
                </p>

                <form onSubmit={handleLogin}>
                    <Input
                        value={email}
                        onChange={({ target }) => setEmail(target.value)}
                        label="Email Address"
                        placeholder="john@example.com"
                        type="email"
                        disabled={loading}
                    />

                    <Input
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                        label="Password"
                        placeholder="Min 8 Characters"
                        type="password"
                        disabled={loading}
                    />

                    {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading && <LuLoaderCircle className="animate-spin text-base" />}
                        <span>{loading ? "LOGGING IN..." : "LOGIN"}</span>
                    </button>

                    {slowNotice && (
                        <p className="text-xs text-purple-600 mt-2 text-center">
                            Server is waking up, please wait a few seconds...
                        </p>
                    )}

                    <p className="text-[13px] text-slate-800 mt-3">
                        Don&apos;t have an account?{" "}
                        <Link className="font-medium text-primary underline" to="/signUp">
                            SignUp
                        </Link>
                    </p>
                </form>
            </div>
        </AuthLayout>
    );
};

export default Login;
