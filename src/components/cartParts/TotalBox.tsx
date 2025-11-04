import { Button, Col, Row } from "react-bootstrap";
import Divider from "../shared/Divider";

interface Product {
  name: string;
  price: number;
  quantity: number;
}

interface TotalBoxProps {
  buttonLable: string;
  products: Product[];
  deliveryPrice?: number;
  vatRate?: number;
}

export default function TotalBox({
  buttonLable,
  products,
  deliveryPrice,
  vatRate = 0.12,
}: TotalBoxProps) {
  const subtotalPrice = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
  const vatAmount = subtotalPrice - subtotalPrice / (1 + vatRate);
  const totalPrice = subtotalPrice + (deliveryPrice || 0);

  return (
    <>
      <Divider />
      <Row>
        <Col md={6} className="px-5 mx-md-5 py-2">
          <div className="d-flex justify-content-between">
            <span>Subtotal:</span>
            <span>{subtotalPrice.toFixed(2)} kr</span>
          </div>

          <div className="d-flex justify-content-between">
            <span>VAT ({Math.round(vatRate * 100)}%):</span>
            <span>{vatAmount.toFixed(2)} kr</span>
          </div>

          {deliveryPrice !== undefined && (
            <div className="d-flex justify-content-between">
              <span>Delivery:</span>
              <span>{deliveryPrice.toFixed(2)} kr</span>
            </div>
          )}

          <Divider />

          <div className="d-flex justify-content-between">
            <h4>Total:</h4>
            <h4>{totalPrice.toFixed(2)} kr</h4>
          </div>
        </Col>
        <Col
          md={4}
          className="d-flex justify-content-center align-items-end px-5 px-md-0 mx-md-0 py-2"
        >
          <Button className="w-100">{buttonLable}</Button>
        </Col>
      </Row>
    </>
  );
}
