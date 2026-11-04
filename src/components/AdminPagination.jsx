import React from "react";

export default function AdminPagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <nav className="admin-pagination" aria-label="Pagination">
      <button
        type="button"
        className="admin-secondary"
        disabled={!pagination.hasPrevious}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        Previous
      </button>

      <span>
        Page {pagination.page} of {pagination.totalPages} · {pagination.total} records
      </span>

      <button
        type="button"
        className="admin-secondary"
        disabled={!pagination.hasNext}
        onClick={() => onPageChange(pagination.page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
