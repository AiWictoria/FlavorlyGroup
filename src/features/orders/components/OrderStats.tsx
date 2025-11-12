import { Row, Col } from 'react-bootstrap';
import type { Order } from '@models/order.types';
import './OrderStats.css';

interface OrderStatsProps {
  orders: Order[];
}

export function OrderStats({ orders }: OrderStatsProps) {
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    completed: orders.filter(o => o.status === "completed").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    totalRevenue: orders.reduce((sum, order) => sum + order.sum, 0)
  };

  const activeOrders = stats.pending + stats.processing;
  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="stats-container">
      <Row className="g-3 p-4">
        <Col sm={6} lg={3}>
          <div className="stats-card">
            <div className="stats-icon pending">
              <i className="bi bi-clock"></i>
            </div>
            <div className="stats-content">
              <div className="stats-value-wrapper">
                <div className="stats-value">{activeOrders}</div>
              </div>
              <div className="stats-label">Aktiva ordrar</div>
              <div className="stats-detail-wrapper">
                <div className="stats-detail">
                  <span className="stats-detail-item">
                    <i className="bi bi-cart"></i> {stats.pending} väntar
                  </span>
                  <span className="stats-detail-item">
                    <i className="bi bi-three-dots"></i> {stats.processing} pågående
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col sm={6} lg={3}>
          <div className="stats-card">
            <div className="stats-icon completed">
              <i className="bi bi-check-lg"></i>
            </div>
            <div className="stats-content">
              <div className="stats-value-wrapper">
                <div className="stats-value">{completionRate}%</div>
              </div>
              <div className="stats-label">Slutförda</div>
              <div className="stats-detail-wrapper">
                <div className="stats-detail">
                  <span className="stats-detail-item">
                    <i className="bi bi-check-lg"></i> {stats.completed} levererade
                  </span>
                  <span className="stats-detail-item">
                    <i className="bi bi-exclamation-lg"></i> {stats.cancelled} avbrutna
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col sm={6} lg={3}>
          <div className="stats-card">
            <div className="stats-icon orders">
              <i className="bi bi-boxes"></i>
            </div>
            <div className="stats-content">
              <div className="stats-value-wrapper">
                <div className="stats-value">{stats.total}</div>
              </div>
              <div className="stats-label">Totalt antal ordrar</div>
              <div className="stats-detail-wrapper">
                <div className="stats-detail">
                  Alla ordrar
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col sm={6} lg={3}>
          <div className="stats-card">
            <div className="stats-icon revenue">
              <i className="bi bi-cash"></i>
            </div>
            <div className="stats-content">
              <div className="stats-value-wrapper">
                <div className="stats-value">{stats.totalRevenue.toFixed(2)} kr</div>
              </div>
              <div className="stats-label">Total försäljning</div>
              <div className="stats-detail-wrapper">
                <div className="stats-detail">
                  Totalt intjänat från alla ordrar
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}