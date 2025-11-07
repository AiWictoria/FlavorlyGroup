import { Col, Row, Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

NotFoundPage.route = {
  path: "*",
};

export default function NotFoundPage() {
  return (
    <>
      <Row className="d-flex justify-content-center align-items-center p-5">
        <Col>
          <h2 className="mt-3">Not Found: 404</h2>
          <p className="mt-4">
            Vi beklagar, men det verkar inte finnas någon sida på den här webbplatsen som matchar webbadressen:
          </p>
          <p className="mt-4">
            <strong>{useLocation().pathname.slice(1)}</strong>
          </p>
          <Button as={Link as any} to="/" className="p-2 mt-3">
            Tillbaka till start
          </Button>
        </Col>
      </Row>
    </>
  );
}
