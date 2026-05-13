export interface MataKuliah {
  kode: string;
  nama: string;
  sks: number;
  jenis: "Teori" | "Praktik" | "Teori & Praktik";
}

export interface Semester {
  semester: number;
  mataKuliah: MataKuliah[];
}

export interface CPLItem {
  kode: string;
  deskripsi: string;
}

export interface KurikulumAktif {
  nama: string;
  deskripsi: string;
  berlakuSejak: string;
  fileUrl: string | null; // URL dari Supabase Storage (null jika belum diupload)
}

export const kurikulumAktif: KurikulumAktif = {
  nama: "Kurikulum OBE-MBKM 2022",
  deskripsi:
    "Kurikulum berbasis Outcome-Based Education (OBE) yang terintegrasi dengan program Merdeka Belajar Kampus Merdeka (MBKM), dirancang untuk menghasilkan lulusan yang kompeten dan siap bersaing di industri ketenagalistrikan nasional maupun internasional.",
  berlakuSejak: "Tahun Akademik 2022/2023",
  fileUrl: null, // TODO: Ambil dari Supabase Storage
};

export const kurikulumData: Semester[] = [
  {
    semester: 1,
    mataKuliah: [
      { kode: "TL101", nama: "Fisika Terapan", sks: 3, jenis: "Teori" },
      { kode: "TL102", nama: "Matematika Teknik I", sks: 3, jenis: "Teori" },
      { kode: "TL103", nama: "Rangkaian Listrik I", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL104", nama: "Praktikum Dasar Listrik", sks: 2, jenis: "Praktik" },
      { kode: "TL105", nama: "Gambar Teknik Listrik", sks: 2, jenis: "Praktik" },
      { kode: "TL106", nama: "Bahasa Inggris Teknik", sks: 2, jenis: "Teori" },
      { kode: "TL107", nama: "Keselamatan dan Kesehatan Kerja (K3)", sks: 2, jenis: "Teori" },
      { kode: "TL108", nama: "Pendidikan Agama", sks: 2, jenis: "Teori" },
    ],
  },
  {
    semester: 2,
    mataKuliah: [
      { kode: "TL201", nama: "Matematika Teknik II", sks: 3, jenis: "Teori" },
      { kode: "TL202", nama: "Rangkaian Listrik II", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL203", nama: "Elektronika Analog", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL204", nama: "Medan Elektromagnetik", sks: 2, jenis: "Teori" },
      { kode: "TL205", nama: "Pengukuran Listrik", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL206", nama: "Bahasa Indonesia", sks: 2, jenis: "Teori" },
      { kode: "TL207", nama: "Pendidikan Pancasila", sks: 2, jenis: "Teori" },
    ],
  },
  {
    semester: 3,
    mataKuliah: [
      { kode: "TL301", nama: "Mesin Listrik I", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL302", nama: "Elektronika Daya", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL303", nama: "Instalasi Listrik", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL304", nama: "Teknik Digital", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL305", nama: "Sistem Kontrol I", sks: 3, jenis: "Teori" },
      { kode: "TL306", nama: "Material Teknik Listrik", sks: 2, jenis: "Teori" },
      { kode: "TL307", nama: "Pendidikan Kewarganegaraan", sks: 2, jenis: "Teori" },
    ],
  },
  {
    semester: 4,
    mataKuliah: [
      { kode: "TL401", nama: "Mesin Listrik II", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL402", nama: "Sistem Tenaga Listrik I", sks: 3, jenis: "Teori" },
      { kode: "TL403", nama: "Sistem Kontrol II", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL404", nama: "Pemrograman PLC", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL405", nama: "Teknik Tegangan Tinggi", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL406", nama: "Mikroprosesor & Mikrokontroler", sks: 3, jenis: "Teori & Praktik" },
    ],
  },
  {
    semester: 5,
    mataKuliah: [
      { kode: "TL501", nama: "Sistem Tenaga Listrik II", sks: 3, jenis: "Teori" },
      { kode: "TL502", nama: "Proteksi Sistem Tenaga", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL503", nama: "Sistem SCADA", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL504", nama: "Energi Terbarukan", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL505", nama: "Manajemen Energi", sks: 2, jenis: "Teori" },
      { kode: "TL506", nama: "Metodologi Penelitian", sks: 2, jenis: "Teori" },
      { kode: "TL507", nama: "Kewirausahaan", sks: 2, jenis: "Teori" },
    ],
  },
  {
    semester: 6,
    mataKuliah: [
      { kode: "TL601", nama: "Distribusi Tenaga Listrik", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL602", nama: "Analisis Sistem Tenaga", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL603", nama: "GIS Kelistrikan", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL604", nama: "Motor Drives", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL605", nama: "Smart Grid", sks: 3, jenis: "Teori" },
      { kode: "TL606", nama: "Proposal Tugas Akhir", sks: 2, jenis: "Teori" },
    ],
  },
  {
    semester: 7,
    mataKuliah: [
      { kode: "TL701", nama: "Kerja Praktik / Magang Industri", sks: 4, jenis: "Praktik" },
      { kode: "TL702", nama: "Seminar Kerja Praktik", sks: 2, jenis: "Teori" },
      { kode: "TL703", nama: "Mata Kuliah Pilihan I", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL704", nama: "Mata Kuliah Pilihan II", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL705", nama: "Tugas Akhir I", sks: 4, jenis: "Praktik" },
    ],
  },
  {
    semester: 8,
    mataKuliah: [
      { kode: "TL801", nama: "Tugas Akhir II", sks: 6, jenis: "Praktik" },
      { kode: "TL802", nama: "Seminar Tugas Akhir", sks: 2, jenis: "Teori" },
      { kode: "TL803", nama: "Mata Kuliah Pilihan III", sks: 3, jenis: "Teori & Praktik" },
      { kode: "TL804", nama: "Etika Profesi", sks: 2, jenis: "Teori" },
    ],
  },
];

export const cplData: CPLItem[] = [
  {
    kode: "CPL-01",
    deskripsi:
      "Mampu menerapkan prinsip-prinsip matematika, sains, dan keteknikan untuk menyelesaikan permasalahan di bidang teknik ketenagalistrikan.",
  },
  {
    kode: "CPL-02",
    deskripsi:
      "Mampu merancang, menginstalasi, mengoperasikan, dan memelihara sistem ketenagalistrikan sesuai standar keselamatan kerja.",
  },
  {
    kode: "CPL-03",
    deskripsi:
      "Mampu mengidentifikasi, memformulasikan, dan menyelesaikan permasalahan teknik ketenagalistrikan secara sistematis.",
  },
  {
    kode: "CPL-04",
    deskripsi:
      "Mampu menggunakan peralatan pengukuran, perangkat lunak, dan teknologi modern dalam bidang teknik ketenagalistrikan.",
  },
  {
    kode: "CPL-05",
    deskripsi:
      "Mampu bekerja sama dalam tim multidisiplin dan berkomunikasi secara efektif baik lisan maupun tulisan.",
  },
  {
    kode: "CPL-06",
    deskripsi:
      "Mampu menerapkan prinsip etika profesi, tanggung jawab sosial, dan pembelajaran sepanjang hayat dalam pengembangan karir.",
  },
  {
    kode: "CPL-07",
    deskripsi:
      "Mampu melakukan penelitian terapan dan pengembangan inovasi di bidang teknik ketenagalistrikan.",
  },
  {
    kode: "CPL-08",
    deskripsi:
      "Mampu menerapkan konsep manajemen energi dan teknologi energi terbarukan untuk pembangunan berkelanjutan.",
  },
  {
    kode: "CPL-09",
    deskripsi:
      "Mampu merancang dan mengimplementasikan sistem otomasi dan kontrol pada instalasi ketenagalistrikan.",
  },
];
