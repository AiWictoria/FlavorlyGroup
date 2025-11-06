import { Col, Row, Button } from "react-bootstrap";
import PayNowButton from "@orders/components/PayNowButton";

interface PaymentProps {
  onBack: () => void;
  onNext: () => void;
}

export default function Payment({ onBack, onNext }: PaymentProps) {

  return (
    <>
      <Row className="mt-3 g-2 justify-content-center">
        <Col xs={10} className="mx-auto">
          
          <h2 className="text-center mb-4">Betalning misslyckad</h2>

          <p className="text-center">Ingen debitering har skett</p>
          <p className="text-center mb-4">Vänligen försök igen</p>
         
          <div className="d-flex justify-content-center gap-4 mt-4 mb-4">
            <Button variant="secondary" onClick={onBack}>
              Backa
            </Button>
            <PayNowButton label="Återuppta betalning" />
          </div>
        </Col>
      </Row>
    </>
  );
}
