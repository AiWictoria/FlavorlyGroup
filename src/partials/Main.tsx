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
    <main className="d-flex flex-fill justify-content-center align-items-center">
      <Container>{element}</Container>
    </main>
  );
}
