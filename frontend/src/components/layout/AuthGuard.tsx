"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { FlaskConical } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, user, fetchMe } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    if (!user) {
      fetchMe();
    }
  }, [token, user, fetchMe, router]);

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <FlaskConical size={24} className="text-clinical-400 animate-pulse" />
      </div>
    );
  }

  return <>{children}</>;
}
