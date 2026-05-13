export interface PersonLink {
  id?: string;
  nama: string;
}

export interface KaryaBase {
  id: string;
  judul: string;
  tahun: number;
  deskripsi?: string;
}

export interface Publikasi extends KaryaBase {
  jenis: 'publikasi';
  penulis: PersonLink[];
  jurnal: string;
  link?: string;
}

export interface Penelitian extends KaryaBase {
  jenis: 'penelitian';
  ketua: PersonLink;
  anggota: PersonLink[];
  sumberDana?: string;
}

export interface Pengabdian extends KaryaBase {
  jenis: 'pengabdian';
  ketua: PersonLink;
  anggota: PersonLink[];
  mitra?: string;
}

export interface BukuAjar extends KaryaBase {
  jenis: 'bukuAjar';
  penulis: PersonLink[];
  penerbit: string;
  isbn?: string;
}

export interface Hki extends KaryaBase {
  jenis: 'hki';
  jenisHki: string;
  nomorSertifikat?: string;
}

export interface Sertifikasi extends KaryaBase {
  jenis: 'sertifikasi';
  penyelenggara?: string;
  linkSertifikat?: string; // GDrive link
}

export type KaryaItem = Publikasi | Penelitian | Pengabdian | BukuAjar | Hki | Sertifikasi;

export interface Dosen {
  id: string;
  nama: string;
  nidn: string;
  foto?: string | null;
  jabatan?: string;
  pangkat?: string;
  email?: string;
  telepon?: string;
  programStudi?: string;
  pendidikanTerakhir?: string;
  bidangKeahlian: string[];
  karya: {
    publikasi: Publikasi[];
    penelitian: Penelitian[];
    pengabdian: Pengabdian[];
    bukuAjar: BukuAjar[];
    hki: Hki[];
    sertifikasi: Sertifikasi[];
  };
}

export type KaryaCategory = keyof Dosen["karya"];

export const karyaCategoryLabels: Record<KaryaCategory, string> = {
  publikasi: "Publikasi",
  penelitian: "Penelitian",
  pengabdian: "Pengabdian",
  bukuAjar: "Buku Ajar",
  hki: "HKI",
  sertifikasi: "Sertifikasi",
};

export function getTotalKarya(dosen: Dosen): number {
  const k = dosen.karya;
  return (
    k.publikasi.length +
    k.penelitian.length +
    k.pengabdian.length +
    k.bukuAjar.length +
    k.hki.length +
    k.sertifikasi.length
  );
}

