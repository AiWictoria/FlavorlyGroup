import { Container } from "react-bootstrap";
import { useRoutes } from "react-router-dom";
import routes from "../routes";

export default function Main() {
  const element = useRoutes(
    routes.map(({ element, path }) => ({
      path,
      element,
    }))
  );
  return (
    <main>
      <Container fluid className="p-0">
        {element}
      </Container>
    </main>
  );
}
