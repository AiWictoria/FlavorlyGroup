import { Col, Row, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

NotAuthorizedPage.route = {
  path: "/notAuthorized",
};

export default function NotAuthorizedPage() {
  return (
    <>
      <Row className="d-flex justify-content-center align-items-center p-5">
        <Col>
          <h2 className="mt-3">Åtkomst nekad</h2>
          <p className="mt-4">
            Du har inte behörighet att visa den här sidan eller utföra den här åtgärden
          </p>
          <Button as={Link as any} to="/" className="p-2 mt-3">
            Tillbaka till start
          </Button>
        </Col>
      </Row>
    </>
  );
}
