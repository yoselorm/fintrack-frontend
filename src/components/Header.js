import React, { useState, useRef, useEffect } from "react";
import { Wallet, Users, User, LogOut, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/AuthSlice";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    setTimeout(() => {
      dispatch(logout());
      setIsOpen(false);
      navigate('/');
      setIsLoggingOut(false);
    }, 800);
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  return (
    <header className="flex justify-between items-center bg-indigo-600 text-white px-6 py-3 shadow-md">
      <Link to='/dashboard'>
        <div className="flex items-center gap-2 text-xl font-bold">
          <Wallet className="w-6 h-6" />
          <span>FinTrack</span>
        </div>
      </Link>

      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-2 p-2 rounded-full hover:bg-blue-700 transition"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="User menu"
        >
          <User className="w-6 h-6" />
          {user && (
            <span className="hidden md:inline text-sm">
              {user.firstName}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
            {user && (
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            )}

            <Link to="/referrals">
              <button className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors">
                <Users size={18} /> Referrals
              </button>
            </Link>

            <button
              className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              onClick={handleProfileClick}
            >
              <User size={18} /> Profile
            </button>

            <button
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors border-t border-gray-200 disabled:opacity-75"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut size={18} />
                  Logout
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;