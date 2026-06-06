"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cachedFetch } from "@/lib/fetchCache";
import IconRenderer from "@/lib/icons";
import DevTeamModal from "@/components/universal/DevTeamModal";

const quickLinks = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kurikulum", label: "Kurikulum" },
  { href: "/fasilitas", label: "Fasilitas" },
  { href: "/staf", label: "Staf" },
  { href: "/galeri", label: "Galeri" },
];

interface FooterData {
  deskripsi: string | null;
  copyright: string | null;
}

interface KontakItem {
  id: string;
  nama: string;
  nilai: string;
  link: string | null;
  icon: string | null;
  urutan: number;
}

interface LogoData {
  file_url: string;
  alt_text: string | null;
}

interface ProdiInfoData {
  nama: string;
  nama_alternatif: string | null;
  nama_kampus: string;
}

export default function Footer() {
  const [footer, setFooter] = useState<FooterData | null>(null);
  const [kontak, setKontak] = useState<KontakItem[]>([]);
  const [logo, setLogo] = useState<LogoData | null>(null);
  const [prodiInfo, setProdiInfo] = useState<ProdiInfoData | null>(null);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchFooterConfig = async () => {
      try {
        const [footerRes, logoRes, prodiRes, configRes] = await Promise.all([
          cachedFetch<any>("/api/footer"),
          cachedFetch<any>("/api/logo"),
          cachedFetch<any>("/api/prodi-info"),
          cachedFetch<any>("/api/config?section=kontak"),
        ]);
        if (footerRes) setFooter(footerRes);
        if (logoRes) setLogo(logoRes);
        if (prodiRes) setProdiInfo(prodiRes);
        if (configRes?.kontak) setKontak(configRes.kontak);
      } catch (e) {
        console.error("Failed to load footer config", e);
      }
    };
    fetchFooterConfig();
  }, []);

  const isDashboard = pathname?.startsWith("/dashboard");

  const socialMediaNames = ["instagram", "facebook", "twitter", "x", "linkedin", "tiktok", "youtube", "github", "whatsapp"];
  const isSocialMedia = (item: KontakItem) => {
    const nameLower = item.nama.toLowerCase();
    const iconLower = (item.icon || "").toLowerCase();
    return (
      socialMediaNames.some(sm => nameLower.includes(sm)) ||
      socialMediaNames.some(sm => iconLower.includes(sm))
    );
  };

  const socialMediaKontak = kontak.filter(isSocialMedia);
  const regularKontak = kontak.filter(item => !isSocialMedia(item));

  if (isDashboard) {
    return (
      <>
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-primary-950/95 backdrop-blur-sm border-t border-primary-900 text-white h-16 flex flex-col items-center justify-center gap-0.5 shadow-lg">
          <p className="text-center text-primary-400 text-[10px] sm:text-xs">
            {footer?.copyright ? (
              `© ${new Date().getFullYear()} - ${footer.copyright.replace(/^(©\s*(\d{4})?\s*|(\d{4})\s*)/i, "").trim()}`
            ) : (
              `© ${new Date().getFullYear()}`
            )}
          </p>
          <button
            onClick={() => setIsDevModalOpen(true)}
            className="text-center text-primary-400 hover:text-accent-400 text-[10px] sm:text-xs transition-colors duration-200 cursor-pointer font-medium"
          >
            Tim Pengembang
          </button>
        </footer>

        <DevTeamModal isOpen={isDevModalOpen} onClose={() => setIsDevModalOpen(false)} />
      </>
    );
  }

  return (
    <footer className="bg-primary-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg p-0.5 shadow-lg overflow-hidden">
                <img
                  src={logo?.file_url || "/images/logo-polimdo.png"}
                  alt={logo?.alt_text || "Logo Campus"}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {prodiInfo?.nama || ""}
                </h3>
                <p className="text-primary-300 text-xs">
                  {prodiInfo?.nama_kampus || ""}
                </p>
              </div>
            </div>
            <p className="text-primary-300 text-sm leading-relaxed">
              {footer?.deskripsi || ""}
            </p>
            {socialMediaKontak.length > 0 && (
              <div className="flex items-center gap-4 mt-6">
                {socialMediaKontak.map((item) => (
                  <a
                    key={item.id}
                    href={item.link || item.nilai}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-300 hover:text-accent-400 hover:scale-110 transition-all duration-200"
                    title={item.nama}
                  >
                    {item.icon && <IconRenderer name={item.icon} className="w-5 h-5" />}
                  </a>
                ))}
              </div>
            )}
          </div>
          {/* Quick Links */}
          <div className="flex flex-col items-center text-center">
            <div>
              <h4 className="font-semibold text-accent-400 mb-4 text-sm uppercase tracking-wider text-center">
                Tautan Cepat
              </h4>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-center">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-primary-300 hover:text-white text-sm transition-colors duration-200 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-end text-right">
            <h4 className="font-semibold text-accent-400 mb-4 text-sm uppercase tracking-wider">
              Kontak
            </h4>
            <div className="space-y-3 text-sm text-primary-300 w-full flex flex-col items-end">
              {regularKontak.length > 0 ? (
                regularKontak.map((item) => {
                  const content = (
                    <div className="flex items-start gap-2 flex-row-reverse text-right">
                      {item.icon && <IconRenderer name={item.icon} className="mt-0.5 flex-shrink-0" />}
                      <span className="whitespace-pre-line">{item.nilai}</span>
                    </div>
                  );

                  return (
                    <div key={item.id} className="w-full flex justify-end">
                      {item.link ? (
                        <a
                          href={item.link}
                          className="hover:text-white transition-colors duration-200 block"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-primary-400">Tidak ada kontak tersedia.</p>
              )}
            </div>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-10 pt-6 border-t border-primary-800 flex flex-col items-center gap-2">
          <p className="text-center text-primary-400 text-xs">
            {footer?.copyright ? (
              `© ${new Date().getFullYear()} - ${footer.copyright.replace(/^(©\s*(\d{4})?\s*|(\d{4})\s*)/i, "").trim()}`
            ) : (
              `© ${new Date().getFullYear()}`
            )}
          </p>
          <button
            onClick={() => setIsDevModalOpen(true)}
            className="text-center text-primary-400 hover:text-accent-400 text-xs transition-colors duration-200 cursor-pointer font-medium"
          >
            Tim Pengembang
          </button>
        </div>
      </div>

      <DevTeamModal isOpen={isDevModalOpen} onClose={() => setIsDevModalOpen(false)} />
    </footer>
  );
}
