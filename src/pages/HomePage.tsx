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
          <h1 className="text-light">Share, Cook, Enjoy</h1>
          <h3 className="text-light">Find your new favorite recipes</h3>
          <div className="gap-3">
            <Button variant="light">Browse Recipes</Button>
            <Button variant="outline-light">Share a Recipe</Button>
          </div>
        </Col>
      </Row>
    </>
  );
}
