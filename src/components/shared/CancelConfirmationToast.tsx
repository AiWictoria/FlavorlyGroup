import { Row, Col, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';

interface CancelConfirmationToastProps {
  message: string;
  onConfirm: () => Promise<void>;
  confirmText?: string;
  cancelText?: string;
}

export default function CancelConfirmationToast({
  message,
  onConfirm,
  confirmText = "Delete",
  cancelText = "Cancel"
}: CancelConfirmationToastProps) {
  return (
    <div className="fixed-top vh-100 vw-100 d-flex align-items-center justify-content-center" 
         style={{ background: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}>
      <Row className="bg-white p-3 rounded shadow d-flex flex-column gap-2 mx-3" 
           style={{ minWidth: '300px', maxWidth: '400px' }}>
        <Col>
          <p className="text-center mb-3">{message}</p>
          <div className="d-flex justify-content-center gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => toast.dismiss()}
            >
              {cancelText}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                toast.dismiss();
                await onConfirm();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}