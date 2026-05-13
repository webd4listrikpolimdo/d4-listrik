export interface Berita {
  id: string;
  judul: string;
  ringkasan: string;
  tanggal: string;
  warna: string; // gradient color for placeholder
}

export const beritaData: Berita[] = [
  {
    id: "akreditasi-unggul-2024",
    judul: "Prodi D4 Teknik Listrik Raih Akreditasi Unggul",
    ringkasan:
      "Prodi D4 Teknik Listrik berhasil meraih akreditasi Unggul dari BAN-PT untuk periode 2024-2029. Pencapaian ini merupakan bukti komitmen prodi dalam meningkatkan kualitas pendidikan.",
    tanggal: "15 Maret 2024",
    warna: "from-blue-600 to-indigo-700",
  },
  {
    id: "kerjasama-pln-2024",
    judul: "Penandatanganan MoU dengan PT PLN (Persero)",
    ringkasan:
      "Prodi D4 Teknik Listrik menjalin kerja sama strategis dengan PT PLN dalam bidang magang, penelitian, dan pengembangan SDM ketenagalistrikan nasional.",
    tanggal: "22 Januari 2024",
    warna: "from-emerald-600 to-teal-700",
  },
  {
    id: "juara-kompetisi-2024",
    judul: "Mahasiswa Raih Juara 1 Kompetisi Robotika Nasional",
    ringkasan:
      "Tim mahasiswa D4 Teknik Listrik berhasil meraih juara pertama pada Kompetisi Robotika Nasional 2024 dengan inovasi robot pendeteksi kebocoran arus listrik.",
    tanggal: "8 Februari 2024",
    warna: "from-amber-500 to-orange-600",
  },
];
