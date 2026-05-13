"use client";

import { useState } from "react";
import { kurikulumData } from "@/data/kurikulum";

export default function SemesterTabs() {
  const [activeSemester, setActiveSemester] = useState(1);
  const semester = kurikulumData.find((s) => s.semester === activeSemester);
  const totalSKS = semester
    ? semester.mataKuliah.reduce((sum, mk) => sum + mk.sks, 0)
    : 0;

  return (
    <div>
      {/* Semester tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {kurikulumData.map((sem) => (
          <button
            key={sem.semester}
            onClick={() => setActiveSemester(sem.semester)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeSemester === sem.semester
                ? "bg-primary-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Semester {sem.semester}
          </button>
        ))}
      </div>

      {/* Table */}
      {semester && (
        <div className="animate-fade-in" key={activeSemester}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary-50">
                    <th className="text-left px-5 py-3 font-semibold text-primary-900 text-xs uppercase tracking-wider">
                      No
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-primary-900 text-xs uppercase tracking-wider">
                      Kode MK
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-primary-900 text-xs uppercase tracking-wider">
                      Nama Mata Kuliah
                    </th>
                    <th className="text-center px-5 py-3 font-semibold text-primary-900 text-xs uppercase tracking-wider">
                      SKS
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-primary-900 text-xs uppercase tracking-wider">
                      Jenis
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {semester.mataKuliah.map((mk, index) => (
                    <tr
                      key={mk.kode}
                      className="border-t border-gray-50 hover:bg-primary-50/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-gray-400">{index + 1}</td>
                      <td className="px-5 py-3 font-mono text-xs text-primary-700 font-semibold">
                        {mk.kode}
                      </td>
                      <td className="px-5 py-3 font-medium text-primary-950">{mk.nama}</td>
                      <td className="px-5 py-3 text-center font-semibold text-primary-700">
                        {mk.sks}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            mk.jenis === "Teori"
                              ? "bg-blue-50 text-blue-700"
                              : mk.jenis === "Praktik"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-violet-50 text-violet-700"
                          }`}
                        >
                          {mk.jenis}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total SKS */}
            <div className="px-5 py-3 bg-primary-50 border-t border-primary-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-900">
                Total SKS Semester {activeSemester}
              </span>
              <span className="text-lg font-bold text-primary-700">{totalSKS}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
