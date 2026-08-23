import React from "react";

const roleConfig = {
  Admin: "bg-[#013f46] text-white",
  Manager: "bg-[#f9b223]/15 text-[#a06a00]",
  Staff: "bg-gray-100 text-gray-600",
};

const RoleBadge = ({ role }) => (
  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${roleConfig[role] || roleConfig.Staff}`}>
    {role}
  </span>
);

export default RoleBadge;