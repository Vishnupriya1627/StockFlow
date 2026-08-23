import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const severityConfig = {
  critical: {
    icon: AlertCircle,
    iconClasses:
      "text-[#e08484] bg-[#e08484]/10 border-[#e08484]/20",
    badgeClasses:
      "text-[#e08484] bg-[#e08484]/10 border-[#e08484]/20",
    accent: "bg-[#e08484]",
  },

  warning: {
    icon: AlertTriangle,
    iconClasses:
      "text-[#f9b223] bg-[#f9b223]/10 border-[#f9b223]/20",
    badgeClasses:
      "text-[#f9b223] bg-[#f9b223]/10 border-[#f9b223]/20",
    accent: "bg-[#f9b223]",
  },

  info: {
    icon: Info,
    iconClasses:
      "text-[#6fb8c4] bg-[#6fb8c4]/10 border-[#6fb8c4]/20",
    badgeClasses:
      "text-[#6fb8c4] bg-[#6fb8c4]/10 border-[#6fb8c4]/20",
    accent: "bg-[#6fb8c4]",
  },

  resolved: {
    icon: CheckCircle2,
    iconClasses:
      "text-[#66d68b] bg-[#66d68b]/10 border-[#66d68b]/20",
    badgeClasses:
      "text-[#66d68b] bg-[#66d68b]/10 border-[#66d68b]/20",
    accent: "bg-[#66d68b]",
  },
};

const AlertItem = ({ alert }) => {
  const navigate = useNavigate();

  const config =
    severityConfig[alert.severity] || severityConfig.info;

  const Icon = config.icon;

  return (
    <div
      onClick={() =>
        alert.productId && navigate(`/inventory/${alert.productId}`)
      }
      className={`
        group relative flex items-start gap-4
        p-5
        rounded-2xl
        border border-[#15434a]
        bg-[#061d21]/95
        overflow-hidden
        transition-all duration-200

        ${
          alert.productId ? "cursor-pointer hover:bg-[#0a292e]/70 hover:border-[#28606a]" : ""
        }

        ${alert.resolved ? "opacity-55" : ""}
      `}
    >

      {/* ============================================================
          SEVERITY ACCENT
      ============================================================ */}

      <div
        className={`
          absolute left-0 top-0 bottom-0 w-[2px]
          ${config.accent}
          ${alert.resolved ? "opacity-40" : ""}
        `}
      />

      {/* ============================================================
          ICON
      ============================================================ */}

      <div
        className={`
          w-10 h-10
          rounded-xl
          border
          flex items-center justify-center
          shrink-0
          ${config.iconClasses}
        `}
      >
        <Icon size={17} />
      </div>

      {/* ============================================================
          CONTENT
      ============================================================ */}

      <div className="flex-1 min-w-0">

        {/* Title + Time */}

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <p className="text-sm font-semibold text-[#dcebea] truncate group-hover:text-white transition-colors">
              {alert.title}
            </p>

            <p className="font-mono text-[7px] tracking-[0.12em] text-[#54777c] mt-1">
              SYSTEM ALERT
            </p>

          </div>

          <span className="font-mono text-[8px] text-[#54777c] whitespace-nowrap shrink-0">
            {alert.time}
          </span>

        </div>

        {/* Message */}

        <p className="text-sm text-[#8eabad] mt-3 leading-5">
          {alert.message}
        </p>

        {/* Bottom metadata */}

        <div className="flex items-center gap-3 mt-4">

          <span
            className={`
              inline-flex items-center gap-1.5
              text-[8px]
              font-mono
              tracking-[0.1em]
              uppercase
              px-2.5
              py-1.5
              rounded-lg
              border
              ${config.badgeClasses}
            `}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${config.accent}`}
            />

            {alert.severity}
          </span>

          {alert.sku && (
            <>
              <span className="text-[#31575d]">
                /
              </span>

              <span className="font-mono text-[8px] text-[#54777c]">
                SKU {alert.sku}
              </span>
            </>
          )}

        </div>

      </div>

      {/* ============================================================
          NAVIGATION ARROW
      ============================================================ */}

      {alert.productId && (
        <div
          className="
            w-8 h-8
            rounded-lg
            border border-transparent
            group-hover:border-[#17444a]
            group-hover:bg-[#0a292e]
            flex items-center justify-center
            shrink-0
            mt-1
            transition-all
          "
        >
          <ChevronRight
            size={15}
            className="
              text-[#496c71]
              group-hover:text-[#f9b223]
              group-hover:translate-x-0.5
              transition-all
            "
          />
        </div>
      )}

    </div>
  );
};

export default AlertItem;