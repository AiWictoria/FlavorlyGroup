import type { ReactElement } from 'react';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: string;
  context?: 'store-manager' | 'my-orders';
}

export function StatusBadge({ status, context = 'store-manager' }: StatusBadgeProps): ReactElement {
  
  const storeManagerTooltips: Record<string, string> = {
    pending: "New Order",
    processing: "In Progress", 
    completed: "Delivered",
    cancelled: "Cancelled",
    avbruten: "Cancelled"
  };

  const storeManagerIcons: Record<string, string> = {
    pending: "bi-cart",
    processing: "bi-three-dots",
    completed: "bi-check-lg",
    cancelled: "bi-x-lg",
    avbruten: "bi-x-lg"
  };

  // Simplified tooltips and icons for my orders
  const myOrdersTooltips: Record<string, string> = {
    pending: "Not Ready",
    processing: "Not Ready",
    "in progress": "Not Ready", 
    "new order": "Not Ready",
    completed: "Ready",
    delivered: "Ready",
    cancelled: "Cancelled",
    avbruten: "Cancelled"
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
