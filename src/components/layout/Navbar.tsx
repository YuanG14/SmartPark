import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Car,
  LayoutDashboard,
  LogOut,
  MapPin,
  Search,
  Settings,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
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

const actionButtonClass =
  "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-neutral-500 transition-all duration-200 hover:border-neutral-200 hover:bg-white hover:text-neutral-950 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

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
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          className="flex shrink-0 items-center gap-2.5 text-lg font-semibold tracking-tight text-neutral-950"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-brand-500 text-sm font-black text-white shadow-sm shadow-brand-200/70">
            P
          </span>
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

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-neutral-200/80 bg-neutral-50/90 p-1 shadow-sm shadow-neutral-200/30">
            <Tooltip label="Find parking">
              <Link to="/parking" aria-label="Find parking" className={actionButtonClass}>
                <Search className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </Link>
            </Tooltip>

            <Tooltip label={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "Notifications"}>
              <Link
                to="/notifications"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                className={actionButtonClass}
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
                {unreadCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold leading-none text-white ring-[3px] ring-white shadow-sm"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            </Tooltip>

            <Tooltip label="Settings">
              <Link
                to="/profile"
                aria-label="Settings"
                className={`${actionButtonClass} hidden sm:inline-flex`}
              >
                <Settings className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </Link>
            </Tooltip>
          </div>

          {profile && (
            <Link
              to="/profile"
              className="group ml-0.5 flex items-center gap-2.5 rounded-2xl border border-transparent px-2 py-1.5 transition-all hover:border-neutral-200 hover:bg-neutral-50 sm:ml-1"
            >
              <Avatar name={profile.full_name} size="sm" />
              <div className="hidden min-w-0 text-left lg:block">
                <p className="max-w-32 truncate text-sm font-semibold leading-tight text-neutral-950 group-hover:text-brand-700">
                  {profile.full_name}
                </p>
                <p className="mt-0.5 text-[11px] font-medium leading-tight text-neutral-500">
                  {roleLabel[profile.role]}
                </p>
              </div>
            </Link>
          )}

          <Tooltip label="Log out">
            <button
              aria-label="Log out"
              onClick={handleSignOut}
              className={`${actionButtonClass} hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600`}
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.9} />
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
                `inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isActive ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100"
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
