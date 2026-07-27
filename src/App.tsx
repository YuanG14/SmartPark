import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

// This is a bare-bones shell for Phase 1 only.
// The real navbar, design system, and layout are built in Phase 2.
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <nav className="mx-auto flex max-w-4xl items-center gap-6 px-6 py-4 text-sm">
          <Link to="/" className="font-semibold text-neutral-900">
            SmartPark
          </Link>
          <Link to="/dashboard" className="text-neutral-500 hover:text-neutral-900">
            Dashboard
          </Link>
          <Link to="/login" className="ml-auto text-neutral-500 hover:text-neutral-900">
            Log in
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
