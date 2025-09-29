import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

interface ProfileModalProps {
  show: boolean;
  onHide: () => void;
}

export default function ProfileModal({ show, onHide }: ProfileModalProps) {
  const [view, setView] = useState<"default" | "login" | "signup">("default");

  const handleClose = () => {
    setView("default");
    onHide();
  };
  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        className="d-flex justify-content-center align-items-center profile-modal"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-primary text-light custom-close"
        >
          <Modal.Title className="p-2 p-sm-2">
            {view === "default" && "Welcome to Flavorly"}
            {view === "login" && "Sign In"}
            {view === "signup" && "Create Account"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="w-100">
          {view === "default" && (
            <>
              <h5 className="p-2 p-sm-0 m-sm-4">
                Sign in or create an account to:{" "}
              </h5>
              <div className="p-2 mx-sm-4 p-sm-2 fs-6">
                <p>
                  <i className="bi bi-heart-fill mx-1 mx-sm-2" /> Save and share
                  your favorite recipes
                </p>
                <p>
                  <i className="bi bi-basket2-fill mx-1 mx-sm-2" />
                  Generate shopping list
                </p>
                <p>
                  <i className="bi bi-chat-heart mx-1 mx-sm-2" />
                  Comment, rate and discuss
                </p>
              </div>
              <div className="d-flex gap-2 gap-sm-5 mb-sm-4 justify-content-evenly">
                <Button
                  variant="outline-primary"
                  onClick={() => setView("signup")}
                >
                  Sign Up
                </Button>
                <Button variant="primary" onClick={() => setView("login")}>
                  Sign in
                </Button>
              </div>
            </>
          )}
          {view === "login" && (
            <LoginForm
              onBack={() => setView("default")}
              onSuccess={() => onHide()}
            />
          )}
          {view === "signup" && (
            <SignupForm
              onBack={() => setView("default")}
              onSuccess={() => onHide()}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
