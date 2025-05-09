"use client";
import React, { useEffect, useState } from "react";
import { GuidelinesTable } from "@/components/guidelines/GuidelinesTable";

type Guideline = {
  id: number;
  name: string;
  description?: string;
  external_url?: string;
  viewcount?: number;
  medical_speciality?: string;
};

export default function ManageGuidelinesPage() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;
  // Add form state
  const [form, setForm] = useState({ name: "", description: "", external_url: "", medical_speciality: "" });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch guidelines
  async function fetchGuidelines() {
    try {
      setLoading(true);
      const res = await fetch("/api/guidelines/minimal/", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch guidelines");
      const data = await res.json();
      data.sort((a: Guideline, b: Guideline) => (b.viewcount ?? 0) - (a.viewcount ?? 0));
      setGuidelines(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchGuidelines(); }, []);

  // Filtered guidelines
  const filtered = guidelines.filter(g => {
    const q = debouncedSearch.toLowerCase();
    return (
      g.name?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q)
    );
  });

  // Handle add
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true); setAddError(null);
    try {
      const res = await fetch("/api/guidelines/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add guideline");
      setForm({ name: "", description: "", external_url: "", medical_speciality: "" });
      await fetchGuidelines();
    } catch (err: any) {
      setAddError(err.message || "Unknown error");
    } finally {
      setAdding(false);
    }
  }

  // Handle delete
  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this guideline?")) return;
    try {
      console.log('Attempting to delete guideline id:', id);
      const url = `/api/guidelines/${id}/`;
      console.log('DELETE fetch URL:', url);
      const res = await fetch(url, { method: "DELETE" });
      const text = await res.text();
      console.log('DELETE response status:', res.status, 'body:', text);
      if (!res.ok) throw new Error(`Failed to delete guideline. Status: ${res.status}. Body: ${text}`);
      await fetchGuidelines();
    } catch (err: any) {
      alert(err.message || "Unknown error");
    }
  }

  return (
    <div style={{ padding: 32, background: "#fff", minHeight: "100vh" }}>
      <h2>Manage Guidelines</h2>
      <form onSubmit={handleAdd} style={{ marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input required placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
        <input placeholder="Speciality" value={form.medical_speciality} onChange={e => setForm(f => ({ ...f, medical_speciality: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
        <input placeholder="External URL" value={form.external_url} onChange={e => setForm(f => ({ ...f, external_url: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
        <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", width: 200 }} />
        <button type="submit" disabled={adding} style={{ padding: 8, borderRadius: 4, background: "#0070f3", color: "#fff", border: "none" }}>Add</button>
        {addError && <span style={{ color: "red" }}>{addError}</span>}
      </form>
      <input
        type="text"
        placeholder="Search by name or description..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          marginBottom: 24,
          padding: "12px 20px",
          fontSize: "1.1rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          outline: "none",
          width: "350px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}
      />
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "red" }}>Error: {error}</div>
      ) : (
        <GuidelinesTable
          guidelines={filtered}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}