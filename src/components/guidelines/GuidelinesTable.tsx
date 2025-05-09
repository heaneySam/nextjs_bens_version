import React from "react";

type Guideline = {
  id: number;
  name: string;
  description?: string;
  external_url?: string;
  viewcount?: number;
  medical_speciality?: string;
};

interface GuidelinesTableProps {
  guidelines: Guideline[];
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onDelete?: (id: number) => void;
}

export function GuidelinesTable({
  guidelines,
  currentPage,
  rowsPerPage,
  onPageChange,
  onDelete,
}: GuidelinesTableProps) {
  const totalPages = Math.ceil(guidelines.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const paginated = guidelines.slice(startIdx, startIdx + rowsPerPage);

  return (
    <div>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Speciality</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Views</th>
            {typeof onDelete === "function" && (
              <th style={{ border: "1px solid #ddd", padding: 8, color: '#c00', textAlign: 'center' }}>Delete</th>
            )}
          </tr>
        </thead>
        <tbody>
          {paginated.map((g) => (
            <tr
              key={g.id}
              onClick={() => {
                if (g.external_url) {
                  window.open(g.external_url, '_blank', 'noopener,noreferrer');
                }
              }}
              style={{
                cursor: g.external_url ? 'pointer' : 'default',
                background: '#fff',
                transition: 'background 0.2s',
                opacity: g.external_url ? 1 : 0.5,
                ...(g.external_url ? {} : { background: "#fafafa" })
              }}
              onMouseOver={e => {
                if (g.external_url) {
                  e.currentTarget.style.background = "#f5f5f5";
                }
              }}
              onMouseOut={e => {
                if (g.external_url) {
                  e.currentTarget.style.background = "#fff";
                }
              }}
              tabIndex={g.external_url ? 0 : -1}
              role={g.external_url ? 'link' : undefined}
              aria-label={g.external_url ? g.name : undefined}
              aria-disabled={!g.external_url}
            >
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{g.name}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{g.medical_speciality}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{g.viewcount}</td>
              {typeof onDelete === "function" && (
                <td style={{ border: "1px solid #ddd", padding: 8, textAlign: 'center' }}>
                  <button
                    type="button"
                    aria-label={`Delete ${g.name}`}
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(g.id);
                    }}
                    style={{
                      background: '#fff',
                      color: '#c00',
                      border: '1px solid #c00',
                      borderRadius: 4,
                      padding: '4px 12px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '1rem',
                    }}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            marginRight: 8,
            padding: "6px 16px",
            borderRadius: 4,
            border: "1px solid #ccc",
            background: currentPage === 1 ? "#eee" : "#fff",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          Prev
        </button>
        <span style={{ alignSelf: "center" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            marginLeft: 8,
            padding: "6px 16px",
            borderRadius: 4,
            border: "1px solid #ccc",
            background: currentPage === totalPages ? "#eee" : "#fff",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}