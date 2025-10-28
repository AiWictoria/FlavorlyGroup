import { Col, Row } from "react-bootstrap";
import OrderTitle from "./OrderTitle";
import OrderInfoSection from "./OrderInfoSection";
import Divider from "./Divider";
import ProductInfo from "./ProductInfo";

const sampleProducts = [
  { id: "p1", product: "Sugar", quantity: 1, price: 20 },
  { id: "p2", product: "Apples", quantity: 2, price: 39 },
  { id: "p3", product: "Banana", quantity: 1, price: 25 },
  { id: "p4", product: "Express delivery", price: 119 },
];

export default function Confirmation() {
  const total = sampleProducts.reduce(
    (sum, p) => sum + p.price * (p.quantity ?? 1),
    0
  );
  return (
    <>
      <Row className="mt-3 g-2 justify-content-center">
        <Col xs={10}>
          <OrderTitle name="Will" />
        </Col>
        <Col xs={10} sm={6}>
          <OrderInfoSection
            title="Delivery adress:"
            adress="Willgata 13B"
            postcode="123 34"
            city="Willköping"
          />
        </Col>

        <Col xs={10} sm={4}>
          <OrderInfoSection title="Pay method:" paymethod="Apple Pay" />
        </Col>
        <Divider />
        <Col xs={10}>
          <div className="d-flex justify-content-between align-items-center fs-5 py-2 fw-bold">
            <p className="fw-bold">Product</p>

            <span className="d-flex justify-content-end gap-4">
              <p>Quantity</p>
              <p>Price</p>
            </span>
          </div>
        </Col>
        {sampleProducts.map((p, i) => (
          <Col
            key={p.id}
            xs={10}
            className={i !== sampleProducts.length - 1 ? "border-bottom" : ""}
          >
            <ProductInfo
              product={p.product}
              quantity={p.quantity}
              price={p.price}
            />
          </Col>
        ))}
        <Divider />
        <Col xs={10} className="d-flex justify-content-end">
          <h4 className="fw-bold">Total: {total} kr</h4>
        </Col>
      </Row>
    </>
  );
}
