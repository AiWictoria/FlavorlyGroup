import type { ReactElement } from 'react';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: string;
  context?: 'store-manager' | 'my-orders';
}

export function StatusBadge({ status, context = 'store-manager' }: StatusBadgeProps): ReactElement {
  
  const storeManagerTooltips: Record<string, string> = {
    pending: "Ny order",
    processing: "Pågående", 
    completed: "Levererad",
    cancelled: "Avbruten",
    avbruten: "Avbruten"
  };

  const storeManagerIcons: Record<string, string> = {
    pending: "bi-cart",
    processing: "bi-three-dots",
    completed: "bi-check-lg",
    cancelled: "bi-exclamation-lg",
    avbruten: "bi-exclamation-lg"
  };

  // Simplified tooltips and icons for my orders
  const myOrdersTooltips: Record<string, string> = {
    pending: "Inte klar",
    processing: "Inte klar",
    "in progress": "Inte klar", 
    "new order": "Inte klar",
    completed: "Klar",
    delivered: "Klar",
    cancelled: "Avbruten",
    avbruten: "Avbruten"
  };

  const myOrdersIcons: Record<string, string> = {
    pending: "bi-clock",
    processing: "bi-clock",
    "in progress": "bi-clock",
    "new order": "bi-clock", 
    completed: "bi-check-lg",
    delivered: "bi-check-lg",
    cancelled: "bi-exclamation-lg",
    avbruten: "bi-exclamation-lg"
  };

  const tooltips = context === 'my-orders' ? myOrdersTooltips : storeManagerTooltips;
  const icons = context === 'my-orders' ? myOrdersIcons : storeManagerIcons;
  
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');
  const contextClass = context === 'my-orders' ? 'my-orders' : '';

  return (
    <div title={tooltips[status.toLowerCase()] || status} className={`status-icon ${statusClass} ${contextClass}`}>
      <i className={`bi ${icons[status.toLowerCase()] || icons.pending}`}></i>
    </div>
  );
}
