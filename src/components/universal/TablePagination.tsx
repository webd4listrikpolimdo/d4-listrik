"use client";

import React from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function TablePagination({
  currentPage,
  totalPages,
  totalEntries,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50, 100],
}: TablePaginationProps) {
  if (totalEntries === 0) return null;

  const startEntry = (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalEntries);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-white border-t border-gray-100 rounded-b-2xl">
      <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs font-semibold text-gray-700 cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span>data per halaman</span>
        </div>
        <span className="hidden sm:inline-block text-gray-300">|</span>
        <span>
          Menampilkan <strong className="font-semibold text-gray-700">{startEntry}</strong> - <strong className="font-semibold text-gray-700">{endEntry}</strong> dari <strong className="font-semibold text-gray-700">{totalEntries}</strong> data
        </span>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Sebelumnya"
          >
            <HiChevronLeft className="w-4 h-4" />
          </button>
          
          {getPageNumbers().map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentPage === p
                  ? "bg-primary-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Berikutnya"
          >
            <HiChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
