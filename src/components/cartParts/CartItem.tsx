import { Col, Row } from "react-bootstrap";
import QuantitySelector from "../QuantitySelector";
import Divider from "../shared/Divider";
interface CartItemProps {}
export default function CartItem({}: CartItemProps) {
  return (
    <>
      <Row className="item-wrapper py-3 mb-3 align-items-top border-bottom">
        <Col xs="auto">
          <img src="images/start.jpg"></img>
        </Col>
        <Col>
          <h5>Sugar (300g)</h5>
          <QuantitySelector onChange={() => ""} value={1}></QuantitySelector>
        </Col>
        <Col xs="auto" className="text-end">
          <h4>39 kr</h4>
        </Col>
      </Row>
    </>
  );
}
