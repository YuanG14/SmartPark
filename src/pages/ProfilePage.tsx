import { FormEvent, useState } from "react";
import { useAuth } from "../features/auth/AuthProvider";
import { Card, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { useToast } from "../components/ui/Toast";

const roleLabel = { user: "Parking user", staff: "Parking staff", admin: "Admin" };

export default function ProfilePage() {
  const { profile, updateLocalProfile } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await updateLocalProfile({ full_name: fullName, phone });
    setSaving(false);
    showToast("Profile updated locally", "success");
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar name={profile.full_name} size="lg" />
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{profile.full_name}</h1>
          <Badge tone="info">{roleLabel[profile.role]}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader title="Edit profile" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button type="submit" isLoading={saving} className="self-start">
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
