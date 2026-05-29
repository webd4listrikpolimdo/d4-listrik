"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import { Dosen } from "@/types/dosen";
import { Pegawai } from "@/types/pegawai";
import Modal from "@/components/universal/Modal";
import ConfirmDialog from "@/components/universal/ConfirmDialog";
import { 
  HiOutlinePlus, 
  HiOutlinePencilSquare, 
  HiOutlineTrash, 
  HiOutlineArrowUpTray, 
  HiOutlineEye, 
  HiOutlineEyeSlash, 
  HiOutlineUserGroup, 
  HiOutlineUser, 
  HiOutlineMagnifyingGlass 
} from "react-icons/hi2";
import Image from "next/image";
import { maskNidn, maskNip, maskPhone } from "@/lib/masks";
import { useNotification } from "@/context/NotificationContext";
import TablePagination from "@/components/universal/TablePagination";

type TabType = "dosen" | "pegawai";

export default function AdminStafPage() {
  const router = useRouter();
  const { showSuccess, showError } = useNotification();
  const { 
    dosenList, addDosen, updateDosen, deleteDosen, ensureDosenLoaded, isDosenLoaded,
    pegawaiList, addPegawai, updatePegawai, deletePegawai, ensurePegawaiLoaded, isPegawaiLoaded
  } = useData();

  const [activeTab, setActiveTab] = useState<TabType>("dosen");
  const [searchQuery, setSearchQuery] = useState("");
  const [dosenPage, setDosenPage] = useState(1);
  const [dosenPageSize, setDosenPageSize] = useState(10);
  const [pegawaiPage, setPegawaiPage] = useState(1);
  const [pegawaiPageSize, setPegawaiPageSize] = useState(10);

  // Lazy load datasets depending on the active tab
  useEffect(() => {
    if (activeTab === "dosen") {
      ensureDosenLoaded();
    } else if (activeTab === "pegawai") {
      ensurePegawaiLoaded();
    }
  }, [activeTab, ensureDosenLoaded, ensurePegawaiLoaded]);

  // Modals & Forms State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // We can use a combined form state or cast depending on active tab
  const [dosenForm, setDosenForm] = useState<Partial<Dosen>>({});
  const [pegawaiForm, setPegawaiForm] = useState<Partial<Pegawai>>({});
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidangInput, setBidangInput] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Delete Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Open Handlers
  const handleOpenAdd = () => {
    setEditingId(null);
    setPassword("");
    setShowPassword(false);
    
    if (activeTab === "dosen") {
      setDosenForm({ nama: "", nidn: "", email: "", bidangKeahlian: [] });
      setBidangInput("");
    } else {
      setPegawaiForm({ nama: "", nip: "", email: "", telepon: "", pendidikan_terakhir: "" });
    }
    
    setIsModalOpen(true);
  };

  const handleOpenEditDosen = (dosen: Dosen) => {
    setEditingId(dosen.id);
    setDosenForm(dosen);
    setBidangInput(dosen.bidangKeahlian?.join(", ") || "");
    setPassword("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditPegawai = (pegawai: Pegawai) => {
    setEditingId(pegawai.id);
    setPegawaiForm(pegawai);
    setPassword("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleDeleteOpen = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!deletingId) return;
    try {
      if (activeTab === "dosen") {
        await deleteDosen(deletingId);
        showSuccess("Dosen berhasil dihapus!");
      } else {
        await deletePegawai(deletingId);
        showSuccess("Pegawai berhasil dihapus!");
      }
      router.refresh();
    } catch (err: any) {
      showError(err.message || `Gagal menghapus ${activeTab}`);
    } finally {
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === "dosen") {
        if (editingId) {
          if (password && password.length < 6) {
            showError("Password harus minimal 6 karakter.");
            setIsSubmitting(false);
            return;
          }
          await updateDosen(editingId, dosenForm as Dosen, password || undefined);
          setIsModalOpen(false);
          showSuccess("Data dosen berhasil diperbarui!");
        } else {
          if (!dosenForm.email) {
            showError("Email wajib diisi untuk membuat akun dosen.");
            setIsSubmitting(false);
            return;
          }
          if (!password) {
            showError("Password wajib diisi untuk membuat akun dosen.");
            setIsSubmitting(false);
            return;
          }
          if (password.length < 6) {
            showError("Password harus minimal 6 karakter.");
            setIsSubmitting(false);
            return;
          }
          await addDosen(dosenForm as Dosen, password);
          setIsModalOpen(false);
          showSuccess(`Akun dosen berhasil dibuat untuk ${dosenForm.email}!`);
        }
      } else {
        if (editingId) {
          if (password && password.length < 6) {
            showError("Password harus minimal 6 karakter.");
            setIsSubmitting(false);
            return;
          }
          await updatePegawai(editingId, pegawaiForm, password || undefined);
          setIsModalOpen(false);
          showSuccess("Data pegawai berhasil diperbarui!");
        } else {
          if (!pegawaiForm.email) {
            showError("Email wajib diisi untuk membuat akun pegawai.");
            setIsSubmitting(false);
            return;
          }
          if (!password) {
            showError("Password wajib diisi untuk membuat akun pegawai.");
            setIsSubmitting(false);
            return;
          }
          if (password.length < 6) {
            showError("Password harus minimal 6 karakter.");
            setIsSubmitting(false);
            return;
          }
          await addPegawai(pegawaiForm as Omit<Pegawai, "id">, password);
          setIsModalOpen(false);
          showSuccess(`Akun pegawai berhasil dibuat untuk ${pegawaiForm.email}!`);
        }
      }
      router.refresh();
    } catch (err: any) {
      showError(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (activeTab === "dosen" && !dosenForm.id) return;
    if (activeTab === "pegawai" && !pegawaiForm.id) return;

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      
      if (activeTab === "dosen") {
        fd.append("dosen_id", dosenForm.id!);
        const res = await fetch("/api/upload/dosen", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          setDosenForm(prev => ({ ...prev, foto: data.url }));
          showSuccess("Foto dosen berhasil diperbarui!");
          router.refresh();
        } else {
          throw new Error("Gagal mengunggah foto.");
        }
      } else {
        fd.append("pegawai_id", pegawaiForm.id!);
        const res = await fetch("/api/upload/pegawai", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          setPegawaiForm(prev => ({ ...prev, foto_url: data.url }));
          showSuccess("Foto pegawai berhasil diperbarui!");
          router.refresh();
        } else {
          throw new Error("Gagal mengunggah foto.");
        }
      }
    } catch (err: any) {
      showError(err.message || "Gagal mengunggah foto.");
    } finally {
      setIsUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  // Search filter datasets
  const filteredDosen = dosenList.filter(d => 
    d.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.nidn && d.nidn.includes(searchQuery)) ||
    (d.email && d.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const totalDosenEntries = filteredDosen.length;
  const totalDosenPages = Math.ceil(totalDosenEntries / dosenPageSize);
  const paginatedDosen = filteredDosen.slice(
    (dosenPage - 1) * dosenPageSize,
    dosenPage * dosenPageSize
  );

  const filteredPegawai = pegawaiList.filter(p =>
    p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.nip && p.nip.includes(searchQuery)) ||
    (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const totalPegawaiEntries = filteredPegawai.length;
  const totalPegawaiPages = Math.ceil(totalPegawaiEntries / pegawaiPageSize);
  const paginatedPegawai = filteredPegawai.slice(
    (pegawaiPage - 1) * pegawaiPageSize,
    pegawaiPage * pegawaiPageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Staf</h1>
          <p className="text-gray-500 text-sm">Kelola data dosen dan pegawai/staf administrasi program studi.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm cursor-pointer"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Tambah {activeTab === "dosen" ? "Dosen" : "Pegawai"}
        </button>
      </div>

      {/* Tabs & Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => { setActiveTab("dosen"); setSearchQuery(""); setDosenPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "dosen"
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <HiOutlineUserGroup className="w-4 h-4" />
            Dosen {isDosenLoaded && `(${dosenList.length})`}
          </button>
          <button
            onClick={() => { setActiveTab("pegawai"); setSearchQuery(""); setPegawaiPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "pegawai"
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <HiOutlineUser className="w-4 h-4" />
            Pegawai {isPegawaiLoaded && `(${pegawaiList.length})`}
          </button>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
            <HiOutlineMagnifyingGlass className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder={`Cari nama, ${activeTab === "dosen" ? "NIDN" : "NIP"}, atau email...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDosenPage(1);
              setPegawaiPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Tables depending on active tab */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "dosen" ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Nama Dosen</th>
                  <th className="px-6 py-4">NIDN</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Jabatan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!isDosenLoaded ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium animate-pulse">
                      Loading Dosen...
                    </td>
                  </tr>
                ) : (
                  <>
                    {paginatedDosen.map((dosen) => (
                      <tr key={dosen.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {dosen.nama}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{dosen.nidn}</td>
                        <td className="px-6 py-4">{dosen.email || "-"}</td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-500">{dosen.jabatan || "-"}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditDosen(dosen)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <HiOutlinePencilSquare className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOpen(dosen.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredDosen.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          {searchQuery ? "Pencarian tidak ditemukan." : "Belum ada data dosen."}
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Nama Pegawai</th>
                  <th className="px-6 py-4">NIP</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Pendidikan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!isPegawaiLoaded ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium animate-pulse">
                      Loading Pegawai...
                    </td>
                  </tr>
                ) : (
                  <>
                    {paginatedPegawai.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {p.nama}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{p.nip || "-"}</td>
                        <td className="px-6 py-4">{p.email || "-"}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{p.pendidikan_terakhir || "-"}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditPegawai(p)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <HiOutlinePencilSquare className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOpen(p.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredPegawai.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          {searchQuery ? "Pencarian tidak ditemukan." : "Belum ada data pegawai."}
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          )}
        </div>
        {activeTab === "dosen" ? (
          <TablePagination
            currentPage={dosenPage}
            totalPages={totalDosenPages}
            totalEntries={totalDosenEntries}
            pageSize={dosenPageSize}
            onPageChange={setDosenPage}
            onPageSizeChange={size => { setDosenPageSize(size); setDosenPage(1); }}
          />
        ) : (
          <TablePagination
            currentPage={pegawaiPage}
            totalPages={totalPegawaiPages}
            totalEntries={totalPegawaiEntries}
            pageSize={pegawaiPageSize}
            onPageChange={setPegawaiPage}
            onPageSizeChange={size => { setPegawaiPageSize(size); setPegawaiPage(1); }}
          />
        )}
      </div>

      {/* Unified Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={
          editingId 
            ? `Edit ${activeTab === "dosen" ? "Dosen" : "Pegawai"}` 
            : `Tambah ${activeTab === "dosen" ? "Dosen Baru" : "Pegawai Baru"}`
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Photo upload section (Only for existing records) */}
          {editingId && (
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 shrink-0">
                <img 
                  src={
                    activeTab === "dosen" 
                      ? (dosenForm.foto || "/images/default-profile.svg") 
                      : (pegawaiForm.foto_url || "/images/default-profile.svg")
                  } 
                  alt="Foto Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <input 
                  ref={photoInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                />
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => photoInputRef.current?.click()} 
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <HiOutlineArrowUpTray className="w-3.5 h-3.5" />
                    {isUploading ? "Mengunggah..." : "Ubah Foto"}
                  </button>
                  
                  {activeTab === "dosen" ? (
                    dosenForm.foto && (
                      <button 
                        type="button" 
                        onClick={() => setDosenForm(prev => ({ ...prev, foto: null }))}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 bg-white hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <HiOutlineTrash className="w-3.5 h-3.5" /> Hapus
                      </button>
                    )
                  ) : (
                    pegawaiForm.foto_url && (
                      <button 
                        type="button" 
                        onClick={() => setPegawaiForm(prev => ({ ...prev, foto_url: null }))}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 bg-white hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <HiOutlineTrash className="w-3.5 h-3.5" /> Hapus
                      </button>
                    )
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG. Maks 50MB.</p>
              </div>
            </div>
          )}

          {/* Form Fields depending on Active Tab */}
          {activeTab === "dosen" ? (
            /* DOSEN FORM FIELDS */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap (beserta gelar)</label>
                <input
                  type="text"
                  required
                  value={dosenForm.nama || ""}
                  onChange={(e) => setDosenForm({ ...dosenForm, nama: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-950"
                  placeholder="Contoh: Dr. Ahmad Fauzi, M.T."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIDN</label>
                  <input
                    type="text"
                    required
                    value={dosenForm.nidn || ""}
                    onChange={(e) => setDosenForm({ ...dosenForm, nidn: maskNidn(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-primary-950"
                    placeholder="0024109001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email {!editingId && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    required={!editingId}
                    value={dosenForm.email || ""}
                    onChange={(e) => setDosenForm({ ...dosenForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-950"
                    placeholder="email@polimdo.ac.id"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={dosenForm.telepon || ""}
                    onChange={(e) => setDosenForm({ ...dosenForm, telepon: maskPhone(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-950"
                    placeholder="0812-3456-7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={dosenForm.pendidikanTerakhir || ""}
                    onChange={(e) => setDosenForm({ ...dosenForm, pendidikanTerakhir: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-950"
                    placeholder="S2 Teknik Elektro, Universitas..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan Fungsional</label>
                  <input
                    type="text"
                    value={dosenForm.jabatan || ""}
                    onChange={(e) => setDosenForm({ ...dosenForm, jabatan: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-950"
                    placeholder="Lektor Kepala, Asisten Ahli"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pangkat / Golongan</label>
                  <input
                    type="text"
                    value={dosenForm.pangkat || ""}
                    onChange={(e) => setDosenForm({ ...dosenForm, pangkat: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-950"
                    placeholder="Pembina - IV/a"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi (Homebase)</label>
                <input
                  type="text"
                  value={dosenForm.programStudi || ""}
                  onChange={(e) => setDosenForm({ ...dosenForm, programStudi: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-950"
                  placeholder="D4 Teknik Listrik"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bidang Keahlian (pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={bidangInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBidangInput(val);
                    setDosenForm({ ...dosenForm, bidangKeahlian: val.split(",").map(s => s.trim()).filter(Boolean) });
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-950"
                  placeholder="Sistem Tenaga Listrik, Energi Terbarukan"
                />
              </div>
            </div>
          ) : (
            /* PEGAWAI FORM FIELDS */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap (beserta gelar)</label>
                <input
                  type="text"
                  required
                  value={pegawaiForm.nama || ""}
                  onChange={(e) => setPegawaiForm({ ...pegawaiForm, nama: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-950"
                  placeholder="Contoh: Maria Senduk, S.E."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIP / Identitas</label>
                  <input
                    type="text"
                    required
                    value={pegawaiForm.nip || ""}
                    onChange={(e) => setPegawaiForm({ ...pegawaiForm, nip: maskNip(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-primary-950"
                    placeholder="19990101 202203 1 001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email {!editingId && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    required={!editingId}
                    value={pegawaiForm.email || ""}
                    onChange={(e) => setPegawaiForm({ ...pegawaiForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-950"
                    placeholder="email@polimdo.ac.id"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={pegawaiForm.telepon || ""}
                    onChange={(e) => setPegawaiForm({ ...pegawaiForm, telepon: maskPhone(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-950"
                    placeholder="0812-3456-7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={pegawaiForm.pendidikan_terakhir || ""}
                    onChange={(e) => setPegawaiForm({ ...pegawaiForm, pendidikan_terakhir: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-950"
                    placeholder="S1 Administrasi Negara"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password field — shown always (required for new user, optional for edit) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {editingId ? "Password Baru" : <>Password <span className="text-red-500">*</span></>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required={!editingId}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10 text-primary-950"
                placeholder={editingId ? "Kosongkan jika tidak ingin diubah (min 6 karakter)" : "Minimal 6 karakter"}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {editingId 
                ? "Isi untuk mengubah password akun staf ini." 
                : "Staf akan menggunakan email & password ini untuk login ke dashboard."
              }
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onConfirm={executeDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        title={`Hapus ${activeTab === "dosen" ? "Dosen" : "Pegawai"}`}
        message={`Apakah Anda yakin ingin menghapus ${activeTab === "dosen" ? "dosen" : "pegawai"} ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="danger"
      />
    </div>
  );
}
