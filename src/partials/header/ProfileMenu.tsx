import { Dropdown } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import ProfileModal from "./ProfileModal";
import { useState } from "react";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleIconClick = () => {
    if (!user) setShowModal(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {user ? (
        <Dropdown align="end">
          <Dropdown.Toggle
            id="profile-menu"
            className="border-0 bg-transparent p-0 profile-toggle"
          >
            <i
              className="bi bi-person-circle fs-3 text-light mx-2 "
              role="button"
            ></i>
          </Dropdown.Toggle>

          <Dropdown.Menu className="bg-primary text-light mx-md-4 p-3">
            <Dropdown.Header className="text-light">
              Hej {user.firstName}
            </Dropdown.Header>
            <Dropdown.Divider />
            <Dropdown.Item className="text-light" onClick={handleLogout}>
              Logga ut
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <>
          <i
            className="bi bi-person-circle fs-3 text-light mx-2"
            role="button"
            onClick={handleIconClick}
          ></i>
          <ProfileModal show={showModal} onHide={() => setShowModal(false)} />
        </>
      )}
    </>
  );
}
