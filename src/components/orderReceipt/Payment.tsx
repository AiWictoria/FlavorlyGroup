import { Col, Row } from "react-bootstrap";

interface PaymentProps {}

export default function Payment({}: PaymentProps) {
  return (
    <>
      <Row className="mt-3 g-2 justify-content-center">
        <Col xs={10} className="mx-auto">
          <h2 className="text-center mb-4">Betalning misslyckad</h2>

          <p className="text-center">Ingen debitering har skett</p>
          <p className="text-center mb-4">Vänligen försök igen</p>
        </Col>
      </Row>
    </>
  );
}
