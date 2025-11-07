import { useState, useEffect } from 'react';
import { Container, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { OrderTable } from '../components/OrderTable';
import { OrderStats } from '../components/OrderStats';
import type { Order } from '@models/order.types';
import { fetchOrders, deleteOrder } from '../api/data.mock';
import toast from 'react-hot-toast';
import CancelConfirmationToast from '../../../components/shared/CancelConfirmationToast';

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
    toast.custom(() => (
      <CancelConfirmationToast
        message="Are you sure you want to cancel this order?"
        onConfirm={async () => {
          try {
            await deleteOrder(orderId);
            loadOrders();
          } catch (err) {
            setError('Failed to cancel the order');
          }
        }}
        confirmText="Confirm"
      />
    ), {
      duration: Infinity,
      style: {
        background: 'transparent',
        boxShadow: 'none',
        maxWidth: '100%',
        padding: 0,
      }
    });
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
        <div>
          <OrderStats orders={orders} />
          <div className="table-wrapper">
            <div className="table-container">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
              <h2 className="mb-0 text-center text-md-start">
                {selectedTab === 'completed' && 'Completed Orders'}
                {selectedTab === 'pending' && 'Current Orders'}
                {selectedTab === 'cancelled' && 'Cancelled Orders'}
              </h2>
              <ButtonGroup className="d-flex flex-wrap justify-content-center">
                <Button 
                  variant={selectedTab === 'pending' ? "primary" : "outline-primary"}
                  onClick={() => setSelectedTab('pending')}
                  className="flex-grow-0"
                >
                  Current
                </Button>
                <Button 
                  variant={selectedTab === 'completed' ? "primary" : "outline-primary"}
                  onClick={() => setSelectedTab('completed')}
                  className="flex-grow-0"
                >
                  Completed
                </Button>
                <Button 
                  variant={selectedTab === 'cancelled' ? "primary" : "outline-primary"}
                  onClick={() => setSelectedTab('cancelled')}
                  className="flex-grow-0"
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
