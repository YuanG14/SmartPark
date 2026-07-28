import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ParkingPage from "./pages/ParkingPage";
import ReservationsPage from "./pages/ReservationsPage";
import VehiclesPage from "./pages/VehiclesPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import StyleguidePage from "./pages/StyleguidePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      {/* Public routes — no nav bar, no auth required. */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/styleguide"
        element={
          <Layout>
            <StyleguidePage />
          </Layout>
        }
      />

      {/* Everything below requires a session. */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parking"
        element={
          <ProtectedRoute>
            <Layout>
              <ParkingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations"
        element={
          <ProtectedRoute>
            <Layout>
              <ReservationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute>
            <Layout>
              <VehiclesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <NotificationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
