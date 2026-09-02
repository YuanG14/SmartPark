import { Link } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { Card } from "../components/ui/Card";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg items-center">
        <Card className="w-full p-8 text-center sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <LockKeyhole className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold text-neutral-950">Registration comes later</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-500">
            Supabase authentication has been removed from this development build. Use one of the demo profiles while the rest of SmartPark is being developed.
          </p>
          <Link
            to="/login"
            className="mt-7 inline-flex h-10 w-full items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Go to demo access
          </Link>
        </Card>
      </div>
    </main>
  );
}
