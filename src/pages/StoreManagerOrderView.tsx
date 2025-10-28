import { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import { OrderTable } from '../components/OrderTable';
import type { Order } from '../types/order.types';
import { fetchOrders, deleteOrder } from './Services/mockOrderService';

function StoreManagerOrderViewComponent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
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
        <div className="text-center">Inga ordrar hittades</div>
      ) : (
        <OrderTable 
          orders={orders} 
          onDelete={handleDeleteOrder}
        />
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