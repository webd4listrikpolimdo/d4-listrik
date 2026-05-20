"use client";

import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import {
  HiArrowLeft,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineBookOpen,
  HiOutlineBuildingOffice,
  HiOutlineIdentification,
  HiOutlineLink,
  HiOutlineUserGroup
} from "react-icons/hi2";
import { GaleriItem } from "@/data/galeri";
import { cachedFetch } from "@/lib/fetchCache";

const jenisLabels: Record<string, string> = {
  publikasi: "Publikasi",
  penelitian: "Penelitian",
  pengabdian: "Pengabdian",
  bukuAjar: "Buku Ajar",
};

const jenisGradients: Record<string, string> = {
  publikasi: "from-blue-600 to-indigo-700",
  penelitian: "from-blue-600 to-indigo-700",
  pengabdian: "from-blue-600 to-indigo-700",
  bukuAjar: "from-blue-600 to-indigo-700",
};

function PersonBadgeList({ title, persons, ownerPerson }: { title: string, persons: any, ownerPerson?: { id: string, nama: string } | null }) {
  if (!persons) return null;
  const pList = Array.isArray(persons) ? persons : [persons];
  if (pList.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {pList.map((p: any, i: number) => {
          let linkedId = p.id;
          if (!linkedId && ownerPerson) {
            const cleanPName = p.nama.split(",")[0].trim().toLowerCase();
            const cleanOwnerName = ownerPerson.nama.split(",")[0].trim().toLowerCase();
            if (cleanPName === cleanOwnerName || cleanOwnerName.includes(cleanPName) || cleanPName.includes(cleanOwnerName)) {
              linkedId = ownerPerson.id;
            }
          }

          return linkedId ? (
            <Link key={i} href={`/dosen/${linkedId}`} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium text-sm transition-colors shadow-sm">
              <HiOutlineUserGroup className="mr-1.5" />
              {p.nama}
            </Link>
          ) : (
            <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 font-medium text-sm border border-gray-200">
              {p.nama}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="mt-0.5 text-primary-500">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-gray-800 font-medium mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function GaleriDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { galeriList, ensureGaleriLoaded } = useData();
  const [karyaItem, setKaryaItem] = useState<GaleriItem | null>(null);
  const [originalKarya, setOriginalKarya] = useState<any | null>(null);
  const [isKaryaLoading, setIsKaryaLoading] = useState(false);

  useEffect(() => { ensureGaleriLoaded(); }, [ensureGaleriLoaded]);

  // If it's a karya-prefixed ID, fetch from karya API
  const isKarya = id.startsWith("karya-");
  const realKaryaId = isKarya ? id.replace("karya-", "") : null;

  useEffect(() => {
    if (!isKarya || !realKaryaId) return;
    setIsKaryaLoading(true);
    cachedFetch<any[]>("/api/karya")
      .then((karyaList) => {
        if (!karyaList) return;
        const k = karyaList.find((karya: any) => karya.id === realKaryaId);
        if (k) {
          setOriginalKarya(k);
          setKaryaItem({
            id: `karya-${k.id}`,
            judul: k.judul,
            deskripsi: k.deskripsi || "",
            tanggal: `${k.tahun}-01-01`,
            kategori: "tridharma",
            foto: k.foto_urls || [],
            warna: jenisGradients[k.jenis] || "from-blue-600 to-indigo-700",
            subLabel: jenisLabels[k.jenis] || k.jenis,
          });
        }
      })
      .catch((err) => console.error("Failed to fetch karya detail", err))
      .finally(() => setIsKaryaLoading(false));
  }, [isKarya, realKaryaId]);

  const item = isKarya ? karyaItem : galeriList.find((g) => g.id === id);

  if (isKaryaLoading) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-gray-500 font-medium">Memuat data...</p>
    </div>
  );

  if (!item) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Galeri Tidak Ditemukan</h1>
      <Link href="/galeri" className="text-primary-600 hover:underline">Kembali ke galeri</Link>
    </div>
  );

  const dateObj = new Date(item.tanggal);
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj);

  const categoryLabel = item.kategori === "fasilitas"
    ? "Fasilitas"
    : item.subLabel
      ? `Tridharma · ${item.subLabel}`
      : "Tridharma";

  const renderKaryaDetails = () => {
    if (!originalKarya) return null;
    const k = originalKarya;
    const md = k.metadata || {};
    const meta = (key: string) => md[key] ?? k[key];
    const ownerPerson = k.dosen ? { id: k.dosen.id, nama: k.dosen.nama } : null;

    const isSamePerson = (p: any) => {
      if (!ownerPerson) return false;
      if (p.id === ownerPerson.id) return true;
      const cleanPName = p.nama.split(",")[0].trim().toLowerCase();
      const cleanOwnerName = ownerPerson.nama.split(",")[0].trim().toLowerCase();
      return cleanPName === cleanOwnerName || cleanOwnerName.includes(cleanPName) || cleanPName.includes(cleanOwnerName);
    };

    const ensureOwnerInList = (persons: any): any[] => {
      const list = persons ? (Array.isArray(persons) ? [...persons] : [persons]) : [];
      if (!ownerPerson) return list;
      const ownerIndex = list.findIndex(isSamePerson);
      if (ownerIndex !== -1) {
        list[ownerIndex] = { ...list[ownerIndex], id: ownerPerson.id, nama: ownerPerson.nama };
      } else {
        list.unshift(ownerPerson);
      }
      return list;
    };

    const ensureOwnerAsSingle = (person: any): any => {
      if (!ownerPerson) return person;
      if (!person) return ownerPerson;
      if (isSamePerson(person)) return { ...person, id: ownerPerson.id, nama: ownerPerson.nama };
      return person.id ? person : ownerPerson;
    };

    switch (k.jenis) {
      case "publikasi": {
        const jurnal = meta("jurnal");
        const link = meta("link");
        const penulis = ensureOwnerInList(meta("penulis"));
        return (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <InfoItem icon={HiOutlineBookOpen} label="Jurnal / Konferensi" value={jurnal} />
            <PersonBadgeList title="Penulis" persons={penulis} ownerPerson={ownerPerson} />
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors mt-2 text-primary-600">
                <HiOutlineLink className="w-4 h-4" /> Kunjungi Tautan Publikasi
              </a>
            )}
          </div>
        );
      }
      case "penelitian": {
        const sumberDana = meta("sumberDana");
        const ketua = ensureOwnerAsSingle(meta("ketua"));
        const anggota = meta("anggota");
        return (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <InfoItem icon={HiOutlineBuildingOffice} label="Sumber Dana" value={sumberDana} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PersonBadgeList title="Ketua Peneliti" persons={ketua} ownerPerson={ownerPerson} />
              {anggota && anggota.length > 0 && <PersonBadgeList title="Anggota" persons={anggota} ownerPerson={ownerPerson} />}
            </div>
          </div>
        );
      }
      case "pengabdian": {
        const mitra = meta("mitra");
        const ketua = ensureOwnerAsSingle(meta("ketua"));
        const anggota = meta("anggota");
        return (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <InfoItem icon={HiOutlineBuildingOffice} label="Mitra" value={mitra} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PersonBadgeList title="Ketua" persons={ketua} ownerPerson={ownerPerson} />
              {anggota && anggota.length > 0 && <PersonBadgeList title="Anggota" persons={anggota} ownerPerson={ownerPerson} />}
            </div>
          </div>
        );
      }
      case "bukuAjar": {
        const penerbit = meta("penerbit");
        const isbn = meta("isbn");
        const penulis = ensureOwnerInList(meta("penulis"));
        return (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <InfoItem icon={HiOutlineBuildingOffice} label="Penerbit" value={penerbit} />
            <InfoItem icon={HiOutlineIdentification} label="ISBN" value={isbn} />
            <PersonBadgeList title="Penulis" persons={penulis} ownerPerson={ownerPerson} />
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      <section className={`bg-gradient-to-br ${item.warna} pt-24 pb-8 min-h-[250px]`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8" />
      </section>

      <section className="py-10 -mt-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up">
            <Link
              href="/galeri"
              className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white font-medium mb-6 transition-colors drop-shadow-md"
            >
              <HiArrowLeft className="w-4 h-4" />
              Kembali ke Galeri
            </Link>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              {/* Header */}
              <div className="p-6 sm:p-10 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider">
                    <HiOutlineTag className="w-3.5 h-3.5" />
                    {categoryLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                    <HiOutlineCalendar className="w-3.5 h-3.5" />
                    {formattedDate}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-6">
                  {item.judul}
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                  {item.deskripsi}
                </p>

                {/* Render Karya Specific Details (Authors, Links, Publishers etc) */}
                {isKarya && renderKaryaDetails()}
              </div>

              {/* Photos Gallery */}
              <div className="p-6 sm:p-10 bg-white">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Dokumentasi Terkait</h2>

                {(!item.foto || item.foto.length === 0) ? (
                  <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <img
                      src="/images/default.svg"
                      alt="Placeholder"
                      className="w-full h-auto object-cover aspect-video opacity-20"
                    />
                  </div>
                ) : (
                  <div className={`grid gap-6 ${item.foto.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {item.foto.map((url, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                        <img
                          src={url}
                          alt={`${item.judul} - Foto ${idx + 1}`}
                          className="w-full h-auto object-cover aspect-video group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
