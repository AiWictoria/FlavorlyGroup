import { Form, Row, Col } from "react-bootstrap";
import FormField from "./FormField";

interface DeliveryFormProps {
  formData: {
    address: string;
    postcode: string;
    city: string;
    deliveryType: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DeliveryForm({
  formData,
  onChange,
}: DeliveryFormProps) {
  return (
    <Form className="mt-4 fs-6">
      <FormField
        label="Adress"
        placeholder="Gata 123"
        name="address"
        value={formData.address}
        onChange={onChange}
      />
      <Row>
        <Col xs={12} sm={4}>
          <FormField
            label="Postnummer"
            placeholder="123 45"
            name="postcode"
            value={formData.postcode}
            onChange={onChange}
          />
        </Col>
        <Col xs={12} sm={8}>
          <FormField
            label="Stad"
            placeholder="Stad"
            name="city"
            value={formData.city}
            onChange={onChange}
          />
        </Col>
        <Col xs={12} md={8} className="mt-4">
          <h6 className="my-3">Leveransmetod </h6>
          <div className="d-flex justify-content-between align-items-center py-3">
            <Form.Check
              type="radio"
              id="express"
              name="deliveryType"
              label="Express (Inom 1 timme)"
              value="express"
              checked={formData.deliveryType === "express"}
              onChange={onChange}
            />
            <span className="ms-2">119 kr</span>
          </div>

          <div className="d-flex justify-content-between align-items-center py-3">
            <Form.Check
              type="radio"
              id="standard"
              name="deliveryType"
              label="Standard (16:00 - 19:00)"
              value="standard"
              checked={formData.deliveryType === "standard"}
              onChange={onChange}
            />
            <span className="ps-2">49 kr</span>
          </div>
        </Col>
      </Row>
    </Form>
  );
}
