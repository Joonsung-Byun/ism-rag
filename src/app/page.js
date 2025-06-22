"use client";
import Image from "next/image";
import Inputs from "@/components/inputs";
import PDFUploader from "@/components/PDFuploader";
import AdminHeader from "@/components/AdminHeader";
import PinModal from "@/components/PinModal";
import { useState } from "react";


export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdminClick = () => setModalOpen(true);
  const handleUserClick = () => setIsAdmin(false);
  const handleModalClose = () => setModalOpen(false);
  const handlePinSuccess = () => {
    setIsAdmin(true);
    setModalOpen(false);
  };

  return (
    <div>
      <AdminHeader isAdmin={isAdmin} onAdminClick={handleAdminClick} onUserClick={handleUserClick} />
      <PinModal open={modalOpen} onClose={handleModalClose} onSuccess={handlePinSuccess} />
      <div style={{ marginTop: 32 }}>
        {isAdmin ? <PDFUploader /> : <Inputs />}
      </div>
    </div>
  );
}
