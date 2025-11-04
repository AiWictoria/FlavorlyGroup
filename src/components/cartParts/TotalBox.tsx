import { Button, Col, Row } from "react-bootstrap";
import Divider from "../shared/Divider";
interface TotalBoxProps {}
export default function TotalBox({}: TotalBoxProps) {
  return (
    <>
      <Divider />
      <Row>
        <Col md={6} className="px-5 mx-md-5 py-2">
          <div className="d-flex justify-content-between">
            <span>Subtotal:</span>
            <span>74 kr</span>
          </div>

          <div className="d-flex justify-content-between">
            <span>VAT (12%):</span>
            <span>10 kr</span>
          </div>
          <Divider />
          <div className="d-flex justify-content-between">
            <h4>Total:</h4>
            <h4>84 kr</h4>
          </div>
        </Col>
        <Col
          md={4}
          className="d-flex justify-content-center align-items-end px-5 px-md-0 mx-md-0 py-2"
        >
          <Button className="w-100">Delivery</Button>
        </Col>
      </Row>
    </>
  );
}
