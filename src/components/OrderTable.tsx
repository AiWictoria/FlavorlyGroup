import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { Order } from '../types/order.types';
import type { ReactElement } from 'react';
import { useState } from 'react';
import './OrderTable.css';

interface OrderTableProps {
  orders: Order[];
  onDelete?: (orderId: string) => void;
  showCompleted?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function OrderTable({ orders, onDelete, showCompleted = false }: OrderTableProps) {
  const [statusSort, setStatusSort] = useState<SortDirection>(null);
  const [dateSort, setDateSort] = useState<SortDirection>(null);

  const handleStatusSort = () => {
    setStatusSort(current => {
      if (current === null) return 'desc';
      if (current === 'desc') return 'asc';
      return null;
    });
    setDateSort(null);
  };

  const handleDateSort = () => {
    setDateSort(current => {
      if (current === null) return 'desc';
      if (current === 'desc') return 'asc';
      return null;
    });
    setStatusSort(null);
  };

  function getStatusSymbol(status: string): ReactElement {
    const tooltips: Record<string, string> = {
      pending: "New Order",
      processing: "In Progress",
      completed: "Completed"
    };

    const icons: Record<string, string> = {
      pending: "bi-cart",
      processing: "bi-three-dots",
      completed: "bi-check-lg"
    };

    return (
      <div title={tooltips[status]} className={`status-icon ${status}`}>
        <i className={`bi ${icons[status]}`}></i>
      </div>
    );
  }

  function formatOrderNumber(orderNumber: string): string {
    // Extract just the numerical index for the order
    const index = orders.findIndex(o => o.orderNumber === orderNumber) + 1;
    return `#${String(index).padStart(4, '0')}`;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Sort and filter orders
  const getSortedOrders = (orders: Order[]) => {
    let sortedOrders = [...orders];
    
    if (statusSort) {
      sortedOrders.sort((a, b) => {
        const statusOrder = { pending: 1, processing: 2, completed: 3, cancelled: 4 };
        const comparison = statusOrder[a.status] - statusOrder[b.status];
        return statusSort === 'asc' ? comparison : -comparison;
      });
    }
    
    if (dateSort) {
      sortedOrders.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateSort === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    return sortedOrders;
  };

  // Filter orders based on showCompleted prop
  const filteredOrders = showCompleted 
    ? orders.filter(order => order.status === 'completed')
    : orders.filter(order => ['pending', 'processing'].includes(order.status));

  // Apply sorting to filtered orders
  const sortedAndFilteredOrders = getSortedOrders(filteredOrders);

  return (
    <div className="table-wrapper">
      <div className="table-container">
        <Table responsive>
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>
                <div className="header-cell-content justify-content-center" onClick={handleStatusSort} style={{ cursor: 'pointer' }}>
                  <span>Status</span>
                  <i className={`bi bi-arrow-down sort-icon ${statusSort === 'asc' ? 'asc' : ''}`} 
                     style={{ visibility: statusSort ? 'visible' : 'hidden' }}></i>
                </div>
              </th>
              <th style={{ width: '140px' }}>
                <div className="header-cell-content">
                  <span>Order Nr.</span>
                </div>
              </th>
              <th style={{ minWidth: '200px' }}>
                <div className="header-cell-content">
                  <span>Name</span>
                </div>
              </th>
              <th style={{ minWidth: '160px' }}>
                <div className="header-cell-content" onClick={handleDateSort} style={{ cursor: 'pointer' }}>
                  <span>Date</span>
                  <i className={`bi bi-arrow-down sort-icon ${dateSort === 'asc' ? 'asc' : ''}`}
                     style={{ visibility: dateSort ? 'visible' : 'hidden' }}></i>
              </div>
            </th>
            <th className="text-end" style={{ width: '200px' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedAndFilteredOrders.map((order) => (
            <tr key={order.id}>
              <td style={{ width: '80px', textAlign: 'center' }}>{getStatusSymbol(order.status)}</td>
              <td style={{ width: '140px' }}>
                <span className="order-number">
                  {formatOrderNumber(order.orderNumber)}
                </span>
              </td>
              <td style={{ minWidth: '200px' }}>{order.customerName}</td>
              <td style={{ minWidth: '160px' }}>{formatDate(order.date)}</td>
              <td style={{ width: '200px' }}>
                <div className="d-flex gap-4 justify-content-end">
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="outline-primary" size="sm">
                      <i className="bi bi-eye me-1"></i>
                      View
                    </Button>
                  </Link>
                  {onDelete && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDelete(order.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
    </div>
  );
}