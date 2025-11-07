import { Col, Row, Button } from "react-bootstrap";

HomePage.route = {
  path: "/",
};
export default function HomePage() {
  return (
    <>
      <div className="position-relative">
        <div className="home-bg">
          <Row className="text-center position-absolute top-50 start-50 translate-middle w-100">
            <Col>
              <h1 className="fs-1 text-light">Share, Cook, Enjoy</h1>
              <h3 className="fs-4 text-light mt-2">
                Hitta nya favoritrecept idag
              </h3>
              <div className="d-flex justify-content-center gap-3 mt-4">
                <Button className="fs-6" variant="light" href="/recipes">
                  Utforska recept
                </Button>
                <Button
                  className="fs-6"
                  variant="outline-light"
                  href="/createRecipe"
                >
                  Skapa recept
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}
