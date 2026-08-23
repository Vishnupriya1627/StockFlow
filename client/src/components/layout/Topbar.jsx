import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, LogOut } from "lucide-react";
import "./Topbar.css";
import stockFlowLogo from "../../assets/stockflow_logo.png";

const Topbar = ({ collapsed }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <header className="topbar h-16 flex items-center justify-between sticky top-0 z-20">
      {/* ==================================================
          SEARCH
      ================================================== */}

      <div className="flex items-center input_div_cont">
        {collapsed && (
          <div className="topbar-mini-logo">
            <img
              src={stockFlowLogo}
              alt="StockFlow"
              className="w-7 h-7 object-contain img_logo"
            />
          </div>
        )}

        <div className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 w-80 input_div">
          <Search
            size={16}
            className="text-[#52777c] shrink-0"
            strokeWidth={1.8}
          />

          <input
            type="text"
            placeholder="Search products, orders..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-[#405f64] input_product"
          />

          <span className="hidden lg:block font-mono text-[7px] text-[#405f64] border border-[#15434a] rounded px-1.5 py-1">
            /
          </span>
        </div>
      </div>

      {/* ==================================================
          RIGHT SIDE
      ================================================== */}

      <div className="flex items-center gap-4 pr-5">
        {/* System status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#123a40] bg-[#061d21]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#67c987] opacity-50 animate-ping" />

            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#67c987]" />
          </span>

          <span className="font-mono text-[7px] tracking-[0.12em] text-[#52777c]">
            SYSTEM ONLINE
          </span>
        </div>

        {/* Notifications */}
        {/* <button
          className="
            relative
            p-2
            rounded-lg
            text-[#78999e]
            hover:text-[#dce8e9]
            hover:bg-[#0a2c31]
            active:scale-95
            transition-all
            duration-200
          "
        > */}
          {/* <Bell size={18} strokeWidth={1.8} /> */}

          {/* <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#f9b223] rounded-full ring-2 ring-[#04161a]" /> */}
        {/* </button> */}

        <div className="w-px h-6 bg-[#123a40]" />

        {/* Account */}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="
      flex
      items-center
      gap-2.5
      pl-1
      pr-2
      py-1
      rounded-lg
      hover:bg-[#0a2c31]
      active:scale-[0.98]
      transition-all
      duration-200
    "
          >
            <div className="w-8 h-8 rounded-lg bg-[#0a3035] border border-[#24606a] text-[#f9b223] flex items-center justify-center text-xs font-semibold">
              V
            </div>

            <div className="text-left leading-tight hidden sm:block">
              <p className="text-xs font-semibold text-[#dce8e9] account_name">
                Admin
              </p>

            </div>

            <ChevronDown
              size={14}
              className={`text-[#52777c] hidden sm:block transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div
              className="
        absolute right-0 mt-2 w-44
        border border-[#15434a] bg-[#061d21]
        rounded-xl shadow-[0_20px_50px_rgba(0,0,0,.35)]
        overflow-hidden z-30
      "
            >
              <button
                onClick={handleLogout}
                className="
          w-full flex items-center gap-2.5 px-4 py-3
          text-sm text-[#e08484]
          hover:bg-[#0a292e]
          transition-colors
        "
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
