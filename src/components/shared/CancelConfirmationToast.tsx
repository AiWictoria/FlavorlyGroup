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
    <div style={{
      position: 'absolute',
      top: '50vh',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      width: 'fit-content'
    }}>
      <div style={{
        position: 'absolute',
        background: 'rgba(0, 0, 0, 0.15)',
        width: '600px',
        height: '400px',
        borderRadius: '16px',
        filter: 'blur(40px)',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: -1
      }} />
      <Row 
        className="p-3 rounded d-flex flex-column gap-2"
        style={{ 
          minWidth: '300px', 
          maxWidth: '400px',
          background: '#fff',
          border: '1px solid #dee2e6',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}
      >
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