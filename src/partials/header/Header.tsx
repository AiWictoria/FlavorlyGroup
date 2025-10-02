import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import routes from "../../routes";
import ProfileMenu from "./ProfileMenu";
import SearchIcon from "./SearchIcon";

export default function Header() {
  const { user } = useAuth();

  const [expanded, setExpanded] = useState(false);

  const pathName = useLocation().pathname;
  const currentRoute = routes
    .slice()
    .sort((a, b) => (a.path.length > b.path.length ? -1 : 1))
    .find((x) => pathName.indexOf(x.path.split(":")[0]) === 0);

  const isActive = (path: string) =>
    path === currentRoute?.path || path === currentRoute?.parent;

  return (
    <header>
      <Navbar
        expanded={expanded}
        expand="md"
        className="bg-primary text-light"
        data-bs-theme="dark"
        fixed="top"
      >
        <Container fluid>
          <Navbar.Toggle
            className="mx-1"
            onClick={() => setExpanded(!expanded)}
          >
            <i
              className={`bi ${
                expanded ? "bi-x-lg" : "bi-list"
              } fs-1 text-light`}
            ></i>
          </Navbar.Toggle>

          <Navbar.Brand className="fs-2 text-light p-1" href="/">
            Flavorly
          </Navbar.Brand>

          <Navbar.Collapse
            className="order-5 order-md-4 p-2"
            id="basic-navbar-nav"
          >
            <Nav>
              {routes
                .filter((x) => {
                  if (!x.menuLabel) return false;
                  if (x.protected && !user) return false;
                  return true;
                })
                .map(({ menuLabel, path }, i) => (
                  <Nav.Link
                    as={Link}
                    key={i}
                    to={path}
                    className={isActive(path) ? "active" : ""}
                    /* close menu after selection*/
                    onClick={() => setTimeout(() => setExpanded(false), 200)}
                  >
                    {menuLabel}
                  </Nav.Link>
                ))}
            </Nav>
          </Navbar.Collapse>
          <div className="d-flex align-items-center order-md-5 gap-2">
            <SearchIcon />
            <ProfileMenu />
          </div>
        </Container>
      </Navbar>
    </header>
  );
}
