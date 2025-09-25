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
    <main className="mt-5">
      <Container className="mt-5 mb-4">{element}</Container>
    </main>
  );
}
