import React, { useContext, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/UserContext';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/Input';
import { CURRENCY_OPTIONS } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import uploadImage from '../../utils/uploadImage';
import toast from 'react-hot-toast';
import { LuUser, LuLock, LuLoaderCircle } from 'react-icons/lu';

const SettingsContent = ({ user, updateUser }) => {
    const [profilePic, setProfilePic] = useState(user?.profileImageUrl || null);
    const [fullName, setFullName] = useState(user?.fullName || "");
    const [currency, setCurrency] = useState(user?.currency || "USD");
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (savingProfile) return;

        if (!fullName.trim()) {
            toast.error("Full name is required.");
            return;
        }

        setSavingProfile(true);
        try {
            let profileImageUrl = null;
            if (profilePic instanceof File) {
                const uploadRes = await uploadImage(profilePic);
                profileImageUrl = uploadRes.imageUrl || null;
            } else if (typeof profilePic === "string" && profilePic.trim()) {
                profileImageUrl = profilePic;
            }

            const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
                fullName: fullName.trim(),
                profileImageUrl,
                currency,
            });

            if (response.data?.user) {
                updateUser(response.data.user);
                setProfilePic(response.data.user.profileImageUrl || null);
            }
            toast.success("Profile & preferences updated");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (savingPassword) return;

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setSavingPassword(true);
        try {
            await axiosInstance.put(API_PATHS.AUTH.CHANGE_PASSWORD, {
                currentPassword,
                newPassword,
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast.success("Password updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password");
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile & Currency Settings */}
            <form onSubmit={handleProfileSubmit} className="card space-y-4">
                <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                    <div className="w-9 h-9 rounded-full bg-purple-50 text-primary flex items-center justify-center">
                        <LuUser className="text-lg" />
                    </div>
                    <div>
                        <h4 className="text-base font-medium text-gray-900">
                            Profile & Currency
                        </h4>
                        <p className="text-xs text-gray-400">
                            Manage your display details and preferred currency format.
                        </p>
                    </div>
                </div>

                <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

                <Input
                    value={user?.email || ""}
                    onChange={() => {}}
                    label="Email Address"
                    type="email"
                    disabled
                />

                <Input
                    value={fullName}
                    onChange={({ target }) => setFullName(target.value)}
                    label="Full Name"
                    placeholder="Your name"
                    type="text"
                    disabled={savingProfile}
                />

                <div>
                    <label className="text-[13px] text-slate-800">Preferred Currency</label>
                    <select
                        value={currency}
                        onChange={({ target }) => setCurrency(target.value)}
                        disabled={savingProfile}
                        className="input-box cursor-pointer disabled:opacity-70"
                    >
                        {CURRENCY_OPTIONS.map((opt) => (
                            <option key={opt.code} value={opt.code}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={savingProfile}
                        className="add-btn add-btn-fill"
                    >
                        {savingProfile && <LuLoaderCircle className="animate-spin text-base" />}
                        <span>{savingProfile ? "Saving..." : "Save Changes"}</span>
                    </button>
                </div>
            </form>

            {/* Change Password */}
            <form onSubmit={handlePasswordSubmit} className="card space-y-4 h-fit">
                <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                    <div className="w-9 h-9 rounded-full bg-purple-50 text-primary flex items-center justify-center">
                        <LuLock className="text-lg" />
                    </div>
                    <div>
                        <h4 className="text-base font-medium text-gray-900">
                            Account Security
                        </h4>
                        <p className="text-xs text-gray-400">
                            Update your password to keep your financial data secure.
                        </p>
                    </div>
                </div>

                <Input
                    value={currentPassword}
                    onChange={({ target }) => setCurrentPassword(target.value)}
                    label="Current Password"
                    placeholder="Enter current password"
                    type="password"
                    disabled={savingPassword}
                />

                <Input
                    value={newPassword}
                    onChange={({ target }) => setNewPassword(target.value)}
                    label="New Password"
                    placeholder="Min 8 Characters"
                    type="password"
                    disabled={savingPassword}
                />

                <Input
                    value={confirmPassword}
                    onChange={({ target }) => setConfirmPassword(target.value)}
                    label="Confirm New Password"
                    placeholder="Re-enter new password"
                    type="password"
                    disabled={savingPassword}
                />

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={savingPassword}
                        className="add-btn add-btn-fill"
                    >
                        {savingPassword && <LuLoaderCircle className="animate-spin text-base" />}
                        <span>{savingPassword ? "Updating..." : "Update Password"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

const Settings = () => {
    useUserAuth();
    const { user, updateUser } = useContext(UserContext);

    return (
        <DashboardLayout activeMenu="Settings">
            <div className="my-5 mx-auto space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Settings</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Customize your currency, profile information, and security preferences.
                    </p>
                </div>

                {user && (
                    <SettingsContent
                        key={user._id || user.email || "user"}
                        user={user}
                        updateUser={updateUser}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default Settings;
