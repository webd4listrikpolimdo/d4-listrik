"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { HiOutlineXMark, HiOutlineCodeBracket, HiArrowTopRightOnSquare } from "react-icons/hi2";
import { FaLinkedinIn, FaInstagram, FaGithub } from "react-icons/fa6";
import { devTeam, lecturerInfo } from "@/lib/devTeam";

interface DevTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AvatarProps {
  url?: string | null;
  initials: string;
  gradient: string;
  className?: string;
  sizeClass: string;
}

function Avatar({ url, initials, gradient, className = "", sizeClass }: AvatarProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [url]);

  if (url && !error) {
    return (
      <img
        src={url}
        alt={initials}
        onError={() => setError(true)}
        className={`${sizeClass} rounded-full object-cover shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0 ${className}`}>
      {initials}
    </div>
  );
}

export default function DevTeamModal({ isOpen, onClose }: DevTeamModalProps) {
  const [mounted, setMounted] = useState(false);
  const [developers, setDevelopers] = useState<any[]>(devTeam);
  const [lecturer, setLecturer] = useState<any>(lecturerInfo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !mounted) return;

    const loadDevelopers = async () => {
      try {
        const res = await fetch("/api/developers");
        if (!res.ok) throw new Error("Gagal mengambil data pengembang");
        const data = await res.json();
        
        if (data && typeof data === "object" && "developers" in data) {
          if (Array.isArray(data.developers) && data.developers.length > 0) {
            setDevelopers(data.developers);
          }
          if (data.lecturer) {
            setLecturer(data.lecturer);
          }
        } else if (Array.isArray(data) && data.length > 0) {
          setDevelopers(data);
        }
      } catch (err) {
        console.error("Error loading developers from database, falling back to static list:", err);
        setDevelopers(devTeam);
        setLecturer(lecturerInfo);
      } finally {
        setLoading(false);
      }
    };

    loadDevelopers();
  }, [isOpen, mounted]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white text-gray-900 w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] rounded-3xl border border-slate-200/80 shadow-2xl p-5 sm:p-6 md:p-8 relative overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-600 via-accent-400 to-indigo-600 flex-shrink-0" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer z-10 flex-shrink-0"
          aria-label="Tutup"
        >
          <HiOutlineXMark className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-5 sm:gap-6 min-h-0 pt-2 pb-2">
          {/* Header */}
          <div className="text-left pr-8 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100/70 border border-primary-200 text-primary-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
              <HiOutlineCodeBracket className="w-3.5 h-3.5" /> Project Based Learning (PBL)
            </span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-primary-950 leading-tight">
              Tim Pengembang Website
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 mt-1.5">
              Website ini dikembangkan oleh Kelompok 2 Kelas 6TI7, Program Studi <strong>D4 Teknik Informatika</strong>, Politeknik Negeri Manado sebagai bagian dari Project Based Learning (PBL) mata kuliah <strong>Teknologi Web</strong>.
            </p>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {developers.map((member, idx) => {
              // Detect social platform from link
              const getSocialInfo = (url?: string) => {
                if (!url) return null;
                const lower = url.toLowerCase();
                if (lower.includes("linkedin.com")) return { Icon: FaLinkedinIn, label: "LinkedIn", color: "text-[#0A66C2] bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border-[#0A66C2]/20" };
                if (lower.includes("instagram.com")) return { Icon: FaInstagram, label: "Instagram", color: "text-[#E4405F] bg-[#E4405F]/10 hover:bg-[#E4405F]/20 border-[#E4405F]/20" };
                if (lower.includes("github.com")) return { Icon: FaGithub, label: "GitHub", color: "text-gray-800 bg-gray-100 hover:bg-gray-200 border-gray-200" };
                return { Icon: HiArrowTopRightOnSquare, label: "Link", color: "text-primary-600 bg-primary-50 hover:bg-primary-100 border-primary-200" };
              };
              const social = getSocialInfo(member.link);

              return (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 pt-5 flex flex-col items-center text-center shadow-sm relative group hover:border-primary-300 transition-colors duration-200 overflow-hidden"
              >
                {/* Background Role Pattern */}
                <div
                  className="absolute inset-0 pointer-events-none select-none overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className={`font-black uppercase ${
                      idx === 0
                        ? 'text-primary-600'
                        : idx === 1
                        ? 'text-amber-500'
                        : 'text-indigo-500'
                    }`}
                    style={{
                      fontSize: '11px',
                      opacity: 0.12,
                      lineHeight: '2.2',
                      letterSpacing: '0.08em',
                      whiteSpace: 'nowrap',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '1500px',
                      height: '1500px',
                      transform: 'translate(-50%, -50%) rotate(-18deg)',
                    }}
                  >
                    {Array.from({ length: 80 }).map((_, row) => (
                      <div key={row} style={{ marginLeft: row % 2 === 0 ? '0px' : '40px' }}>
                        {Array.from({ length: 20 }).map((_, col) => (
                          <span key={col} style={{ marginRight: '20px' }}>{member.role}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {member.link ? (
                  <a
                    href={member.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-2.5 sm:mb-3.5 mt-2"
                  >
                    <Avatar
                      url={member.foto_url}
                      initials={member.initials}
                      gradient={member.gradient}
                      sizeClass="w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg"
                    />
                  </a>
                ) : (
                  <div className="mb-2.5 sm:mb-3.5 mt-2">
                    <Avatar
                      url={member.foto_url}
                      initials={member.initials}
                      gradient={member.gradient}
                      sizeClass="w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg"
                    />
                  </div>
                )}
                
                {member.link ? (
                  <a
                    href={member.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-extrabold text-gray-900 hover:text-primary-600 text-xs sm:text-sm leading-tight mb-1 truncate w-full hover:underline transition-colors duration-150"
                  >
                    {member.nama}
                  </a>
                ) : (
                  <h3 className="font-extrabold text-gray-900 text-xs sm:text-sm leading-tight mb-1 truncate w-full">
                    {member.nama}
                  </h3>
                )}
                
                <code className="text-[10px] sm:text-xs bg-gray-200/85 text-gray-800 font-mono px-2 py-0.5 rounded-md mb-2.5 select-all">
                  NIM. {member.nim}
                </code>

                {social && member.link && (
                  <a
                    href={member.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors duration-150 ${social.color}`}
                    title={`Kunjungi ${social.label}`}
                  >
                    <social.Icon className="w-3 h-3" />
                    {social.label}
                  </a>
                )}
              </div>
              );
            })}
          </div>

          {/* Lecturer Section */}
          <div className="pt-3 border-t border-gray-100 flex flex-col items-center">
            <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-2.5 font-bold">
              Dosen Pengajar
            </span>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-3.5 flex items-center gap-4 w-full hover:border-primary-300 transition-all duration-200 group">
              {lecturer.link ? (
                lecturer.link.startsWith("/") ? (
                  <Link
                    href={lecturer.link}
                    onClick={onClose}
                  >
                    <Avatar
                      url={lecturer.foto_url}
                      initials={lecturer.initials}
                      gradient="from-primary-950 to-primary-900"
                      sizeClass="w-14 h-14 text-sm"
                    />
                  </Link>
                ) : (
                  <a
                    href={lecturer.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Avatar
                      url={lecturer.foto_url}
                      initials={lecturer.initials}
                      gradient="from-primary-950 to-primary-900"
                      sizeClass="w-14 h-14 text-sm"
                    />
                  </a>
                )
              ) : (
                <div>
                  <Avatar
                    url={lecturer.foto_url}
                    initials={lecturer.initials}
                    gradient="from-primary-950 to-primary-900"
                    sizeClass="w-14 h-14 text-sm"
                  />
                </div>
              )}
              <div className="text-left min-w-0">
                {lecturer.link ? (
                  lecturer.link.startsWith("/") ? (
                    <Link
                      href={lecturer.link}
                      onClick={onClose}
                      className="font-extrabold text-gray-900 hover:text-primary-600 text-sm leading-tight block truncate hover:underline transition-colors"
                    >
                      {lecturer.nama}
                    </Link>
                  ) : (
                    <a
                      href={lecturer.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-extrabold text-gray-900 hover:text-primary-600 text-sm leading-tight block truncate hover:underline transition-colors"
                    >
                      {lecturer.nama}
                    </a>
                  )
                ) : (
                  <h4 className="font-extrabold text-gray-900 text-sm leading-tight truncate">
                    {lecturer.nama}
                  </h4>
                )}
                <p className="text-xs text-gray-600 truncate mt-1">
                  {lecturer.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-500 flex-shrink-0">
          <span className="text-center sm:text-left font-medium">
            D4 Teknik Informatika — Politeknik Negeri Manado
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-primary-950 text-white rounded-xl font-bold hover:bg-primary-900 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
