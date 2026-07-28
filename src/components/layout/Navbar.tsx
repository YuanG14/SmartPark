import { NavLink } from "react-router-dom";
import { Bell, Search, Settings } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Tooltip } from "../ui/Tooltip";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/parking", label: "Parking" },
  { to: "/reservations", label: "Reservations" },
  { to: "/vehicles", label: "Vehicles" },
];

// Mock signed-in user for Phase 2 — replaced by real auth state in Phase 4.
const mockUser = { name: "Danny Hong", role: "Parking user" };

export function Navbar() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <span className="text-lg font-semibold tracking-tight text-neutral-900">
          SmartPark
        </span>

        <nav aria-label="Main" className="flex gap-1 rounded-full bg-neutral-100 p-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:text-neutral-900"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Tooltip label="Search">
            <button
              aria-label="Search"
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Search className="h-4 w-4" />
            </button>
          </Tooltip>
          <Tooltip label="Notifications">
            <button
              aria-label="Notifications"
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Bell className="h-4 w-4" />
            </button>
          </Tooltip>
          <Tooltip label="Settings">
            <button
              aria-label="Settings"
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Settings className="h-4 w-4" />
            </button>
          </Tooltip>
          <div className="ml-2 flex items-center gap-2">
            <Avatar name={mockUser.name} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-neutral-900">
                {mockUser.name}
              </p>
              <p className="text-xs leading-tight text-neutral-500">{mockUser.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
