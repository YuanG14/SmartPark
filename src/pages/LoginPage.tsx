import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Car, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../features/auth/AuthProvider";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import type { UserRole } from "../types/database";

export default function LoginPage() {
  const { signInAsDemo, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submittingRole, setSubmittingRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!session) return;
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";
    navigate(from, { replace: true });
  }, [session, location.state, navigate]);

  async function continueAs(role: "user" | "admin") {
    setSubmittingRole(role);
    await signInAsDemo(role);
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? (role === "admin" ? "/admin" : "/dashboard");
    navigate(from, { replace: true });
  }

  if (session) return null;

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-xl shadow-neutral-200/50 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden bg-neutral-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-lg font-black">P</span>
                <span className="text-xl font-bold">SmartPark</span>
              </div>
              <h1 className="mt-16 max-w-md text-4xl font-semibold leading-tight">
                Park smarter without setting up authentication yet.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-neutral-400">
                This development build uses local demo access so you can keep building the parking, reservation, payment, and admin workflows first.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Sparkles className="h-4 w-4 text-brand-400" />
              Supabase Auth is intentionally disabled for now.
            </div>
          </section>

          <section className="p-7 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                Development access
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-neutral-950">Enter SmartPark</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Real sign-in and registration are postponed. Choose a demo role to continue testing the application.
              </p>

              <div className="mt-8 grid gap-4">
                <Card className="border-neutral-200 p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Car className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-neutral-950">Parking user</h3>
                      <p className="mt-1 text-sm leading-5 text-neutral-500">Test parking, vehicles, reservations, and notifications.</p>
                      <Button
                        className="mt-4 w-full"
                        isLoading={submittingRole === "user"}
                        disabled={submittingRole !== null}
                        onClick={() => continueAs("user")}
                      >
                        Continue as user
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="border-neutral-200 p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-neutral-950">Administrator</h3>
                      <p className="mt-1 text-sm leading-5 text-neutral-500">Test reservation approvals, rejections, and payment management.</p>
                      <Button
                        variant="secondary"
                        className="mt-4 w-full"
                        isLoading={submittingRole === "admin"}
                        disabled={submittingRole !== null}
                        onClick={() => continueAs("admin")}
                      >
                        Continue as admin
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
                <strong>Development only:</strong> this is not secure authentication and must be replaced before production deployment.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
