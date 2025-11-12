import { Button, Col, Row } from "react-bootstrap";
import Divider from "../../shared/Divider";

interface Product {
  name: string;
  price: number;
  quantity: number;
}

interface TotalBoxProps {
  buttonLable: string;
  onNext: () => void;
  products: Product[];
  deliveryPrice?: number;
  isDisabled?: boolean;
  vatRate?: number;
}

export default function TotalBox({
  buttonLable,
  onNext,
  products,
  deliveryPrice,
  isDisabled = false,
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
      <Row className="justify-content-center mx-4 mx-sm-5 mx-md-0">
        <Col md={6} className="px-sm-4 mx-2 py-2">
          <div className="d-flex justify-content-between">
            <span>Delsumma:</span>
            <span>{subtotalPrice.toFixed(2)} kr</span>
          </div>

          <div className="d-flex justify-content-between py-1">
            <span>Moms ({Math.round(vatRate * 100)}%):</span>
            <span>{vatAmount.toFixed(2)} kr</span>
          </div>

          {deliveryPrice !== undefined && (
            <div className="d-flex justify-content-between">
              <span>Leverans:</span>
              <span>{deliveryPrice.toFixed(2)} kr</span>
            </div>
          )}

          <Divider />

          <div className="d-flex justify-content-between">
            <h4>Totalt:</h4>
            <h4>{totalPrice.toFixed(2)} kr</h4>
          </div>
        </Col>
        <Col
          md={4}
          className="d-flex justify-content-center align-items-end px-sm-4 pe-md-3 mx-md-2 py-2"
        >
          <Button className="w-100" onClick={onNext} disabled={isDisabled}>
            {buttonLable}
          </Button>
        </Col>
      </Row>
    </>
  );
}
