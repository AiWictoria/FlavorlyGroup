import { Row, Col } from "react-bootstrap";

interface OrderDeliveryAdressProps {
  adress: string;
  postcode: string;
  city: string;
}

export default function OrderDeliveryAdress({
  adress,
  postcode,
  city,
}: OrderDeliveryAdressProps) {
  return (
    <>
      <Row className="mt-5 pt-5 mx-4 my-5 d-flex justify-content-center">
        <Col md={8} className="fs-5">
          <p className="fw-bold">Delivery adress:</p>
          <div>
            <p>{adress}</p>
            <div className=" d-flex gap-3">
              <p>{postcode}</p>
              <p>{city}</p>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
}
