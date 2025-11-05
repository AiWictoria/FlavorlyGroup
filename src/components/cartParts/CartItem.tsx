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

        <Col>
          <h5>{name}</h5>
          <QuantitySelector
            value={quantity}
            onChange={handleQuantityChange}
          ></QuantitySelector>
        </Col>

        <Col xs="auto" className="text-end">
          <h4>{totalPrice}kr</h4>
        </Col>
      </Row>
    </>
  );
}
