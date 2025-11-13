import { Container } from "react-bootstrap";
import { useRoutes } from "react-router-dom";
import routes from "../routes";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import AdminRoute from "../features/auth/AdminRoute";
import CustomerRoute from "../features/auth/CostumerRoute";

export default function Main() {
  const element = useRoutes(
    routes.map(
      ({ element, path, protected: isProtected, adminOnly, customerOnly }) => ({
        path,
        element: isProtected ? (
          adminOnly ? (
            <AdminRoute>{element}</AdminRoute>
          ) : customerOnly ? (
            <CustomerRoute>{element}</CustomerRoute>
          ) : (
            <ProtectedRoute>{element}</ProtectedRoute>
          )
        ) : (
          element
        ),
      })
    )
  );
  return (
    <main>
      <Container fluid className="p-0">
        {element}
      </Container>
    </main>
  );
}
