import { Col, Row } from "react-bootstrap";
import TotalBox from "./TotalBox";
import CartItem from "./CartItem";
interface CartProps {
  onNext: () => void;
}
export default function Cart({ onNext }: CartProps) {
  return (
    <>
      <Row className="justify-content-center">
        <Col xs={10} className="mb-3">
          <h2>Cart</h2>
        </Col>
        <Col xs={12} sm={10} className="mb-sm-4 px-3 px-sm-0">
          <CartItem
            name="Arla Mellanmjölk 1.5% "
            productImage="images/start.jpg"
            unitPrice={10}
          />
        </Col>
        <Col>
          <TotalBox
            buttonLable="Delivery"
            onNext={onNext}
            products={[
              { name: "Mjölk", price: 20, quantity: 2 },
              { name: "Banan", price: 10, quantity: 1 },
            ]}
            deliveryPrice={15}
          />
        </Col>
      </Row>
    </>
  );
}
