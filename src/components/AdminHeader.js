"use client";
import React from "react";

export default function AdminHeader({ isAdmin, onAdminClick, onUserClick }) {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", borderBottom: "1px solid #eee" }}>
      <h1 style={{ fontWeight: 700, fontSize: "1.3rem" }}>ISM RAG 시스템</h1>
      {isAdmin ? (
        <button
          onClick={onUserClick}
          style={{ background: "#eee", color: "#222", border: "none", borderRadius: 6, padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: 600 }}
        >
          사용자 모드
        </button>
      ) : (
        <button
          onClick={onAdminClick}
          style={{ background: "#222", color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: 600 }}
        >
          관리자 모드
        </button>
      )}
    </header>
  );
}
