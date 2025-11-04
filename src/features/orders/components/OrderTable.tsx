import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { Order } from '@models/order.types';
import { useState } from 'react';
import { StatusBadge } from './orders/StatusBadge';
import Box from '../../../components/orderReceipt/Box';
import './OrderTable.css';

interface OrderTableProps {
  orders: Order[];
  onDelete?: (orderId: string) => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function OrderTable({ orders, onDelete }: OrderTableProps) {
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

  const formatStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'completed';
      case 'processing':
        return 'processing';
      case 'pending':
        return 'pending';
      default:
        return status;
    }
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

  // Sort orders
  const getSortedOrders = (orders: Order[]) => {
    let sortedOrders = [...orders];

    if (statusSort) {
      sortedOrders.sort((a, b) => {
        const statusOrder: Record<Order['status'], number> = { pending: 1, processing: 2, completed: 3, cancelled: 4 };
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

  // Apply sorting to orders
  const sortedOrders = getSortedOrders(orders);

  return (
    <Box size="xl" className="order-table-container">
      <Table responsive variant="light" className="table-custom">
        <thead>
          <tr>
            <th className="status-column" style={{ width: '80px', textAlign: 'center' }}>
              <div className="header-cell-content justify-content-center" onClick={handleStatusSort} style={{ cursor: 'pointer' }}>
                <span>Status</span>
                <i className={`bi bi-arrow-down sort-icon ${statusSort === 'asc' ? 'asc' : ''}`}
                style={{ visibility: statusSort ? 'visible' : 'hidden' }}></i>
            </div>
          </th>
          <th className="order-column" style={{ width: '140px' }}>
            <div className="header-cell-content">
              <span>Order Nr.</span>
            </div>
          </th>
          <th className="name-column" style={{ minWidth: '200px' }}>
            <div className="header-cell-content">
              <span>Name</span>
            </div>
          </th>
          <th className="date-column" style={{ minWidth: '160px' }}>
            <div className="header-cell-content" onClick={handleDateSort} style={{ cursor: 'pointer' }}>
              <span>Date</span>
              <i className={`bi bi-arrow-down sort-icon ${dateSort === 'asc' ? 'asc' : ''}`}
                style={{ visibility: dateSort ? 'visible' : 'hidden' }}></i>
            </div>
          </th>
          <th className="actions-column text-end" style={{ width: '200px' }}>
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {getSortedOrders(orders).map((order: Order) => (
          <tr key={order.id} style={{ backgroundColor: '#ededed' }}>
            <td className="status-column" style={{ width: '80px', textAlign: 'center', backgroundColor: '#ededed' }}>
              <StatusBadge status={formatStatus(order.status)} />
            </td>
            <td className="order-column" style={{ width: '140px', backgroundColor: '#ededed' }}>
              <span className="order-number">
                {formatOrderNumber(order.orderNumber)}
              </span>
            </td>
            <td className="name-column" style={{ minWidth: '200px', paddingLeft: '8px', backgroundColor: '#ededed' }}>
              <span className="customer-name">{order.customerName}</span>
            </td>
            <td className="date-column" style={{ minWidth: '160px', backgroundColor: '#ededed' }}>{formatDate(order.date)}</td>
            <td className="actions-column" style={{ width: '200px', backgroundColor: '#ededed' }}>
              <div className="d-flex gap-2 justify-content-end order-actions">
                <Link to={`/orders/${order.id}`}>
                  <Button variant="outline-primary" size="sm" className="view-btn">
                    <i className="bi bi-eye me-1"></i>
                    <span>View</span>
                  </Button>
                </Link>
                {onDelete && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="delete-btn"
                    onClick={() => onDelete(order.id)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    <span>Delete</span>
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
    </Box>
  );
}
