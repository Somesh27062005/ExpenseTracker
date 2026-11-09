import React, { useContext, useState } from 'react';
import { SIDE_MENU_DATA } from '../../utils/data';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import CharAvatar from '../Cards/CharAvatar';

const ProfileAvatar = ({ imageUrl, fullName }) => {
    const [imgFailed, setImgFailed] = useState(false);

    if (!imageUrl || imgFailed) {
        return (
            <CharAvatar
                fullName={fullName}
                width="w-20"
                height="h-20"
                style="text-xl"
            />
        );
    }

    return (
        <img
            src={imageUrl}
            alt="Profile Image"
            onError={() => setImgFailed(true)}
            className="w-20 h-20 bg-slate-200 rounded-full object-cover border border-gray-200"
        />
    );
};

const SideMenu = ({ activeMenu, onCloseMobileMenu }) => {
    const { user, clearUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        clearUser();
        onCloseMobileMenu?.();
        navigate("/login");
    };

    const handleClick = (route) => {
        if (route === "logout") {
            handleLogout();
            return;
        }

        navigate(route);
        onCloseMobileMenu?.();
    };

    return (
        <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/70 p-5 sticky top-[61px] z-20 overflow-y-auto">
            <div className="flex flex-col items-center justify-center gap-2 mb-7">
                <ProfileAvatar
                    key={user?.profileImageUrl || "no-avatar"}
                    imageUrl={user?.profileImageUrl}
                    fullName={user?.fullName}
                />

                <div className="text-center mt-1">
                    <h5 className="text-gray-950 font-medium leading-6">
                        {user?.fullName || ""}
                    </h5>
                    {user?.email && (
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">
                            {user.email}
                        </p>
                    )}
                </div>
            </div>

            {SIDE_MENU_DATA.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    className={`w-full flex items-center gap-4 text-[15px] ${
                        activeMenu === item.label
                            ? "text-white bg-primary"
                            : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    } py-3 px-6 rounded-lg mb-2 cursor-pointer transition-colors`}
                    onClick={() => handleClick(item.path)}
                >
                    <item.icon className="text-xl shrink-0" />
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
};

export default SideMenu;
