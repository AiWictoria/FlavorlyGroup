import { Row, Col } from "react-bootstrap";

interface OrderInfoSectionProps {
  title: string;
  adress?: string;
  postcode?: string;
  city?: string;
  paymethod?: string;
}

export default function OrderInfoSection({
  title,
  adress,
  postcode,
  city,
  paymethod,
}: OrderInfoSectionProps) {
  return (
    <>
      <Row className="mt-5 pt-5 mx-4 my-5 d-flex justify-content-center">
        <Col md={8} className="fs-5">
          <p className="fw-bold">{title}</p>
          {adress && (
            <div>
              <p>{adress}</p>
              <div className=" d-flex gap-3">
                <p>{postcode}</p>
                <p>{city}</p>
              </div>
            </div>
          )}
          {paymethod && (
            <div>
              <p>{paymethod}</p>
            </div>
          )}
        </Col>
      </Row>
    </>
  );
}
