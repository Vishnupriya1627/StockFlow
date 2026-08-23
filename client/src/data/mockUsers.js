// mockUsers.js
// Swap for a real API call (GET /api/users) once backend is live.

export const users = [
  {
    id: "USR-001",
    name: "Vishnupriya",
    email: "vishnupriya@stockflow.com",
    role: "Admin",
    status: "active",
    lastActive: "Just now",
    avatarInitial: "V",
  },
  {
    id: "USR-002",
    name: "Rithika Reddy",
    email: "rithika.reddy@stockflow.com",
    role: "Manager",
    status: "active",
    lastActive: "2 hrs ago",
    avatarInitial: "K",
  },
  {
    id: "USR-003",
    name: "Ananya Rao",
    email: "ananya.rao@stockflow.com",
    role: "Staff",
    status: "active",
    lastActive: "1 day ago",
    avatarInitial: "A",
  },
  {
    id: "USR-004",
    name: "Ravi Teja",
    email: "ravi.teja@stockflow.com",
    role: "Staff",
    status: "inactive",
    lastActive: "2 weeks ago",
    avatarInitial: "R",
  },
  {
    id: "USR-005",
    name: "Divya Prakash",
    email: "divya.prakash@stockflow.com",
    role: "Manager",
    status: "active",
    lastActive: "5 hrs ago",
    avatarInitial: "D",
  },
];

export const roleFilters = ["All", "Admin", "Manager", "Staff"];
export const userStatusFilters = ["All", "active", "inactive"];