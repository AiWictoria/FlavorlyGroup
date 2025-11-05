import { Col, Row } from "react-bootstrap";
import QuantitySelector from "../QuantitySelector";
import { useState } from "react";

interface CartItemProps {
  name: string;
  productImage?: string;
  unitPrice: number;
}

export default function CartItem({
  name,
  productImage,
  unitPrice,
}: CartItemProps) {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (newValue: number) => {
    setQuantity(newValue);
  };

  const totalPrice = unitPrice * quantity;

  return (
    <>
      <Row className="item-wrapper py-3 mb-3 align-items-top border-bottom">
        <Col xs="auto">
          <img src={productImage} alt={name}></img>
        </Col>

        <Col className="d-flex flex-column">
          <h6>{name}</h6>
          <div className="mt-auto">
            <QuantitySelector
              value={quantity}
              onChange={handleQuantityChange}
            />
          </div>
        </Col>

        <Col xs="auto" className="text-end">
          <h5>{totalPrice}kr</h5>
        </Col>
      </Row>
    </>
  );
}
