import { Col, Row, Button } from "react-bootstrap";

HomePage.route = {
  path: "/",
};
export default function HomePage() {
  return (
    <>
      <div className="home-bg"></div>

      <Row className="text-center">
        <Col>
          <h1 className="fs-1 text-light">Share, Cook, Enjoy</h1>
          <h3 className="text-light">Find your new favorite recipes now</h3>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button variant="light" href="/recipes">
              Browse Recipes
            </Button>
            <Button variant="outline-light" href="/">
              Share a Recipe
            </Button>
          </div>
        </Col>
      </Row>
    </>
  );
}
