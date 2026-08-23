import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const COLORS = ["#013f46", "#0d5c66", "#1a7a86", "#f9b223", "#fbc94d"];

const CategoryBreakdownChart = ({ data }) => {
  return (
    <div className="relative bg-[#061d21] rounded-xl border border-[#15434a] p-5 shadow-[0_15px_40px_rgba(0,0,0,.15)] h-full overflow-hidden">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#15434a]" />

      {/* Subtle background glow */}
      <div className="absolute left-[-80px] bottom-[-80px] w-48 h-48 rounded-full bg-[#013f46]/30 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-5">
        <div>
          <p className="font-mono text-[8px] tracking-[0.17em] text-[#52777c] uppercase">
            INVENTORY DISTRIBUTION
          </p>

          <h3 className="text-sm font-semibold text-[#dce8e9] mt-1.5">
            Inventory by Category
          </h3>
        </div>

        <div className="flex items-center gap-2 border border-[#123a40] bg-[#082328] rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f9b223]" />

          <span className="font-mono text-[7px] tracking-[0.12em] text-[#78999e]">
            CURRENT
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              left: 5,
              right: 10,
              top: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 5"
              horizontal={false}
              stroke="#123a40"
              strokeOpacity={0.8}
            />

            <XAxis
              type="number"
              tick={{
                fontSize: 9,
                fill: "#52777c",
                fontFamily: "monospace",
              }}
              axisLine={false}
              tickLine={false}
              dy={5}
            />

            <YAxis
              type="category"
              dataKey="category"
              tick={{
                fontSize: 9,
                fill: "#78999e",
                fontFamily: "monospace",
              }}
              axisLine={false}
              tickLine={false}
              width={90}
            />

            <Tooltip
              cursor={{
                fill: "#123a40",
                opacity: 0.25,
              }}
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

            <Bar
              dataKey="value"
              radius={[0, 5, 5, 0]}
              barSize={18}
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="relative mt-2 pt-3 border-t border-[#123a40] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f9b223]" />

          <span className="font-mono text-[7px] tracking-[0.12em] text-[#52777c]">
            CATEGORY LOAD
          </span>
        </div>

        <span className="font-mono text-[7px] tracking-[0.1em] text-[#405f64]">
          INVENTORY DATA
        </span>
      </div>
    </div>
  );
};

export default CategoryBreakdownChart;