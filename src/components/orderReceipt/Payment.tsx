import { Col, Row, Alert, Button } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import PayNowButton from "@orders/components/PayNowButton";
interface PaymentProps {
  onNext: () => void;
  onBack: () => void;
}
export default function Payment({ onBack }: PaymentProps) {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  return (
    <>
      <h2>Detta är betalning</h2>
      <Row className="mt-3 g-2 justify-content-center">
        <Col xs={10}>
          {status === "cancelled" && (
            <Alert variant="warning">Betalningen avbröts. Ingen debitering har skett. Försök igen!</Alert>
          )}
          {status === "failed" && (
            <Alert variant="danger">Betalningen misslyckades. Vänligen försök igen.</Alert>
          )}
        </Col>

        <Col xs={10}>
          <Button variant="secondary" onClick={onBack}>Backa</Button>
        </Col>
      </Row>

      <Row className="mt-3 g-2 justify-content-center">
        <Col>
          <PayNowButton label="Återupta betalning" />
        </Col>
      </Row>
    </>
  );
}
