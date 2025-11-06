import { useState, useEffect } from 'react';
import { Container, Alert, Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { OrderTable } from '../components/OrderTable';
import { OrderStats } from '../components/OrderStats';
import type { Order } from '@models/order.types';
import { fetchOrders, deleteOrder } from '../api/data.mock';
import toast from 'react-hot-toast';

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
    toast.custom((t) => (
      <div className="fixed-top vh-100 vw-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}>
        <Row className="bg-white p-3 rounded shadow d-flex flex-column gap-2 mx-3" style={{ minWidth: '300px', maxWidth: '400px' }}>
          <Col>
            <p className="text-center mb-3">Är du säker på att du vill avbryta den här ordern?</p>
            <div className="d-flex justify-content-center gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => toast.dismiss(t.id)}
              >
                Avbryt
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    await deleteOrder(orderId);
                    loadOrders();
                  } catch (err) {
                    setError('Failed to cancel the order');
                  }
                }}
              >
                Confirm
              </Button>
            </div>
          </Col>
        </Row>
      </div>
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
        <div className="text-center">Laddar ordrar...</div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}
      
      {orders.length === 0 ? (
        <div className="text-center">Inga ordrar hittades</div>
      ) : (
        <div>
          <OrderStats orders={orders} />
          <div className="table-wrapper">
            <div className="table-container">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
              <h2 className="mb-0 text-center text-md-start">
                {selectedTab === 'completed' && 'Färdiga ordrar'}
                {selectedTab === 'pending' && 'Aktuella ordrar'}
                {selectedTab === 'cancelled' && 'Avbrutna ordrar'}
              </h2>
              <ButtonGroup className="d-flex flex-wrap justify-content-center">
                <Button 
                  variant={selectedTab === 'pending' ? "primary" : "outline-primary"}
                  onClick={() => setSelectedTab('pending')}
                  className="flex-grow-0"
                >
                  Aktuella
                </Button>
                <Button 
                  variant={selectedTab === 'completed' ? "primary" : "outline-primary"}
                  onClick={() => setSelectedTab('completed')}
                  className="flex-grow-0"
                >
                  Färdiga
                </Button>
                <Button 
                  variant={selectedTab === 'cancelled' ? "primary" : "outline-primary"}
                  onClick={() => setSelectedTab('cancelled')}
                  className="flex-grow-0"
                >
                  Avbrutna
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
