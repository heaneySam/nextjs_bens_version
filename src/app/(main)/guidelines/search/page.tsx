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

export default function SearchPage() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // Debounce the search input by 0.5s
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to page 1 when filter changes
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    async function fetchGuidelines() {
      try {
        const res = await fetch("/api/guidelines/minimal/", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch guidelines");
        const data = await res.json();
        // Sort by viewcount descending (default)
        data.sort((a: Guideline, b: Guideline) => (b.viewcount ?? 0) - (a.viewcount ?? 0));
        setGuidelines(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchGuidelines();
  }, []);

  const filtered = guidelines.filter(g => {
    const q = debouncedSearch.toLowerCase();
    return (
      g.name?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: 32, background: "#fff", minHeight: "100vh" }}>
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
        />
      )}
    </div>
  );
}

