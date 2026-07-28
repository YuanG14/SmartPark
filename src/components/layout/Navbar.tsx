import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, LogOut, Search, Settings } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Tooltip } from "../ui/Tooltip";
import { useAuth } from "../../features/auth/AuthProvider";
import { useNotifications } from "../../hooks/useNotifications";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/parking", label: "Parking" },
  { to: "/reservations", label: "Reservations" },
  { to: "/vehicles", label: "Vehicles" },
];

const roleLabel = { user: "Parking user", staff: "Parking staff", admin: "Admin" };

export function Navbar() {
  const { profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link to="/dashboard" className="text-lg font-semibold tracking-tight text-neutral-900">
          SmartPark
        </Link>

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
            <Link
              to="/notifications"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
              className="relative rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"
                />
              )}
            </Link>
          </Tooltip>
          <Tooltip label="Settings">
            <button
              aria-label="Settings"
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Settings className="h-4 w-4" />
            </button>
          </Tooltip>

          {profile && (
            <Link to="/profile" className="ml-2 flex items-center gap-2">
              <Avatar name={profile.full_name} size="sm" />
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight text-neutral-900">
                  {profile.full_name}
                </p>
                <p className="text-xs leading-tight text-neutral-500">
                  {roleLabel[profile.role]}
                </p>
              </div>
            </Link>
          )}

          <Tooltip label="Log out">
            <button
              aria-label="Log out"
              onClick={handleSignOut}
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
