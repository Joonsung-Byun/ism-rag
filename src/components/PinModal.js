"use client";
import React, { useState } from "react";
import axios from "axios";

export default function PinModal({ open, onClose, onSuccess }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/check-pin", {
        pin: pin.trim()
      }
        
      );
      if (res.data.success) {
        onSuccess();
        setPin("");
      } else {
        setError("잘못된 PIN 번호입니다.");
      }
    } catch (err) {
      setError("잘못된 PIN 번호입니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 12, minWidth: 320, boxShadow: "0 2px 16px rgba(0,0,0,0.15)" }}>
        <h2 style={{ marginBottom: 16, fontWeight: 600 }}>관리자 PIN 입력</h2>
        <input
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          placeholder="PIN 번호 입력"
          style={{ width: "100%", padding: 10, fontSize: 18, borderRadius: 6, border: "1px solid #ccc", marginBottom: 12 }}
          disabled={loading}
        />
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={{ padding: "0.5rem 1.2rem", borderRadius: 6, border: "none", background: "#eee" }} disabled={loading}>취소</button>
          <button type="submit" style={{ padding: "0.5rem 1.2rem", borderRadius: 6, border: "none", background: "#222", color: "#fff", fontWeight: 600 }} disabled={loading}>{loading ? "확인 중..." : "확인"}</button>
        </div>
      </form>
    </div>
  );
}
