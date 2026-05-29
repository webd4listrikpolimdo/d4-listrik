import React from "react";
import { 
  FaMapMarkerAlt, FaEnvelope, FaPhone, FaInstagram, FaFacebook, FaYoutube, FaTwitter, FaGlobe 
} from "react-icons/fa";
import { 
  HiMapPin, HiPhone, HiEnvelope, HiOutlineUserGroup, HiOutlinePhoto, HiOutlineAcademicCap, 
  HiOutlineBookOpen, HiOutlineTrophy, HiOutlinePencilSquare, HiAcademicCap, HiUserGroup, HiBookOpen, HiTrophy 
} from "react-icons/hi2";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FaMapMarkerAlt, FaEnvelope, FaPhone, FaInstagram, FaFacebook, FaYoutube, FaTwitter, FaGlobe,
  HiMapPin, HiPhone, HiEnvelope, HiOutlineUserGroup, HiOutlinePhoto, HiOutlineAcademicCap,
  HiOutlineBookOpen, HiOutlineTrophy, HiOutlinePencilSquare, HiAcademicCap, HiUserGroup, HiBookOpen, HiTrophy
};

export default function IconRenderer({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name];
  if (!Icon) {
    // Fallback icon
    return <FaGlobe className={className} />;
  }
  return <Icon className={className} />;
}
