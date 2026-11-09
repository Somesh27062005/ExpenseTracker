import React, { useContext, useState } from 'react';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import SideMenu from './SideMenu';
import { UserContext } from '../../context/UserContext';
import { getCurrencyConfig } from '../../utils/helper';

const Navbar = ({ activeMenu }) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const { user } = useContext(UserContext);
    const currency = getCurrencyConfig(user?.currency || "USD");

    return (
        <div className="flex items-center justify-between bg-white border-b border-gray-200/70 backdrop-blur-[2px] py-4 px-5 md:px-7 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="block lg:hidden text-black cursor-pointer"
                    onClick={() => setOpenSideMenu((prev) => !prev)}
                    aria-label="Toggle navigation menu"
                >
                    {openSideMenu ? (
                        <HiOutlineX className="text-2xl" />
                    ) : (
                        <HiOutlineMenu className="text-2xl" />
                    )}
                </button>

                <h2 className="text-lg font-medium text-black">Expense Tracker</h2>
            </div>

            {user && (
                <div className="flex items-center gap-2 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full">
                    <span>{currency.symbol}</span>
                    <span>{currency.code}</span>
                </div>
            )}

            {openSideMenu && (
                <>
                    <div
                        className="fixed inset-0 top-[61px] bg-black/25 z-30 lg:hidden"
                        onClick={() => setOpenSideMenu(false)}
                    />
                    <div className="fixed top-[61px] left-0 bg-white z-40 shadow-xl lg:hidden">
                        <SideMenu
                            activeMenu={activeMenu}
                            onCloseMobileMenu={() => setOpenSideMenu(false)}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Navbar;
