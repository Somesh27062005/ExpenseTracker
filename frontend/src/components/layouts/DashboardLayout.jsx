import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import Navbar from './Navbar';
import SideMenu from './SideMenu';
import { LuLoaderCircle } from 'react-icons/lu';

const DashboardLayout = ({ children, activeMenu }) => {
    const { user } = useContext(UserContext);

    return (
        <div>
            <Navbar activeMenu={activeMenu} />

            {!user ? (
                <div className="min-h-[calc(100vh-61px)] flex flex-col items-center justify-center gap-3 text-gray-500 px-4">
                    <LuLoaderCircle className="animate-spin text-3xl text-primary" />
                    <p className="text-sm">Loading your workspace...</p>
                </div>
            ) : (
                <div className="flex">
                    <div className="hidden lg:block shrink-0">
                        <SideMenu activeMenu={activeMenu} />
                    </div>

                    <div className="grow min-w-0 mx-4 md:mx-6 pb-8">{children}</div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
