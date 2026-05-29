"use client";

interface GaleriFilterProps {
  activeFilter: "semua" | "fasilitas" | "tridharma" | "kegiatan";
  onFilterChange: (filter: "semua" | "fasilitas" | "tridharma" | "kegiatan") => void;
}

const filters: { value: "semua" | "fasilitas" | "tridharma" | "kegiatan"; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "fasilitas", label: "Fasilitas" },
  { value: "tridharma", label: "Tridharma Perguruan Tinggi" },
  { value: "kegiatan", label: "Kegiatan" },
];

export default function GaleriFilter({ activeFilter, onFilterChange }: GaleriFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
            activeFilter === filter.value
              ? "bg-primary-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
