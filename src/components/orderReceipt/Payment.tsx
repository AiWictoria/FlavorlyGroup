import { Col, Row } from "react-bootstrap";
interface PaymentProps {
  onNext: () => void;
  onBack: () => void;
}
export default function Payment({ onNext, onBack }: PaymentProps) {
  return (
    <>
      <Row className="mt-3 g-2 justify-content-center">
        <Col>
          <h2>Detta är Payment</h2>
          <button onClick={onNext}>Next</button>
          <button onClick={onBack}>Back</button>
        </Col>
      </Row>
    </>
  );
}
