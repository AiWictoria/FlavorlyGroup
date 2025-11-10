import { Container } from "react-bootstrap";
import { useRoutes } from "react-router-dom";
import routes from "../routes";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";

export default function Main() {
  const element = useRoutes(
    routes.map(({ element, path, protected: isProtected, adminOnly }) => ({
      path,
      element: isProtected ? (
        adminOnly ? (
          <AdminRoute>{element}</AdminRoute>
        ) : (
          <ProtectedRoute>{element}</ProtectedRoute>
        )
      ) : (
        element
      ),
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
