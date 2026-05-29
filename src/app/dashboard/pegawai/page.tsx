"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineAcademicCap,
  HiOutlineTrophy,
  HiOutlineCalendar,
  HiOutlineChartBarSquare,
} from "react-icons/hi2";

interface ActiveSemester {
  id: string;
  tahun_akademik: string;
  jenis: "ganjil" | "genap";
  is_aktif: boolean;
}

export default function PegawaiDashboardPage() {
  const [totalActive, setTotalActive] = useState<number>(0);
  const [totalGraduates, setTotalGraduates] = useState<number>(0);
  const [activeSem, setActiveSem] = useState<ActiveSemester | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/statistik").then((r) => r.json());
        if (res) {
          setTotalActive(res.total_mahasiswa_aktif || 0);
          setTotalGraduates(res.total_lulusan || 0);
          if (res.active_semester) setActiveSem(res.active_semester);
        }
      } catch (e) {
        console.error("Failed to load statistics", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium animate-pulse">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Pegawai</h1>
          <p className="text-gray-500 text-sm">
            Kelola statistik mahasiswa, semester akademik, dan parameter program studi.
          </p>
        </div>
        <Link
          href="/dashboard/pegawai/statistik"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <HiOutlineChartBarSquare className="w-5 h-5" /> Kelola Statistik
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-primary-700 text-xs font-bold uppercase tracking-wider mb-1">
              Mahasiswa Aktif
            </p>
            <h3 className="text-3xl font-black text-primary-950">
              {totalActive.toLocaleString("id-ID")}
            </h3>
            <p className="text-[11px] text-primary-600 mt-1">
              Semester:{" "}
              {activeSem
                ? `${activeSem.jenis === "ganjil" ? "Ganjil" : "Genap"} ${activeSem.tahun_akademik}`
                : "Belum diatur"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center text-primary-700">
            <HiOutlineAcademicCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-violet-50 rounded-2xl p-6 border border-violet-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-violet-700 text-xs font-bold uppercase tracking-wider mb-1">
              Total Lulusan (Alumni)
            </p>
            <h3 className="text-3xl font-black text-violet-950">
              {totalGraduates.toLocaleString("id-ID")}
            </h3>
            <p className="text-[11px] text-violet-600 mt-1">Akumulasi counter lulusan</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-violet-200 flex items-center justify-center text-violet-700">
            <HiOutlineTrophy className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              Semester Aktif
            </p>
            <h3 className="text-xl font-bold text-emerald-950 mt-1">
              {activeSem ? `${activeSem.jenis === "ganjil" ? "Ganjil" : "Genap"}` : "—"}
            </h3>
            <p className="text-xs text-emerald-600 font-mono">
              TA: {activeSem?.tahun_akademik || "—"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
            <HiOutlineCalendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Akses Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/dashboard/pegawai/statistik"
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-primary-200 hover:bg-primary-50/50 transition-all group"
          >
            <HiOutlineChartBarSquare className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
              Manajemen Statistik
            </span>
          </Link>
          <Link
            href="/dashboard/pegawai/kurikulum"
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-primary-200 hover:bg-primary-50/50 transition-all group"
          >
            <HiOutlineAcademicCap className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
              Manajemen Kurikulum
            </span>
          </Link>
          <Link
            href="/dashboard/pegawai/config"
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-primary-200 hover:bg-primary-50/50 transition-all group"
          >
            <HiOutlineCalendar className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
              Konfigurasi Website
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
