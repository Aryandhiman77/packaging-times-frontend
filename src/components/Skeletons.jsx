import React from "react";

function Bar({ className = "", width = "100%" }) {
  return (
    <span
      className={`skeleton-bar ${className}`.trim()}
      style={{ width }}
      aria-hidden="true"
    />
  );
}

export function PageSkeleton({ compact = false }) {
  return (
    <div
      className={`api-skeleton page-skeleton ${compact ? "is-compact" : ""}`}
      aria-label="Loading content"
      aria-busy="true"
      role="status"
    >
      <Bar className="skeleton-eyebrow" width="22%" />
      <Bar className="skeleton-title" width="68%" />
      <Bar width="94%" />
      <Bar width="88%" />
      <Bar width="72%" />
      {!compact && (
        <>
          <Bar className="skeleton-gap" width="96%" />
          <Bar width="84%" />
          <Bar width="90%" />
        </>
      )}
      <span className="sr-only">Loading content</span>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="api-skeleton form-skeleton" aria-label="Loading form" aria-busy="true" role="status">
      {["78%", "72%", "82%", "68%"].map((width, index) => (
        <div className="skeleton-field" key={index}>
          <Bar width={index % 2 ? "25%" : "32%"} />
          <Bar className="skeleton-input" width={width} />
        </div>
      ))}
      <span className="sr-only">Loading form</span>
    </div>
  );
}

export function TableSkeleton({ columns = 5, rows = 6 }) {
  return (
    <div className="api-skeleton table-skeleton" aria-label="Loading records" aria-busy="true" role="status">
      {Array.from({ length: rows }, (_, row) => (
        <div
          className="skeleton-table-row"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(70px, 1fr))` }}
          key={row}
        >
          {Array.from({ length: columns }, (_, column) => (
            <Bar width={`${55 + ((row + column) % 4) * 11}%`} key={column} />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading records</span>
    </div>
  );
}

export function CardGridSkeleton({ cards = 6 }) {
  return (
    <div className="api-skeleton skeleton-card-grid" aria-label="Loading cards" aria-busy="true" role="status">
      {Array.from({ length: cards }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <Bar className="skeleton-image" />
          <Bar width="38%" />
          <Bar className="skeleton-card-title" width="74%" />
          <Bar width="88%" />
        </div>
      ))}
      <span className="sr-only">Loading cards</span>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="api-skeleton dashboard-skeleton" aria-label="Loading dashboard" aria-busy="true" role="status">
      <div className="skeleton-stats-grid">
        {Array.from({ length: 7 }, (_, index) => (
          <div className="skeleton-stat" key={index}>
            <Bar className="skeleton-stat-icon" width="44px" />
            <Bar width="58%" />
            <Bar className="skeleton-number" width="34%" />
          </div>
        ))}
      </div>
      <div className="admin-panel skeleton-dashboard-table">
        <Bar className="skeleton-title" width="24%" />
        <TableSkeleton columns={5} rows={4} />
      </div>
      <span className="sr-only">Loading dashboard</span>
    </div>
  );
}

export function LoginSkeleton() {
  return (
    <div className="login-screen" aria-label="Checking session" aria-busy="true" role="status">
      <div className="api-skeleton login-skeleton">
        <Bar className="skeleton-logo" width="220px" />
        <Bar className="skeleton-title" width="180px" />
        <Bar width="260px" />
        <Bar className="skeleton-input" width="320px" />
        <Bar className="skeleton-input" width="320px" />
      </div>
      <span className="sr-only">Checking session</span>
    </div>
  );
}

export function AdSkeleton() {
  return <div className="api-skeleton ad-skeleton" aria-hidden="true"><Bar /></div>;
}

export function InlineSkeleton({ width = "92px" }) {
  return <span className="api-skeleton inline-skeleton" aria-label="Loading" role="status"><Bar width={width} /></span>;
}
