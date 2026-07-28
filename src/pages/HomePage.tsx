import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        SmartPark
      </h1>
      <p className="mt-3 text-neutral-500">
        Intelligent Parking Reservation &amp; Management System.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/dashboard">
          <Button>View dashboard preview</Button>
        </Link>
        <Link to="/styleguide">
          <Button variant="secondary">View design system</Button>
        </Link>
      </div>
    </div>
  );
}
