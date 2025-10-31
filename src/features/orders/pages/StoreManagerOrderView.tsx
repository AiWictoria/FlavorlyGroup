import { useState, useEffect } from 'react';
import { Container, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { OrderTable } from '../components/OrderTable';
import type { Order } from '@models/order.types';
import { fetchOrders, deleteOrder } from '../api/data.mock';

function StoreManagerOrderViewComponent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState<'pending' | 'completed' | 'cancelled'>('pending');

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Fetch all orders without filtering by status
      const response = await fetchOrders();
      setOrders(response.orders);
      setError('');
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
        loadOrders();
      } catch (err) {
        setError('Failed to delete the order');
      }
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">Loading orders...</div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}
      
      {orders.length === 0 ? (
        <div className="text-center">No orders found</div>
      ) : (
        <div className="table-wrapper">
          <div className="table-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="mb-0">
                {selectedTab === 'completed' && 'Completed Orders'}
                {selectedTab === 'pending' && 'Current Orders'}
                {selectedTab === 'cancelled' && 'Cancelled Orders'}
              </h2>
              <ButtonGroup>
                <Button 
                  variant={selectedTab === 'pending' ? "primary" : "outline-primary"}
                  onClick={() => setSelectedTab('pending')}
                >
                  Current Orders
                </Button>
                <Button 
                  variant={selectedTab === 'completed' ? "primary" : "outline-primary"}
                  onClick={() => setSelectedTab('completed')}
                >
                  Completed
                </Button>
                <Button 
                  variant={selectedTab === 'cancelled' ? "primary" : "outline-primary"}
                  onClick={() => setSelectedTab('cancelled')}
                >
                  Cancelled
                </Button>
              </ButtonGroup>
            </div>
            <OrderTable 
              orders={orders.filter(order => {
                if (selectedTab === 'pending') return ['pending', 'processing'].includes(order.status);
                return order.status === selectedTab;
              })}
              onDelete={handleDeleteOrder}
            />
          </div>
        </div>
      )}
    </Container>
  );
}

StoreManagerOrderViewComponent.route = {
  path: '/store-manager/orders',
  menuLabel: 'Store Manager',
  protected: true,
  index: 5
};

export default StoreManagerOrderViewComponent;
