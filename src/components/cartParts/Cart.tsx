import { Col, Row } from "react-bootstrap";
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
        <Col xs={10} className="mb-sm-4">
          <CartItem
            name="Arla Mellanmjölk 1.5%
            "
            productImage="images/start.jpg"
            unitPrice={10}
          />
          <CartItem
            name="Arla Mellanmjölk 1.5%
            "
            productImage="images/start.jpg"
            unitPrice={10}
          />
          <CartItem
            name="Arla Mellanmjölk 1.5%
            "
            productImage="images/start.jpg"
            unitPrice={10}
          />
          <CartItem
            name="Arla Mellanmjölk 1.5%
            "
            productImage="images/start.jpg"
            unitPrice={10}
          />
        </Col>
      </Row>
    </>
  );
}
