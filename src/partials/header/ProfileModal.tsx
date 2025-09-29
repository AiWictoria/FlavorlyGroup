import { Modal } from "react-bootstrap";

interface ProfileModalProps {
  show: boolean;
  onHide: () => void;
}

export default function ProfileModal({ show, onHide }: ProfileModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Welcome to Flavorly</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p>Please log in or sign up to continue</p>
      </Modal.Body>
    </Modal>
  );
}
