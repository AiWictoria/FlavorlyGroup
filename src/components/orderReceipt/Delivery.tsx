import { Col, Row } from "react-bootstrap";
interface DeliveryProps {
  onNext: () => void;
  onBack: () => void;
}
export default function Delivery({ onNext, onBack }: DeliveryProps) {
  return (
    <>
      <Row>
        <Col>
          <h2>Detta är Delivery</h2>
          <button onClick={onNext}>Next</button>
          <button onClick={onBack}>Back</button>
        </Col>
      </Row>
    </>
  );
}
