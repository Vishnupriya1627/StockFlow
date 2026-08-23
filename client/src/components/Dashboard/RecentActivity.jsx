import React from "react";

const statusStyles = {
  warning: {
    badge: "bg-[#f9b223]/[0.08] border-[#f9b223]/20 text-[#f9b223]",
    dot: "bg-[#f9b223]",
  },
  success: {
    badge: "bg-[#67c987]/[0.07] border-[#67c987]/20 text-[#67c987]",
    dot: "bg-[#67c987]",
  },
  info: {
    badge: "bg-[#5eb5c4]/[0.07] border-[#5eb5c4]/20 text-[#6dbdca]",
    dot: "bg-[#6dbdca]",
  },
  danger: {
    badge: "bg-[#e08484]/[0.07] border-[#e08484]/20 text-[#e08484]",
    dot: "bg-[#e08484]",
  },
};

const RecentActivity = ({ items }) => {
  return (
    <div className="relative bg-[#061d21] rounded-xl border border-[#15434a] p-5 shadow-[0_15px_40px_rgba(0,0,0,.15)] overflow-hidden">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#15434a]" />

      {/* Subtle background glow */}
      <div className="absolute right-[-100px] bottom-[-100px] w-64 h-64 rounded-full bg-[#013f46]/20 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-[8px] tracking-[0.17em] text-[#52777c] uppercase">
            SYSTEM EVENTS
          </p>

          <h3 className="text-sm font-semibold text-[#dce8e9] mt-1.5">
            Recent Activity
          </h3>
        </div>

        <div className="flex items-center gap-2 border border-[#123a40] bg-[#082328] rounded-full px-2.5 py-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#67c987] opacity-50 animate-ping" />

            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#67c987]" />
          </span>

          <span className="font-mono text-[7px] tracking-[0.12em] text-[#78999e]">
            LIVE
          </span>
        </div>
      </div>

      {/* Activity list */}
      <ul className="relative divide-y divide-[#123a40]">
        {items.map((item, index) => {
          const style = statusStyles[item.status] || statusStyles.info;

          return (
            <li
              key={item.id}
              className="group flex items-center justify-between gap-5 py-4 first:pt-2 last:pb-2"
            >
              {/* Left side */}
              <div className="flex items-center gap-4 min-w-0">
                {/* Event indicator */}
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-[#082328] border border-[#15434a] flex items-center justify-center">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                    />
                  </div>

                  {/* Timeline connector */}
                  {index !== items.length - 1 && (
                    <div className="absolute left-1/2 top-7 w-px h-[calc(100%+16px)] bg-[#123a40]" />
                  )}
                </div>

                {/* Type + message */}
                <div className="min-w-0">
                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      text-[8px]
                      font-mono
                      tracking-[0.08em]
                      uppercase
                      px-2
                      py-1
                      rounded-md
                      border
                      whitespace-nowrap
                      ${style.badge}
                    `}
                  >
                    <span className={`w-1 h-1 rounded-full ${style.dot}`} />

                    {item.type.replace("-", " ")}
                  </span>

                  <p className="text-sm text-[#a9bec1] mt-2 truncate group-hover:text-[#dce8e9] transition-colors">
                    {item.message}
                  </p>
                </div>
              </div>

              {/* Time */}
              <span className="flex-shrink-0 font-mono text-[8px] tracking-[0.06em] text-[#405f64] whitespace-nowrap">
                {item.time}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="relative mt-5 pt-3 border-t border-[#123a40] flex items-center justify-between">
        <span className="font-mono text-[7px] tracking-[0.13em] text-[#405f64]">
          EVENT STREAM
        </span>

        <div className="flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-[#67c987]" />

          <span className="font-mono text-[7px] tracking-[0.1em] text-[#52777c]">
            MONITORING
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;