import { Col, Row } from "react-bootstrap";
interface CartProps {
  onNext: () => void;
}
export default function Cart({ onNext }: CartProps) {
  return (
    <>
      <Row>
        <Col>
          <h2>Detta är Cart</h2>
          <button onClick={onNext}>Next</button>
        </Col>
      </Row>
    </>
  );
}
