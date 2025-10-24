import { Col, Row } from "react-bootstrap";
import OrderInfoSection from "../components/orderReceipt/OrderInfoSection";
import ProductInfo from "../components/orderReceipt/ProductInfo";

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
        <Row className="justify-content-center">
          <Col md={6} className="">
            <OrderInfoSection
              title="Delivery adress:"
              adress="Willgata 13B"
              postcode="123 34"
              city="Willköping"
            />
          </Col>

          <Col md={6}>
            <OrderInfoSection title="Pay method:" paymethod="Apple Pay" />
          </Col>
        </Row>

        <Row className="mt-3 g-2 justify-content-center">
          {sampleProducts.map((p) => (
            <Col key={p.id} xs={12} md={12}>
              <ProductInfo
                product={p.product}
                quantity={p.quantity}
                price={p.price}
              />
            </Col>
          ))}
        </Row>

        <div className="d-flex justify-content-end mt-3 pe-4">
          <div className="fs-5 fw-bold">Total: {total} kr</div>
        </div>
      </div>
    </>
  );
}
