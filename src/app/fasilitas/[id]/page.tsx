"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FasilitasDetailPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/fasilitas");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
