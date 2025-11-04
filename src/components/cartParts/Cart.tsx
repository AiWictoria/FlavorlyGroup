import { Col, Row } from "react-bootstrap";
import TotalBox from "./TotalBox";
import CartItem from "./CartItem";
interface CartProps {
  onNext: () => void;
}
export default function Cart({ onNext }: CartProps) {
  return (
    <>
      <Row>
        <Col>
          <h2>Detta är Cart</h2>
          <CartItem></CartItem>
          <button onClick={onNext}>Next</button>
          <TotalBox
            buttonLable="Delivery"
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
