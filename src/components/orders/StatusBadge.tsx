import type { ReactElement } from 'react';
import './StatusBadge.css';

export function StatusBadge({ status }: { status: string }): ReactElement {
  const tooltips: Record<string, string> = {
    pending: "New Order",
    processing: "In Progress",
    completed: "Delivered",
    cancelled: "Cancelled"
  };

  const icons: Record<string, string> = {
    pending: "bi-cart",
    processing: "bi-three-dots",
    completed: "bi-check-lg",
    cancelled: "bi-x-lg"
  };

  const statusClass = status.toLowerCase();

  return (
    <div title={tooltips[status]} className={`status-icon ${statusClass}`}>
      <i className={`bi ${icons[status]}`}></i>
    </div>
  );
}
