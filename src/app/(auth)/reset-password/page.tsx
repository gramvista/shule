import { AuthShell } from "@/components/auth/auth-shell";
import { TextField } from "@/components/auth/auth-fields";
import { updatePassword } from "../actions";

export default function ResetPasswordPage() {
  return <AuthShell title="Choose a new password" description="Use a password you do not use for any other service."><form action={updatePassword} className="space-y-4"><TextField label="New password" name="password" type="password" autoComplete="new-password" /><button type="submit" className="focus-ring min-h-12 w-full rounded-xl bg-[#0b63f3] px-5 font-bold text-white">Update password</button></form></AuthShell>;
}

