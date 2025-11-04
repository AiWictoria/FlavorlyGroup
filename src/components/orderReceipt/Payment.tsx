import { Col, Row, Alert } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import PayNowButton from "@orders/components/PayNowButton";
interface PaymentProps {
  onNext: () => void;
  onBack: () => void;
}
export default function Payment({ onNext, onBack }: PaymentProps) {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  return (
    <>
      <Row className="mt-3 g-2 justify-content-center">
        <Col xs={10}>
          {status === "cancelled" && (
            <Alert variant="warning">You cancelled the payment.</Alert>
          )}
          {status === "failed" && (
            <Alert variant="danger">The payment failed. Please try again.</Alert>
          )}
        </Col>

        <Col xs={10}>
          <h2>This is Payment</h2>
          <button onClick={onNext}>Next</button>
          <button onClick={onBack}>Back</button>
        </Col>
      </Row>

      <Row className="mt-3 g-2 justify-content-center">
        <Col>
          <PayNowButton />
        </Col>
      </Row>
    </>
  );
}
