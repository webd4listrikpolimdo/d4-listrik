"use client";

import { useState, useRef, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { GaleriItem } from "@/data/galeri";
import Modal from "@/components/universal/Modal";
import ConfirmDialog from "@/components/universal/ConfirmDialog";
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineArrowUpTray, HiOutlineXMark } from "react-icons/hi2";
import Image from "next/image";

const jenisLabels: Record<string, string> = {
  publikasi: "Publikasi",
  penelitian: "Penelitian",
  pengabdian: "Pengabdian",
  bukuAjar: "Buku Ajar",
};

export default function AdminGaleriPage() {
  const { galeriList, addGaleri, updateGaleri, deleteGaleri, ensureGaleriLoaded } = useData();
  const [karyaList, setKaryaList] = useState<any[]>([]);

  const fetchKarya = async () => {
    try {
      const res = await fetch("/api/karya");
      if (res.ok) {
        const data = await res.json();
        setKaryaList(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch karya", err);
    }
  };

  useEffect(() => {
    ensureGaleriLoaded();
    fetchKarya();
  }, [ensureGaleriLoaded]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<GaleriItem>>({});
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const tridharmaJenis = ["publikasi", "penelitian", "pengabdian", "bukuAjar"];
  const virtualItems: GaleriItem[] = karyaList
    .filter((k) => tridharmaJenis.includes(k.jenis))
    .map((k) => ({
      id: `karya-${k.id}`,
      judul: k.judul,
      deskripsi: k.deskripsi || "",
      tanggal: `${k.tahun}-01-01`,
      kategori: "tridharma" as const,
      foto: k.foto_urls || [],
      warna: "from-blue-600 to-indigo-700",
      subLabel: jenisLabels[k.jenis] || k.jenis,
    }));

  const mergedList = [...galeriList, ...virtualItems].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ id: `galeri-${Date.now()}`, judul: "", deskripsi: "", kategori: "fasilitas", tanggal: new Date().toISOString().split("T")[0], foto: [], warna: "from-blue-500 to-indigo-600" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GaleriItem) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (deletingId) {
      try {
        if (deletingId.startsWith("karya-")) {
          const karyaId = deletingId.replace("karya-", "");
          const res = await fetch(`/api/karya/${karyaId}`, { method: "DELETE" });
          if (!res.ok) {
            const err = await res.json();
            alert(err.error || "Gagal menghapus data Tridarma");
            return;
          }
          await fetchKarya();
        } else {
          await deleteGaleri(deletingId);
        }
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Gagal menghapus");
      }
    }
    setConfirmOpen(false);
    setDeletingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        if (editingId.startsWith("karya-")) {
          const karyaId = editingId.replace("karya-", "");
          const year = new Date(formData.tanggal || "").getFullYear() || new Date().getFullYear();
          const res = await fetch(`/api/karya/${karyaId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              judul: formData.judul,
              deskripsi: formData.deskripsi || null,
              tahun: year,
              foto_urls: formData.foto || [],
            }),
          });
          if (!res.ok) {
            const err = await res.json();
            alert(err.error || "Gagal mengubah data Tridarma");
            return;
          }
          await fetchKarya();
        } else {
          await updateGaleri(editingId, formData as GaleriItem);
        }
      } else {
        await addGaleri(formData as GaleriItem);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Terjadi kesalahan");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (editingId) {
        if (editingId.startsWith("karya-")) {
          const karyaId = editingId.replace("karya-", "");
          fd.append("karya_id", karyaId);
          fd.append("table", "karya");
          const res = await fetch("/api/upload/karya", { method: "POST", body: fd });
          if (res.ok) {
            const data = await res.json();
            setFormData(prev => ({ ...prev, foto: [...(prev.foto || []), data.url] }));
          }
        } else {
          fd.append("galeri_id", editingId);
          const res = await fetch("/api/upload/galeri", { method: "POST", body: fd });
          if (res.ok) {
            const data = await res.json();
            setFormData(prev => ({ ...prev, foto: [...(prev.foto || []), data.url] }));
          }
        }
      } else {
        const res = await fetch("/api/upload/galeri", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, foto: [...(prev.foto || []), data.url] }));
        }
      }
    } catch (err) { console.error("Upload failed", err); }
    finally { setIsUploading(false); if (imageInputRef.current) imageInputRef.current.value = ""; }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({ ...prev, foto: (prev.foto || []).filter((_, i) => i !== index) }));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Galeri</h1>
          <p className="text-gray-500 text-sm">Kelola dokumentasi fasilitas dan tridharma.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors shadow-sm"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Tambah Galeri
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Judul</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mergedList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div>{item.judul}</div>
                    {item.subLabel && (
                      <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {item.subLabel}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 capitalize">
                    {item.kategori === "tridharma" ? "Tridharma" : "Fasilitas"}
                  </td>
                  <td className="px-6 py-4">{item.tanggal}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors"
                      title="Edit"
                    >
                      <HiOutlinePencilSquare className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {mergedList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    Belum ada data galeri.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Galeri" : "Tambah Galeri Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Galeri</label>
            <input
              type="text"
              required
              value={formData.judul || ""}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Lengkap</label>
            <textarea
              required
              rows={3}
              value={formData.deskripsi || ""}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                required
                disabled={!!editingId?.startsWith("karya-")}
                value={formData.kategori || "fasilitas"}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value as "fasilitas" | "tridharma" })}
                className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  editingId?.startsWith("karya-") ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-gray-50"
                }`}
              >
                <option value="fasilitas">Fasilitas</option>
                <option value="tridharma">
                  {formData.subLabel ? `Tridharma (${formData.subLabel})` : "Tridharma Perguruan Tinggi"}
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kegiatan</label>
              <input
                type="date"
                required
                value={formData.tanggal || ""}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          
          {/* Image upload section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto Galeri</label>
            {(formData.foto && formData.foto.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.foto.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                    <Image src={url} alt={`Foto ${idx + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleRemoveImage(idx)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <HiOutlineXMark className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3">
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <button type="button" onClick={() => imageInputRef.current?.click()} disabled={isUploading}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50">
                <HiOutlineArrowUpTray className="w-3.5 h-3.5" />
                {isUploading ? "Mengupload..." : "Tambah Foto"}
              </button>
              <span className="text-xs text-gray-400">{formData.foto?.length || 0} foto</span>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 transition-colors"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onConfirm={executeDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        title="Hapus Galeri"
        message="Apakah Anda yakin ingin menghapus galeri ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="danger"
      />
    </div>
  );
}
