import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const StockTrendChart = ({ data }) => {
  return (
    <div className="relative bg-[#061d21] rounded-xl border border-[#15434a] p-5 shadow-[0_15px_40px_rgba(0,0,0,.15)] h-full overflow-hidden">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#15434a]" />

      {/* Subtle glow */}
      <div className="absolute right-[-80px] top-[-80px] w-48 h-48 rounded-full bg-[#f9b223]/[0.035] blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-5">
        <div>
          <p className="font-mono text-[8px] tracking-[0.17em] text-[#52777c] uppercase">
            STOCK MOVEMENT
          </p>

          <h3 className="text-sm font-semibold text-[#dce8e9] mt-1.5">
            Stock Level Trend
          </h3>
        </div>

        <div className="flex items-center gap-2 border border-[#123a40] bg-[#082328] rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f9b223]" />

          <span className="font-mono text-[7px] tracking-[0.12em] text-[#78999e]">
            7 DAYS
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 5,
              left: -15,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="stockFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#f9b223"
                  stopOpacity={0.22}
                />

                <stop
                  offset="70%"
                  stopColor="#f9b223"
                  stopOpacity={0.06}
                />

                <stop
                  offset="100%"
                  stopColor="#f9b223"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 5"
              vertical={false}
              stroke="#123a40"
              strokeOpacity={0.8}
            />

            <XAxis
              dataKey="day"
              tick={{
                fontSize: 9,
                fill: "#52777c",
                fontFamily: "monospace",
              }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />

            <YAxis
              tick={{
                fontSize: 9,
                fill: "#52777c",
                fontFamily: "monospace",
              }}
              axisLine={false}
              tickLine={false}
              width={35}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#061d21",
                borderRadius: 10,
                border: "1px solid #24606a",
                fontSize: 11,
                color: "#dce8e9",
                boxShadow: "0 15px 35px rgba(0,0,0,.35)",
              }}
              labelStyle={{
                color: "#78999e",
                fontSize: 9,
                fontFamily: "monospace",
                marginBottom: 4,
              }}
              itemStyle={{
                color: "#f9b223",
                fontSize: 11,
              }}
            />

            <Area
              type="monotone"
              dataKey="stock"
              stroke="#f9b223"
              strokeWidth={2}
              fill="url(#stockFill)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#f9b223",
                stroke: "#061d21",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="relative mt-2 pt-3 border-t border-[#123a40] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f9b223]" />

          <span className="font-mono text-[7px] tracking-[0.12em] text-[#52777c]">
            STOCK LEVEL
          </span>
        </div>

        <span className="font-mono text-[7px] tracking-[0.1em] text-[#405f64]">
          LIVE DATA
        </span>
      </div>
    </div>
  );
};

export default StockTrendChart;