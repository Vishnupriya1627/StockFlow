import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  AlertTriangle,
  Users,
  Settings,
  Menu,
  Zap,
  ActivitySquare,
} from "lucide-react";
import stockFlowLogo from "../../assets/stockflow_logo.png";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ops-dashboard", label: "Live Ops", icon: ActivitySquare },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
];

const secondaryItems = [
  { to: "/users", label: "Users", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

const storefrontItems = [
  { to: "/drops", label: "Flash Sale", icon: Zap },
];

const Sidebar = ({ collapsed, onToggleSidebar }) => {
  const linkClass = ({ isActive }) =>
    `custom-nav-link group flex items-center gap-3 h-11 mx-2 px-3.5 rounded-lg text-sm font-medium leading-none transition-all duration-200 ease-out ${
      collapsed ? "justify-center px-0" : ""
    } ${
      isActive
        ? "bg-[#f9b223] text-[#013f46] shadow-[0_4px_20px_rgba(249,178,35,0.18)]"
        : "text-[#78999e] hover:text-[#dce8e9] hover:bg-[#0a2c31] active:scale-[0.98]"
    }`;

  const renderGroup = (items, label) => (
    <>
      {!collapsed && (
        <p className="custom_p px-3.5 mb-3 text-[8px] font-mono font-medium tracking-[0.18em] text-[#405f64] uppercase">
          {label}
        </p>
      )}

      <div className="space-y-1">
        {items.map(({ to, label: itemLabel, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={linkClass}
            title={collapsed ? itemLabel : undefined}
          >
            <Icon
              size={17}
              className="shrink-0 icons"
              strokeWidth={1.8}
            />

            {!collapsed && (
              <span className="truncate custom_p_name">
                {itemLabel}
              </span>
            )}

            {!collapsed && to === "/drops" && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#f9b223]" />
            )}
          </NavLink>
        ))}
      </div>
    </>
  );

  return (
    <aside
      className={`sidebar-container sticky top-0 h-screen shrink-0 flex flex-col z-30 transition-[width] duration-300 ease-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* ==================================================
          LOGO / HEADER
      ================================================== */}

      <div
        className={`h-16 flex items-center gap-3 border-b border-[#123a40] shrink-0 overflow-hidden div_cont ${
          collapsed ? "justify-center px-0" : "px-3"
        }`}
      >
        <button
          onClick={() => {
            onToggleSidebar();
          }}
          aria-label="Toggle sidebar"
          className="hamburger_btn p-2 rounded-lg text-[#78999e] hover:text-[#f9b223] hover:bg-[#0a2c31] active:scale-95 transition-all duration-200"
        >
          <Menu size={19} strokeWidth={1.8} />
        </button>

        {!collapsed && (
          <>
            <div className="w-8 h-8 rounded-lg bg-[#082328] border border-[#15434a] flex items-center justify-center shrink-0">
              <img
                src={stockFlowLogo}
                alt="StockFlow"
                className="w-7 h-7 object-contain img_logo"
              />
            </div>

            <div className="min-w-0">
              <span className="block text-[15px] font-semibold tracking-[-0.02em] text-[#e7f1f1] whitespace-nowrap">
                StockFlow
              </span>

              <span className="block font-mono text-[6px] tracking-[0.16em] text-[#405f64] mt-0.5">
                INVENTORY SYSTEM
              </span>
            </div>
          </>
        )}
      </div>

      {/* ==================================================
          NAVIGATION
      ================================================== */}

      <nav className="flex-1 pt-6 pb-5 overflow-y-auto overflow-x-hidden sidebar-nav">
        {renderGroup(navItems, "Operations")}

        {/* <div className="my-6 mx-4 border-t border-[#123a40]" /> */}

        {/* {renderGroup(secondaryItems, "Manage")} */}

        {/* <div className="my-6 mx-4 border-t border-[#123a40]" /> */}

        {/* {renderGroup(storefrontItems, "Storefront")} */}
      </nav>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <div className="px-5 py-4 border-t border-[#123a40] shrink-0 overflow-hidden whitespace-nowrap">
        {collapsed ? (
          <p className="text-center font-mono text-[7px] tracking-[0.12em] text-[#405f64]">
            v0.1
          </p>
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[7px] tracking-[0.12em] text-[#405f64]">
              STOCKFLOW
            </span>

            <span className="font-mono text-[7px] text-[#405f64]">
              v0.1.0
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;