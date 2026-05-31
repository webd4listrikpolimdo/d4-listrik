import React from "react";
import { HiOutlineXMark, HiOutlineCodeBracket } from "react-icons/hi2";
import { devTeam, lecturerInfo } from "@/lib/devTeam";

interface DevTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DevTeamModal({ isOpen, onClose }: DevTeamModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white text-gray-900 w-full max-w-2xl rounded-3xl border border-slate-200/80 shadow-2xl p-6 md:p-8 relative overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-600 via-accent-400 to-indigo-600" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <HiOutlineXMark className="w-6 h-6" />
        </button>

        <div className="mb-6 md:mb-8 pr-8 text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100/70 border border-primary-200 text-primary-900 text-xs font-bold uppercase tracking-wider mb-3">
            <HiOutlineCodeBracket className="w-3.5 h-3.5" /> Project Based Learning (PBL)
          </span>
          <h2 className="text-xl md:text-2xl font-black text-primary-950 leading-tight">
            Tim Pengembang Website
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Website ini dikembangkan oleh Kelompok 3 Kelas 6TI7, Program Studi <strong>D4 Teknik Informatika</strong>, Politeknik Negeri Manado sebagai bagian dari Project Based Learning (PBL) mata kuliah <strong>Teknologi Web</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {devTeam.map((member, idx) => (
            <div 
              key={idx}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm relative group hover:border-primary-300 transition-colors duration-200"
            >
              {member.link ? (
                <a
                  href={member.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-14 h-14 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-black text-lg shadow-md mb-3.5 group-hover:scale-110 transition-transform duration-200`}
                >
                  {member.initials}
                </a>
              ) : (
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-black text-lg shadow-md mb-3.5 group-hover:scale-110 transition-transform duration-200`}>
                  {member.initials}
                </div>
              )}
              
              {member.link ? (
                <a
                  href={member.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-extrabold text-gray-900 hover:text-primary-600 text-sm leading-tight mb-1 truncate w-full hover:underline transition-colors duration-150"
                >
                  {member.nama}
                </a>
              ) : (
                <h3 className="font-extrabold text-gray-900 text-sm leading-tight mb-1 truncate w-full">
                  {member.nama}
                </h3>
              )}
              
              <code className="text-xs bg-gray-200 text-gray-800 font-mono px-2 py-0.5 rounded-md mb-3 select-all">
                NIM. {member.nim}
              </code>
              
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${member.bg}`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>

        {/* Lecturer Section */}
        <div className="mt-2 pt-4 border-t border-gray-100 flex flex-col items-center mb-8">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider mb-2 font-bold">
            Dosen Pengajar
          </span>
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-3 w-full max-w-xs hover:border-primary-300 transition-all duration-200 group">
            {lecturerInfo.link ? (
              <a
                href={lecturerInfo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-950 to-primary-900 text-white font-black text-xs flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0"
              >
                {lecturerInfo.initials}
              </a>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-950 to-primary-900 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                {lecturerInfo.initials}
              </div>
            )}
            <div className="text-left min-w-0">
              {lecturerInfo.link ? (
                <a
                  href={lecturerInfo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-extrabold text-gray-900 hover:text-primary-600 text-xs leading-tight block truncate hover:underline transition-colors"
                >
                  {lecturerInfo.nama}
                </a>
              ) : (
                <h4 className="font-extrabold text-gray-900 text-xs leading-tight truncate">
                  {lecturerInfo.nama}
                </h4>
              )}
              <p className="text-[10px] text-gray-700 truncate mt-0.5">
                {lecturerInfo.role}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600">
          <span className="text-center sm:text-left">
            D4 Teknik Informatika — Politeknik Negeri Manado
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary-950 text-white rounded-xl font-bold hover:bg-primary-900 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
