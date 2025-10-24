import { Col, Row } from "react-bootstrap";
import OrderInfoSection from "../components/orderReceipt/OrderInfoSection";
import ProductInfo from "../components/orderReceipt/ProductInfo";
import Divider from "../components/orderReceipt/Divider";

OrderReceipt.route = {
  path: "/order",
  menuLabel: "Order",
  index: 6,
};

const sampleProducts = [
  { id: "p1", product: "Sugar", quantity: 1, price: 20 },
  { id: "p2", product: "Apples", quantity: 2, price: 39 },
  { id: "p3", product: "Banana", quantity: 1, price: 25 },
  { id: "p4", product: "Express delivery", price: 119 },
];

export default function OrderReceipt() {
  const total = sampleProducts.reduce(
    (sum, p) => sum + p.price * (p.quantity ?? 1),
    0
  );
  return (
    <>
      <div className="mt-5 pt-5">
        <Row className="mt-3 g-2 justify-content-center">
          <Col xs={10} md={6} className="">
            <OrderInfoSection
              title="Delivery adress:"
              adress="Willgata 13B"
              postcode="123 34"
              city="Willköping"
            />
          </Col>

          <Col xs={10} md={4}>
            <OrderInfoSection title="Pay method:" paymethod="Apple Pay" />
          </Col>
          <Divider />
          <Col xs={10}>
            <div className="d-flex justify-content-between align-items-center fs-5 py-2 fw-bold">
              <span className="fw-bold">Product</span>

              <span className="d-flex justify-content-end gap-5">
                <span>Quantity</span>
                <span>Price</span>
              </span>
            </div>
          </Col>
          {sampleProducts.map((p) => (
            <Col key={p.id} xs={10}>
              <ProductInfo
                product={p.product}
                quantity={p.quantity}
                price={p.price}
              />
            </Col>
          ))}
          <Divider />
          <Col xs={10} className="d-flex justify-content-end">
            <div className="fs-5 fw-bold">Total: {total} kr</div>
          </Col>
        </Row>
      </div>
    </>
  );
}
