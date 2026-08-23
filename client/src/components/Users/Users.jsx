import React, { useState, useMemo } from "react";
import { Search, UserPlus, ChevronDown } from "lucide-react";
import StatusPill from "../common/StatusPill";
import RoleBadge from "./RoleBadge";
import { users, roleFilters, userStatusFilters } from "../../data/mockUsers";

const Users = () => {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesQuery =
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());
      const matchesRole = role === "All" || u.role === role;
      const matchesStatus = status === "All" || u.status === status;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, role, status]);

  return (
    <div className="space-y-8">
      {/* ============================================================
          HEADER
      ============================================================ */}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 border border-[#17444a] bg-[#061e22]/75 backdrop-blur-sm rounded-full px-3 py-1.5 mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#f9b223] animate-pulse" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f9b223]" />
            </span>

            <span className="font-mono text-[9px] tracking-[0.16em] text-[#a8c4c8]">
              ACCESS CONTROL
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#f4faf9]">
            Users
          </h1>
          <p className="text-sm text-[#8eafb3] mt-1">
            {filteredUsers.length} of {users.length} team members
          </p>
        </div>

        <button
          disabled
          title="Coming soon — will connect once backend is ready"
          className="flex items-center gap-2 bg-[#f4faf9]/[0.06] text-[#54777c] border border-[#17444a] text-sm font-medium px-5 py-2.5 rounded-xl cursor-not-allowed self-start sm:self-auto"
        >
          <UserPlus size={16} />
          Invite User
        </button>
      </div>

      {/* ============================================================
          FILTERS
      ============================================================ */}

      <section className="relative border border-[#15434a] bg-[#061d21]/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#013f46]/10 via-transparent to-[#f9b223]/[0.015]" />

        <div className="relative p-5 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#668b90]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full text-sm border border-[#17444a] rounded-xl pl-11 pr-4 py-2.5 outline-none bg-[#04181c] text-[#d8e8e9] placeholder:text-[#54777c] focus:border-[#f9b223]/60 transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="appearance-none text-sm border border-[#17444a] rounded-xl px-4 pr-10 py-2.5 outline-none bg-[#04181c] text-[#d8e8e9] focus:border-[#f9b223]/60 transition-colors"
            >
              {roleFilters.map((r) => (
                <option key={r} value={r} className="bg-[#061d21] text-white">
                  {r === "All" ? "All Roles" : r}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6e9095]"
            />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none text-sm border border-[#17444a] rounded-xl px-4 pr-10 py-2.5 outline-none bg-[#04181c] text-[#d8e8e9] focus:border-[#f9b223]/60 transition-colors"
            >
              {userStatusFilters.map((s) => (
                <option key={s} value={s} className="bg-[#061d21] text-white">
                  {s === "All" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6e9095]"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          TABLE
      ============================================================ */}

      <div className="relative border border-[#15434a] bg-[#061d21]/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#013f46]/10 via-transparent to-[#f9b223]/[0.015]" />

        {filteredUsers.length > 0 ? (
          <table className="relative w-full">
            <thead>
              <tr className="border-b border-[#123a40] bg-[#04181c]/60">
                <th className="text-left px-6 py-4 font-mono text-[9px] tracking-[0.14em] text-[#668b90]">
                  USER
                </th>
                <th className="text-left px-6 py-4 font-mono text-[9px] tracking-[0.14em] text-[#668b90]">
                  ROLE
                </th>
                <th className="text-left px-6 py-4 font-mono text-[9px] tracking-[0.14em] text-[#668b90]">
                  STATUS
                </th>
                <th className="text-left px-6 py-4 font-mono text-[9px] tracking-[0.14em] text-[#668b90]">
                  LAST ACTIVE
                </th>
                <th className="text-right px-6 py-4 font-mono text-[9px] tracking-[0.14em] text-[#668b90]">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#123a40]">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#f4faf9]/[0.03] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#013f46] border border-[#1d525a] text-[#f9b223] flex items-center justify-center text-sm font-medium shrink-0">
                        {user.avatarInitial}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#d8e8e9]">{user.name}</p>
                        <p className="text-xs text-[#668b90]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-[#8eafb3]">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      disabled
                      title="Coming soon — will connect once backend is ready"
                      className="text-xs font-medium text-[#54777c] cursor-not-allowed"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="relative py-16 text-center">
            <p className="font-mono text-[9px] tracking-[0.18em] text-[#668b90] mb-3">
              USER STATUS
            </p>
            <p className="text-sm text-[#8eafb3]">No users match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;