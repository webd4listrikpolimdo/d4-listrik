"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { HiOutlineUser, HiOutlineUserGroup, HiOutlinePhoto, HiOutlineArrowRightOnRectangle, HiOutlineBookOpen, HiOutlineDocumentText } from "react-icons/hi2";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">Memuat...</div>;

  const isAdmin = user.role === "admin";

  const adminLinks = [
    { href: "/dashboard/admin", label: "Dashboard", icon: HiOutlineUser },
    { href: "/dashboard/admin/dosen", label: "Manajemen Dosen", icon: HiOutlineUserGroup },
    { href: "/dashboard/admin/galeri", label: "Manajemen Galeri", icon: HiOutlinePhoto },
    { href: "/dashboard/admin/kurikulum", label: "Manajemen Kurikulum", icon: HiOutlineBookOpen },
    { href: "/dashboard/admin/karya", label: "Manajemen Karya", icon: HiOutlineDocumentText },
  ];

  const dosenLinks = [
    { href: "/dashboard/dosen", label: "Profil Saya", icon: HiOutlineUser },
    { href: "/dashboard/dosen/karya", label: "Karya & Kontribusi", icon: HiOutlineUserGroup }, // You can change icon later
  ];

  const links = isAdmin ? adminLinks : dosenLinks;

  const isActive = (href: string) => pathname === href || (pathname.startsWith(href) && href !== `/dashboard/${user.role}`);

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 px-4 md:px-6 mb-8 md:mb-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-24">
          <div className="mb-6 px-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              {isAdmin ? "Administrator" : "Dosen"}
            </p>
            <h2 className="text-lg font-bold text-primary-950 truncate">
              {user.name}
            </h2>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive(link.href) ? "text-primary-600" : "text-gray-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <HiOutlineArrowRightOnRectangle className="w-5 h-5 text-red-500" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
