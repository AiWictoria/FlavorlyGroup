import { Col, Row, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

NotAuthorizedPage.route = {
  path: "/notAuthorized",
};

export default function NotAuthorizedPage() {
  return (
    <>
      <Row className="d-flex justify-content-center align-items-center p-5 mt-5">
        <Col>
          <h2 className="mt-3">Access Denied</h2>
          <p className="mt-4">
            You don’t have permission to view this page or perform this action
          </p>
          <Button as={Link as any} to="/" className="p-2 mt-3">
            Back to start page
          </Button>
        </Col>
      </Row>
    </>
  );
}