export const dosenList: Dosen[] = [
  {
    id: "dr-ahmad-fauzi",
    nama: "Dr. Ahmad Fauzi, S.T., M.T.",
    nidn: "0012345601",
    jabatan: "Lektor Kepala",
    pangkat: "Pembina - IV/a",
    email: "ahmad.fauzi@polimdo.ac.id",
    telepon: "081234567890",
    bidangKeahlian: ["Sistem Tenaga Listrik", "Proteksi Sistem Kelistrikan", "Smart Grid"],
    karya: {
      publikasi: [
        { id: "pub-1", jenis: "publikasi", judul: "Analisis Stabilitas Sistem Tenaga Listrik Jawa-Bali", tahun: 2024, jurnal: "Jurnal Teknik Elektro", penulis: [{ id: "dr-ahmad-fauzi", nama: "Dr. Ahmad Fauzi" }] },
        { id: "pub-2", jenis: "publikasi", judul: "Optimasi Distribusi Daya pada Microgrid Islanding", tahun: 2023, jurnal: "IEEE Transactions on Smart Grid", penulis: [{ id: "dr-ahmad-fauzi", nama: "Dr. Ahmad Fauzi" }, { id: "siti-nurhaliza", nama: "Siti Nurhaliza" }] },
        { id: "pub-3", jenis: "publikasi", judul: "Studi Proteksi Adaptif pada Jaringan Distribusi", tahun: 2022, jurnal: "Jurnal Ilmiah Teknik Elektro", penulis: [{ id: "dr-ahmad-fauzi", nama: "Dr. Ahmad Fauzi" }] },
      ],
      penelitian: [
        { id: "pen-1", jenis: "penelitian", judul: "Pengembangan Smart Grid untuk Desa Mandiri Energi", tahun: 2024, ketua: { id: "dr-ahmad-fauzi", nama: "Dr. Ahmad Fauzi" }, anggota: [{ id: "siti-nurhaliza", nama: "Siti Nurhaliza" }], sumberDana: "Kemendikbud Ristek", deskripsi: "Penelitian ini berfokus pada implementasi smart grid skala kecil untuk kemandirian energi desa." },
        { id: "pen-2", jenis: "penelitian", judul: "Riset Sistem Proteksi Cerdas Berbasis IoT", tahun: 2023, ketua: { id: "dr-ahmad-fauzi", nama: "Dr. Ahmad Fauzi" }, anggota: [{ id: "dewi-kartika", nama: "Dewi Kartika Sari" }], sumberDana: "Internal PNM" },
      ],
      pengabdian: [
        { id: "abdi-1", jenis: "pengabdian", judul: "Pelatihan Instalasi Listrik untuk Masyarakat Desa Buha", tahun: 2024, ketua: { id: "dr-ahmad-fauzi", nama: "Dr. Ahmad Fauzi" }, anggota: [{ id: "ir-budi-santoso", nama: "Ir. Budi Santoso" }], mitra: "Desa Buha" },
      ],
      bukuAjar: [
        { id: "buku-1", jenis: "bukuAjar", judul: "Dasar-Dasar Sistem Tenaga Listrik", tahun: 2022, penulis: [{ id: "dr-ahmad-fauzi", nama: "Dr. Ahmad Fauzi" }], penerbit: "Polimdo Press", isbn: "978-602-123-456-7" },
      ],
      hki: [
        { id: "hki-1", jenis: "hki", judul: "Alat Monitoring Kualitas Daya Listrik Berbasis IoT", tahun: 2023, jenisHki: "Paten", nomorSertifikat: "P00202312345" },
      ],
      sertifikasi: [
        { id: "sert-1", jenis: "sertifikasi", judul: "Sertifikasi Ahli Teknik Tenaga Listrik", tahun: 2021, penyelenggara: "LSP Kelistrikan", linkSertifikat: "https://drive.google.com/file/d/dummy-link-123/view" },
      ],
    },
  },
  {
    id: "siti-nurhaliza",
    nama: "Siti Nurhaliza, S.T., M.Eng.",
    nidn: "0023456702",
    jabatan: "Lektor",
    pangkat: "Penata Tingkat I - III/d",
    email: "siti.nurhaliza@polimdo.ac.id",
    bidangKeahlian: ["Elektronika Daya", "Energi Terbarukan", "Konverter Daya"],
    karya: {
      publikasi: [
        { id: "pub-4", jenis: "publikasi", judul: "Desain Inverter Multilevel untuk Sistem Photovoltaic", tahun: 2024, jurnal: "Jurnal Teknologi Energi", penulis: [{ id: "siti-nurhaliza", nama: "Siti Nurhaliza" }] },
        { id: "pub-5", jenis: "publikasi", judul: "Perancangan MPPT Berbasis Fuzzy Logic Controller", tahun: 2023, jurnal: "International Journal of Renewable Energy", penulis: [{ id: "siti-nurhaliza", nama: "Siti Nurhaliza" }, { id: "dewi-kartika", nama: "Dewi Kartika Sari" }] },
      ],
      penelitian: [
        { id: "pen-3", jenis: "penelitian", judul: "Studi Kelayakan Pembangkit Listrik Tenaga Surya 1 MWp", tahun: 2024, ketua: { id: "siti-nurhaliza", nama: "Siti Nurhaliza" }, anggota: [], sumberDana: "Pemprov Sulut" },
      ],
      pengabdian: [
        { id: "abdi-2", jenis: "pengabdian", judul: "Instalasi Panel Surya untuk Musholla Desa Mapanget", tahun: 2023, ketua: { id: "siti-nurhaliza", nama: "Siti Nurhaliza" }, anggota: [{ nama: "Mahasiswa D4 Listrik" }], mitra: "Desa Mapanget" },
        { id: "abdi-3", jenis: "pengabdian", judul: "Workshop Energi Terbarukan bagi Guru SMK", tahun: 2022, ketua: { id: "siti-nurhaliza", nama: "Siti Nurhaliza" }, anggota: [], mitra: "Dinas Pendidikan" },
      ],
      bukuAjar: [],
      hki: [],
      sertifikasi: [
        { id: "sert-2", jenis: "sertifikasi", judul: "Sertifikasi Kompetensi Energi Surya", tahun: 2023, penyelenggara: "LSP Energi Terbarukan", linkSertifikat: "" }, // No link
      ],
    },
  },
  {
    id: "ir-budi-santoso",
    nama: "Ir. Budi Santoso, M.T.",
    nidn: "0034567803",
    jabatan: "Asisten Ahli",
    email: "budi.santoso@polimdo.ac.id",
    telepon: "081345678901",
    bidangKeahlian: ["Instalasi Listrik", "Teknik Iluminasi", "K3 Kelistrikan"],
    karya: {
      publikasi: [
        { id: "pub-6", jenis: "publikasi", judul: "Evaluasi Sistem Penerangan Jalan Umum Berbasis LED", tahun: 2023, jurnal: "Jurnal Iluminasi Terapan", penulis: [{ id: "ir-budi-santoso", nama: "Ir. Budi Santoso" }] },
      ],
      penelitian: [
        { id: "pen-4", jenis: "penelitian", judul: "Audit Energi Gedung Perkantoran di Kota Manado", tahun: 2024, ketua: { id: "ir-budi-santoso", nama: "Ir. Budi Santoso" }, anggota: [{ id: "agus-wijaya", nama: "Agus Wijaya" }] },
        { id: "pen-5", jenis: "penelitian", judul: "Studi Efisiensi Pencahayaan pada Gedung Pendidikan", tahun: 2022, ketua: { id: "ir-budi-santoso", nama: "Ir. Budi Santoso" }, anggota: [] },
      ],
      pengabdian: [
        { id: "abdi-4", jenis: "pengabdian", judul: "Sosialisasi K3 Kelistrikan untuk Teknisi Lapangan", tahun: 2024, ketua: { id: "ir-budi-santoso", nama: "Ir. Budi Santoso" }, anggota: [], mitra: "PLN Manado" },
      ],
      bukuAjar: [
        { id: "buku-2", jenis: "bukuAjar", judul: "Panduan Praktikum Instalasi Listrik Industri", tahun: 2023, penulis: [{ id: "ir-budi-santoso", nama: "Ir. Budi Santoso" }], penerbit: "Polimdo Press" },
        { id: "buku-3", jenis: "bukuAjar", judul: "Modul Teknik Iluminasi Modern", tahun: 2021, penulis: [{ id: "ir-budi-santoso", nama: "Ir. Budi Santoso" }], penerbit: "Penerbit Andi" },
      ],
      hki: [],
      sertifikasi: [],
    },
  },
  {
    id: "dewi-kartika",
    nama: "Dewi Kartika Sari, S.T., M.T.",
    nidn: "0045678904",
    pangkat: "Penata Muda Tingkat I - III/b",
    email: "dewi.kartika@polimdo.ac.id",
    bidangKeahlian: ["Sistem Kontrol", "Otomasi Industri", "PLC & SCADA"],
    karya: {
      publikasi: [
        { id: "pub-7", jenis: "publikasi", judul: "Implementasi SCADA pada Gardu Distribusi 20 kV", tahun: 2024, jurnal: "Jurnal Kontrol Industri", penulis: [{ id: "dewi-kartika", nama: "Dewi Kartika Sari" }] },
        { id: "pub-8", jenis: "publikasi", judul: "Desain Sistem Otomasi Berbasis PLC Siemens S7-1200", tahun: 2023, jurnal: "Jurnal Otomasi Nasional", penulis: [{ id: "dewi-kartika", nama: "Dewi Kartika Sari" }] },
        { id: "pub-9", jenis: "publikasi", judul: "Kontrol PID untuk Motor Induksi Tiga Fasa", tahun: 2022, jurnal: "Jurnal Teknik Elektro", penulis: [{ id: "dewi-kartika", nama: "Dewi Kartika Sari" }] },
        { id: "pub-10", jenis: "publikasi", judul: "Monitoring Real-Time Berbasis HMI pada Industri Manufaktur", tahun: 2021, jurnal: "Industrial Automation Journal", penulis: [{ id: "dewi-kartika", nama: "Dewi Kartika Sari" }] },
      ],
      penelitian: [
        { id: "pen-6", jenis: "penelitian", judul: "Pengembangan Sistem SCADA untuk Jaringan Distribusi Listrik", tahun: 2024, ketua: { id: "dewi-kartika", nama: "Dewi Kartika Sari" }, anggota: [{ id: "dr-ahmad-fauzi", nama: "Dr. Ahmad Fauzi" }], sumberDana: "Kemendikbud Ristek" },
      ],
      pengabdian: [],
      bukuAjar: [],
      hki: [
        { id: "hki-2", jenis: "hki", judul: "Software Simulasi Sistem Kontrol Industri", tahun: 2023, jenisHki: "Hak Cipta", nomorSertifikat: "C00202356789" },
      ],
      sertifikasi: [
        { id: "sert-3", jenis: "sertifikasi", judul: "Sertifikasi Programmer PLC Tingkat Madya", tahun: 2022, penyelenggara: "Siemens Training Center" },
        { id: "sert-4", jenis: "sertifikasi", judul: "Sertifikasi Kompetensi Otomasi Industri", tahun: 2020, penyelenggara: "BNSP" },
      ],
    },
  },
  {
    id: "muhammad-rizki",
    nama: "Muhammad Rizki Pratama, S.T., M.Sc.",
    nidn: "0056789005",
    jabatan: "Lektor",
    pangkat: "Penata - III/c",
    telepon: "082456789012",
    bidangKeahlian: ["Mesin Listrik", "Drives & Motion Control", "Motor Listrik"],
    karya: {
      publikasi: [
        { id: "pub-11", jenis: "publikasi", judul: "Analisis Performa Motor BLDC untuk Kendaraan Listrik", tahun: 2024, jurnal: "Jurnal Kendaraan Listrik Nasional", penulis: [{ id: "muhammad-rizki", nama: "Muhammad Rizki Pratama" }] },
        { id: "pub-12", jenis: "publikasi", judul: "Desain Generator Sinkron Magnet Permanen", tahun: 2023, jurnal: "Jurnal Mesin Listrik", penulis: [{ id: "muhammad-rizki", nama: "Muhammad Rizki Pratama" }] },
      ],
      penelitian: [
        { id: "pen-7", jenis: "penelitian", judul: "Pengembangan Motor Hub untuk Sepeda Listrik", tahun: 2024, ketua: { id: "muhammad-rizki", nama: "Muhammad Rizki Pratama" }, anggota: [] },
        { id: "pen-8", jenis: "penelitian", judul: "Riset Bahan Magnet Permanen untuk Mesin Listrik", tahun: 2023, ketua: { id: "muhammad-rizki", nama: "Muhammad Rizki Pratama" }, anggota: [] },
        { id: "pen-9", jenis: "penelitian", judul: "Studi Karakteristik Motor Induksi Efisiensi Tinggi", tahun: 2022, ketua: { id: "muhammad-rizki", nama: "Muhammad Rizki Pratama" }, anggota: [] },
      ],
      pengabdian: [
        { id: "abdi-5", jenis: "pengabdian", judul: "Pelatihan Rewinding Motor Listrik untuk Bengkel Lokal", tahun: 2023, ketua: { id: "muhammad-rizki", nama: "Muhammad Rizki Pratama" }, anggota: [], mitra: "Bengkel Dinamo Manado" },
      ],
      bukuAjar: [
        { id: "buku-4", jenis: "bukuAjar", judul: "Mesin-Mesin Listrik: Teori dan Aplikasi", tahun: 2022, penulis: [{ id: "muhammad-rizki", nama: "Muhammad Rizki Pratama" }], penerbit: "Erlangga" },
      ],
      hki: [
        { id: "hki-3", jenis: "hki", judul: "Paten Desain Motor BLDC Efisiensi Tinggi", tahun: 2024, jenisHki: "Paten", nomorSertifikat: "P00202498765" },
      ],
      sertifikasi: [],
    },
  },
  {
    id: "ratna-wulandari",
    nama: "Ratna Wulandari, S.T., M.T.",
    nidn: "0067890106",
    bidangKeahlian: ["Teknik Tegangan Tinggi", "Isolasi & Dielektrik", "Pengujian Material"],
    karya: {
      publikasi: [
        { id: "pub-13", jenis: "publikasi", judul: "Karakteristik Breakdown Voltage pada Minyak Transformator", tahun: 2024, jurnal: "Jurnal Material Listrik", penulis: [{ id: "ratna-wulandari", nama: "Ratna Wulandari" }] },
        { id: "pub-14", jenis: "publikasi", judul: "Analisis Partial Discharge pada Kabel XLPE 150 kV", tahun: 2023, jurnal: "Jurnal Tegangan Tinggi", penulis: [{ id: "ratna-wulandari", nama: "Ratna Wulandari" }] },
      ],
      penelitian: [
        { id: "pen-10", jenis: "penelitian", judul: "Studi Degradasi Isolasi Transformator Daya", tahun: 2024, ketua: { id: "ratna-wulandari", nama: "Ratna Wulandari" }, anggota: [] },
      ],
      pengabdian: [
        { id: "abdi-6", jenis: "pengabdian", judul: "Pengujian Gratis Instalasi Listrik Rumah Tangga", tahun: 2023, ketua: { id: "ratna-wulandari", nama: "Ratna Wulandari" }, anggota: [], mitra: "PLN" },
        { id: "abdi-7", jenis: "pengabdian", judul: "Penyuluhan Keselamatan Listrik Tegangan Tinggi", tahun: 2022, ketua: { id: "ratna-wulandari", nama: "Ratna Wulandari" }, anggota: [], mitra: "Masyarakat Umum" },
      ],
      bukuAjar: [],
      hki: [],
      sertifikasi: [
        { id: "sert-5", jenis: "sertifikasi", judul: "Sertifikasi Pengujian Tegangan Tinggi", tahun: 2023, penyelenggara: "LSP Ketenagalistrikan" },
      ],
    },
  },
  {
    id: "hendro-prasetyo",
    nama: "Dr. Hendro Prasetyo, S.T., M.T.",
    nidn: "0078901207",
    jabatan: "Lektor Kepala",
    pangkat: "Pembina - IV/a",
    email: "hendro.prasetyo@polinema.ac.id",
    telepon: "083567890123",
    bidangKeahlian: ["Teknik Pengukuran", "Instrumentasi", "Sensor & Transduser"],
    karya: {
      publikasi: [
        { id: "pub-15", jenis: "publikasi", judul: "Pengembangan Sensor Arus Berbasis Hall Effect", tahun: 2024, jurnal: "Jurnal Instrumentasi", penulis: [{ id: "hendro-prasetyo", nama: "Dr. Hendro Prasetyo" }] },
        { id: "pub-16", jenis: "publikasi", judul: "Sistem Monitoring Kualitas Daya Berbasis Raspberry Pi", tahun: 2023, jurnal: "Jurnal Teknik Elektro", penulis: [{ id: "hendro-prasetyo", nama: "Dr. Hendro Prasetyo" }] },
        { id: "pub-17", jenis: "publikasi", judul: "Kalibrasi Alat Ukur Listrik Standar Nasional", tahun: 2022, jurnal: "Jurnal Metrologi", penulis: [{ id: "hendro-prasetyo", nama: "Dr. Hendro Prasetyo" }] },
      ],
      penelitian: [
        { id: "pen-11", jenis: "penelitian", judul: "Riset Pengembangan Smart Meter untuk PLN", tahun: 2024, ketua: { id: "hendro-prasetyo", nama: "Dr. Hendro Prasetyo" }, anggota: [{ id: "agus-wijaya", nama: "Agus Wijaya" }] },
        { id: "pen-12", jenis: "penelitian", judul: "Studi Akurasi Power Analyzer Portabel", tahun: 2023, ketua: { id: "hendro-prasetyo", nama: "Dr. Hendro Prasetyo" }, anggota: [] },
      ],
      pengabdian: [
        { id: "abdi-8", jenis: "pengabdian", judul: "Pelatihan Penggunaan Alat Ukur Listrik Digital", tahun: 2024, ketua: { id: "hendro-prasetyo", nama: "Dr. Hendro Prasetyo" }, anggota: [], mitra: "SMK N 1" },
        { id: "abdi-9", jenis: "pengabdian", judul: "Kalibrasi Gratis Alat Ukur untuk UKM", tahun: 2022, ketua: { id: "hendro-prasetyo", nama: "Dr. Hendro Prasetyo" }, anggota: [], mitra: "UKM Manado" },
      ],
      bukuAjar: [
        { id: "buku-5", jenis: "bukuAjar", judul: "Teknik Pengukuran dan Instrumentasi Listrik", tahun: 2023, penulis: [{ id: "hendro-prasetyo", nama: "Dr. Hendro Prasetyo" }], penerbit: "Penerbit Salemba" },
        { id: "buku-6", jenis: "bukuAjar", judul: "Praktikum Sensor dan Transduser", tahun: 2021, penulis: [{ id: "hendro-prasetyo", nama: "Dr. Hendro Prasetyo" }], penerbit: "Polinema Press" },
      ],
      hki: [
        { id: "hki-4", jenis: "hki", judul: "Hak Cipta Software Monitoring Energi Listrik", tahun: 2023, jenisHki: "Hak Cipta", nomorSertifikat: "C00202311223" },
        { id: "hki-5", jenis: "hki", judul: "Paten Alat Ukur Harmonisa Portabel", tahun: 2022, jenisHki: "Paten", nomorSertifikat: "P00202233445" },
      ],
      sertifikasi: [
        { id: "sert-6", jenis: "sertifikasi", judul: "Sertifikasi Metrologi dan Kalibrasi", tahun: 2021, penyelenggara: "KAN" },
        { id: "sert-7", jenis: "sertifikasi", judul: "Sertifikasi Instrumen Industri", tahun: 2020, penyelenggara: "BNSP" },
      ],
    },
  },
  {
    id: "agus-wijaya",
    nama: "Agus Wijaya, S.T., M.Eng.",
    nidn: "0089012308",
    jabatan: "Asisten Ahli",
    pangkat: "Penata Muda - III/a",
    email: "agus.wijaya@polinema.ac.id",
    bidangKeahlian: ["Jaringan Distribusi", "GIS Kelistrikan", "Manajemen Energi"],
    karya: {
      publikasi: [
        { id: "pub-18", jenis: "publikasi", judul: "Pemetaan Jaringan Distribusi Berbasis GIS", tahun: 2024, jurnal: "Jurnal Spatial", penulis: [{ id: "agus-wijaya", nama: "Agus Wijaya" }] },
      ],
      penelitian: [
        { id: "pen-13", jenis: "penelitian", judul: "Analisis Rugi-Rugi Daya pada Jaringan Distribusi 20 kV", tahun: 2024, ketua: { id: "agus-wijaya", nama: "Agus Wijaya" }, anggota: [] },
      ],
      pengabdian: [],
      bukuAjar: [],
      hki: [],
      sertifikasi: [
        { id: "sert-8", jenis: "sertifikasi", judul: "Sertifikasi Ahli K3 Listrik", tahun: 2023, penyelenggara: "Kemenaker", linkSertifikat: "https://drive.google.com/file/d/dummy-link-456/view" },
      ],
    },
  },
];
