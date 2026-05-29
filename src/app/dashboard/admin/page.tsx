"use client";

import { HiOutlineUserGroup, HiOutlinePhoto, HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineTrophy, HiOutlineChartBarSquare } from "react-icons/hi2";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cachedFetch } from "@/lib/fetchCache";

interface Stats {
  total_mahasiswa_aktif: number;
  total_lulusan: number;
  total_dosen: number;
  total_galeri: number;
  total_mata_kuliah: number;
  active_semester?: { id: string; tahun_akademik: string; jenis: string } | null;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [mataKuliahCount, setMataKuliahCount] = useState<number>(0);

  const fetchStats = async () => {
    try {
      const statData = await cachedFetch<any>("/api/statistik");
      if (statData) {
        setStats(statData);
        setMataKuliahCount(statData.total_mata_kuliah || 0);
      }
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total Dosen",
      value: stats?.total_dosen ?? "—",
      link: "/dashboard/admin/staf",
      linkLabel: "Kelola Staf",
      icon: HiOutlineUserGroup,
      bg: "bg-primary-50",
      border: "border-primary-100",
      textColor: "text-primary-600",
      valueColor: "text-primary-950",
      iconBg: "bg-primary-200",
      iconColor: "text-primary-700",
      linkColor: "text-primary-700",
    },
    {
      label: "Mahasiswa Aktif",
      value: stats?.total_mahasiswa_aktif ?? "—",
      link: "/dashboard/admin/statistik",
      linkLabel: "Kelola Statistik",
      icon: HiOutlineAcademicCap,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      textColor: "text-emerald-600",
      valueColor: "text-emerald-950",
      iconBg: "bg-emerald-200",
      iconColor: "text-emerald-700",
      linkColor: "text-emerald-700",
    },
    {
      label: "Total Mata Kuliah",
      value: mataKuliahCount || "—",
      icon: HiOutlineBookOpen,
      bg: "bg-amber-50",
      border: "border-amber-100",
      textColor: "text-amber-600",
      valueColor: "text-amber-950",
      iconBg: "bg-amber-200",
      iconColor: "text-amber-700",
    },
    {
      label: "Total Lulusan",
      value: stats?.total_lulusan ?? "—",
      link: "/dashboard/admin/statistik",
      linkLabel: "Kelola Statistik",
      icon: HiOutlineTrophy,
      bg: "bg-violet-50",
      border: "border-violet-100",
      textColor: "text-violet-600",
      valueColor: "text-violet-950",
      iconBg: "bg-violet-200",
      iconColor: "text-violet-700",
      linkColor: "text-violet-700",
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
          <p className="text-gray-500 text-sm">Selamat datang di panel administrasi.</p>
        </div>
        <Link
          href="/dashboard/admin/statistik"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <HiOutlineChartBarSquare className="w-5 h-5" /> Kelola Statistik
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`${card.bg} rounded-2xl p-6 border ${card.border} flex items-center justify-between shadow-sm hover:shadow-md transition-shadow`}
            >
              <div>
                <p className={`${card.textColor} text-sm font-bold uppercase tracking-wider mb-1`}>
                  {card.label}
                </p>
                <h3 className={`text-3xl font-black ${card.valueColor}`}>
                  {typeof card.value === "number" ? card.value.toLocaleString("id-ID") : card.value}
                </h3>
                {card.link && (
                  <Link
                    href={card.link}
                    className={`${card.linkColor} text-sm font-medium hover:underline mt-2 inline-block`}
                  >
                    {card.linkLabel} &rarr;
                  </Link>
                )}
              </div>
              <div className={`w-16 h-16 rounded-full ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>
                <Icon className="w-8 h-8" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
