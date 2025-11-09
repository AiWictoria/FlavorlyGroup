import { Col, Row } from "react-bootstrap";

interface ProductInfoProps {
  product: string;
  quantity?: number;
  price: number;
}

export default function ProductInfo({
  product,
  quantity,
  price,
}: ProductInfoProps) {
  return (
    <>
      <Row className="d-flex justify-content-between align-items-center py-2">
        <Col xs={6} sm={8}>
          <p>{product}</p>
        </Col>
        <Col xs="auto" className="d-flex justify-content-end gap-5 text-end">
          {quantity !== undefined && <p>{quantity}</p>}
        </Col>
        <Col xs="auto" className=" text-end">
          <p>{price} kr</p>
        </Col>
      </Row>
    </>
  );
}
