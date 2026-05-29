"use client";

import { useEffect } from "react";
import { useData } from "@/context/DataContext";
import DosenProfile from "@/components/dosen/DosenProfile";

export default function DosenDetailClient({ id }: { id: string }) {
  const { dosenList, ensureDosenLoaded, isDosenLoaded } = useData();

  useEffect(() => { ensureDosenLoaded(); }, [ensureDosenLoaded]);
  
  const index = dosenList.findIndex((d) => d.id === id);
  const dosen = dosenList[index];

  if (!isDosenLoaded) return (
    <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Loading Dosen...</div>
  );

  if (!dosen) return (
    <div className="text-center py-20 text-gray-500 font-medium">Data dosen tidak ditemukan.</div>
  );

  return <DosenProfile dosen={dosen} index={index} />;
}
