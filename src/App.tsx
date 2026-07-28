import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ParkingPage from "./pages/ParkingPage";
import ReservationsPage from "./pages/ReservationsPage";
import VehiclesPage from "./pages/VehiclesPage";
import StyleguidePage from "./pages/StyleguidePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      {/* Login stays outside the app Layout — no nav bar on the sign-in screen. */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomePage />} />
      <Route
        path="/dashboard"
        element={
          <Layout>
            <DashboardPage />
          </Layout>
        }
      />
      <Route
        path="/parking"
        element={
          <Layout>
            <ParkingPage />
          </Layout>
        }
      />
      <Route
        path="/reservations"
        element={
          <Layout>
            <ReservationsPage />
          </Layout>
        }
      />
      <Route
        path="/vehicles"
        element={
          <Layout>
            <VehiclesPage />
          </Layout>
        }
      />
      <Route
        path="/styleguide"
        element={
          <Layout>
            <StyleguidePage />
          </Layout>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
