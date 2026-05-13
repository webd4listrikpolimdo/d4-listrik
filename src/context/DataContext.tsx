"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Dosen } from "@/data/dosen";
import { GaleriItem } from "@/data/galeri";

interface DataContextType {
  dosenList: Dosen[];
  galeriList: GaleriItem[];
  isLoading: boolean;

  // Dosen Actions
  addDosen: (dosen: Dosen, password?: string) => Promise<void>;
  updateDosen: (id: string, updatedDosen: Dosen) => Promise<void>;
  deleteDosen: (id: string) => Promise<void>;

  // Galeri Actions
  addGaleri: (item: GaleriItem) => Promise<void>;
  updateGaleri: (id: string, updatedItem: GaleriItem) => Promise<void>;
  deleteGaleri: (id: string) => Promise<void>;

  // Refresh
  refreshDosen: () => Promise<void>;
  refreshGaleri: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * Transform raw DB dosen row (with flat karya[]) into the nested Dosen shape
 * expected by existing components.
 */
function transformDosenFromApi(raw: any): Dosen {
  const karya = raw.karya || [];

  const groupedKarya = {
    publikasi: karya.filter((k: any) => k.jenis === "publikasi").map(mapKarya),
    penelitian: karya.filter((k: any) => k.jenis === "penelitian").map(mapKarya),
    pengabdian: karya.filter((k: any) => k.jenis === "pengabdian").map(mapKarya),
    bukuAjar: karya.filter((k: any) => k.jenis === "bukuAjar").map(mapKarya),
    hki: karya.filter((k: any) => k.jenis === "hki").map(mapKarya),
    sertifikasi: karya.filter((k: any) => k.jenis === "sertifikasi").map(mapKarya),
  };

  return {
    id: raw.id,
    nama: raw.nama,
    nidn: raw.nidn,
    foto: raw.foto_url || null,
    jabatan: raw.jabatan || undefined,
    pangkat: raw.pangkat || undefined,
    email: raw.email || undefined,
    telepon: raw.telepon || undefined,
    programStudi: raw.program_studi || undefined,
    pendidikanTerakhir: raw.pendidikan_terakhir || undefined,
    bidangKeahlian: raw.bidang_keahlian || [],
    karya: groupedKarya,
  };
}

function mapKarya(k: any) {
  return {
    id: k.id,
    jenis: k.jenis,
    judul: k.judul,
    tahun: k.tahun,
    deskripsi: k.deskripsi || undefined,
    metadata: k.metadata || undefined,
    ...(k.metadata || {}),
  };
}

/**
 * Transform raw DB galeri row into the GaleriItem shape.
 */
function transformGaleriFromApi(raw: any): GaleriItem {
  return {
    id: raw.id,
    judul: raw.judul,
    deskripsi: raw.deskripsi || "",
    tanggal: raw.tanggal,
    kategori: raw.kategori,
    foto: raw.foto_urls || [],
    warna: "from-blue-500 to-indigo-600", // Default gradient fallback
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [galeriList, setGaleriList] = useState<GaleriItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshDosen = useCallback(async () => {
    try {
      // Fetch all dosen
      const res = await fetch("/api/dosen");
      if (!res.ok) throw new Error("Failed to fetch dosen");
      const dosenRows = await res.json();

      // For each dosen, fetch their karya
      const dosenWithKarya: Dosen[] = await Promise.all(
        dosenRows.map(async (d: any) => {
          const karyaRes = await fetch(`/api/karya?dosen_id=${d.id}`);
          const karya = karyaRes.ok ? await karyaRes.json() : [];
          return transformDosenFromApi({ ...d, karya });
        })
      );

      // Cross-reference: if a karya's metadata links other dosen,
      // add that karya to those dosen's lists too.
      const dosenMap = new Map(dosenWithKarya.map(d => [d.id, d]));

      for (const owner of dosenWithKarya) {
        const allOwnerKarya = Object.values(owner.karya).flat();
        for (const k of allOwnerKarya) {
          const meta = (k as any).metadata;
          if (!meta) continue;
          // Collect all person-link IDs from metadata
          const linkedIds = new Set<string>();
          for (const val of Object.values(meta)) {
            if (Array.isArray(val)) {
              for (const p of val) {
                if (p && typeof p === "object" && p.id) linkedIds.add(p.id);
              }
            } else if (val && typeof val === "object" && (val as any).id) {
              linkedIds.add((val as any).id);
            }
          }
          // Remove the owner themselves
          linkedIds.delete(owner.id);
          // Add karya to each linked dosen's list (if not already present)
          for (const linkedId of linkedIds) {
            const target = dosenMap.get(linkedId);
            if (!target) continue;
            const jenis = (k as any).jenis as string;
            const cat = jenis as keyof Dosen["karya"];
            if (!target.karya[cat]) continue;
            const existing = target.karya[cat] as any[];
            if (!existing.some((e: any) => e.id === (k as any).id)) {
              existing.push(k);
            }
          }
        }
      }

      setDosenList(dosenWithKarya);
    } catch (e) {
      console.error("Failed to fetch dosen", e);
    }
  }, []);

  const refreshGaleri = useCallback(async () => {
    try {
      const res = await fetch("/api/galeri");
      if (!res.ok) throw new Error("Failed to fetch galeri");
      const data = await res.json();
      setGaleriList(data.map(transformGaleriFromApi));
    } catch (e) {
      console.error("Failed to fetch galeri", e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([refreshDosen(), refreshGaleri()]);
      setIsLoading(false);
    };
    init();
  }, [refreshDosen, refreshGaleri]);

  // --- Dosen Actions ---
  const addDosen = async (dosen: Dosen, password?: string) => {
    const res = await fetch("/api/dosen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: dosen.nama,
        nidn: dosen.nidn,
        foto_url: dosen.foto || null,
        jabatan: dosen.jabatan || null,
        pangkat: dosen.pangkat || null,
        email: dosen.email || null,
        password: password || null,
        telepon: dosen.telepon || null,
        bidang_keahlian: dosen.bidangKeahlian || [],
        program_studi: dosen.programStudi || "D4 Teknik Listrik",
        pendidikan_terakhir: dosen.pendidikanTerakhir || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to add dosen");
    }
    await refreshDosen();
  };

  const updateDosen = async (id: string, updatedDosen: Dosen) => {
    const res = await fetch(`/api/dosen/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: updatedDosen.nama,
        foto_url: updatedDosen.foto || null,
        jabatan: updatedDosen.jabatan || null,
        pangkat: updatedDosen.pangkat || null,
        email: updatedDosen.email || null,
        telepon: updatedDosen.telepon || null,
        bidang_keahlian: updatedDosen.bidangKeahlian || [],
        program_studi: updatedDosen.programStudi || "D4 Teknik Listrik",
        pendidikan_terakhir: updatedDosen.pendidikanTerakhir || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update dosen");
    }
    await refreshDosen();
  };

  const deleteDosen = async (id: string) => {
    const res = await fetch(`/api/dosen/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete dosen");
    }
    await refreshDosen();
  };

  // --- Galeri Actions ---
  const addGaleri = async (item: GaleriItem) => {
    const res = await fetch("/api/galeri", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        judul: item.judul,
        deskripsi: item.deskripsi || null,
        tanggal: item.tanggal,
        kategori: item.kategori,
        foto_urls: item.foto || [],
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to add galeri");
    }
    await refreshGaleri();
  };

  const updateGaleri = async (id: string, updatedItem: GaleriItem) => {
    const res = await fetch(`/api/galeri/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        judul: updatedItem.judul,
        deskripsi: updatedItem.deskripsi || null,
        tanggal: updatedItem.tanggal,
        kategori: updatedItem.kategori,
        foto_urls: updatedItem.foto || [],
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update galeri");
    }
    await refreshGaleri();
  };

  const deleteGaleri = async (id: string) => {
    const res = await fetch(`/api/galeri/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete galeri");
    }
    await refreshGaleri();
  };

  return (
    <DataContext.Provider value={{
      dosenList, galeriList, isLoading,
      addDosen, updateDosen, deleteDosen,
      addGaleri, updateGaleri, deleteGaleri,
      refreshDosen, refreshGaleri,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
