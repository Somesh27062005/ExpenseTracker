import React, { useContext, useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { CURRENCY_OPTIONS, validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';
import uploadImage from '../../utils/uploadImage';
import { LuLoaderCircle } from 'react-icons/lu';

const SignUp = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [currency, setCurrency] = useState("USD");

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusLabel, setStatusLabel] = useState("SIGN UP");
    const [slowNotice, setSlowNotice] = useState(false);

    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (loading) return;

        let profileImageUrl = "";

        if (!fullName.trim()) {
            setError("Please enter your name");
            return;
        }

        if (!validateEmail(email.trim())) {
            setError("Please enter a valid email address");
            return;
        }

        if (!password || password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setError("");
        setLoading(true);
        setSlowNotice(false);

        const slowTimer = setTimeout(() => {
            setSlowNotice(true);
        }, 4000);

        try {
            if (profilePic) {
                setStatusLabel("UPLOADING PHOTO...");
                const imgUploadRes = await uploadImage(profilePic);
                profileImageUrl = imgUploadRes.imageUrl || "";
            }

            setStatusLabel("CREATING ACCOUNT...");
            const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
                fullName: fullName.trim(),
                email: email.trim(),
                password,
                profileImageUrl,
                currency,
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
            setStatusLabel("SIGN UP");
        }
    };

    return (
        <AuthLayout>
            <div className="lg:w-[100%] flex flex-col justify-center py-6">
                <h3 className="text-xl font-semibold text-black">Create an Account</h3>
                <p className="text-xs text-slate-700 mt-[5px] mb-6">
                    Join us today by entering your details below.
                </p>

                <form onSubmit={handleSignUp}>
                    <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            value={fullName}
                            onChange={({ target }) => setFullName(target.value)}
                            label="Full Name"
                            placeholder="John"
                            type="text"
                            disabled={loading}
                        />

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

                        <div>
                            <label className="text-[13px] text-slate-800">Preferred Currency</label>
                            <select
                                value={currency}
                                onChange={({ target }) => setCurrency(target.value)}
                                disabled={loading}
                                className="input-box cursor-pointer disabled:opacity-70"
                            >
                                {CURRENCY_OPTIONS.map((opt) => (
                                    <option key={opt.code} value={opt.code}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading && <LuLoaderCircle className="animate-spin text-base" />}
                        <span>{loading ? statusLabel : "SIGN UP"}</span>
                    </button>

                    {slowNotice && (
                        <p className="text-xs text-purple-600 mt-2 text-center">
                            Server is waking up, please wait a few seconds...
                        </p>
                    )}

                    <p className="text-[13px] text-slate-800 mt-3">
                        Already have an account?{" "}
                        <Link className="font-medium text-primary underline" to="/login">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </AuthLayout>
    );
};

export default SignUp;
