import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, Car, LayoutDashboard, LogOut, MapPin, Search, Settings, CalendarDays, ShieldCheck } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Tooltip } from "../ui/Tooltip";
import { useAuth } from "../../features/auth/AuthProvider";
import { useNotifications } from "../../hooks/useNotifications";

const baseLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/parking", label: "Parking", icon: MapPin },
  { to: "/reservations", label: "Reservations", icon: CalendarDays },
  { to: "/vehicles", label: "Vehicles", icon: Car },
];

const roleLabel = { user: "Parking user", staff: "Parking staff", admin: "Admin" };

export function Navbar() {
  const { profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const links = profile?.role === "admin"
    ? [...baseLinks, { to: "/admin", label: "Admin", icon: ShieldCheck }]
    : baseLinks;

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5 text-lg font-semibold tracking-tight text-neutral-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-sm font-black text-white shadow-sm shadow-brand-200">P</span>
          <span className="hidden sm:block">SmartPark</span>
        </Link>

        <nav aria-label="Main" className="hidden gap-1 rounded-full bg-neutral-100 p-1 md:flex">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-neutral-950 text-white shadow-sm"
                      : "text-neutral-600 hover:bg-white hover:text-neutral-950"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Tooltip label="Search">
            <button aria-label="Search" className="rounded-full p-2.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950">
              <Search className="h-4 w-4" />
            </button>
          </Tooltip>
          <Tooltip label="Notifications">
            <Link
              to="/notifications"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
              className="relative rounded-full p-2.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span aria-hidden="true" className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </Tooltip>
          <Tooltip label="Settings">
            <button aria-label="Settings" className="hidden rounded-full p-2.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 sm:inline-flex">
              <Settings className="h-4 w-4" />
            </button>
          </Tooltip>

          {profile && (
            <Link to="/profile" className="ml-1 flex items-center gap-2 rounded-full border border-transparent px-1.5 py-1 transition hover:border-neutral-200 hover:bg-neutral-50 sm:ml-2">
              <Avatar name={profile.full_name} size="sm" />
              <div className="hidden min-w-0 text-left lg:block">
                <p className="max-w-32 truncate text-sm font-semibold leading-tight text-neutral-950">{profile.full_name}</p>
                <p className="text-xs leading-tight text-neutral-500">{roleLabel[profile.role]}</p>
              </div>
            </Link>
          )}

          <Tooltip label="Log out">
            <button aria-label="Log out" onClick={handleSignOut} className="rounded-full p-2.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950">
              <LogOut className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      <nav aria-label="Mobile navigation" className="flex gap-1 overflow-x-auto border-t border-neutral-100 px-4 py-2 md:hidden">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isActive ? "bg-neutral-950 text-white" : "text-neutral-600"
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
