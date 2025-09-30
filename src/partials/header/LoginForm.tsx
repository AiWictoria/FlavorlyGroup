import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export default function LoginForm({ onBack, onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });

  function setProperty(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await login(form.email, form.password);

    if (result.success) {
      navigate("/recipes");
      window.location.reload();
      if (onSuccess) onSuccess();
    } else {
      alert("Something went wrong");
    }
  }

  return (
    <Form onSubmit={handleSubmit} className="m-2">
      <Form.Group className="p-2">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          placeholder="Enter email"
          value={form.email}
          onChange={setProperty}
          required
        />
      </Form.Group>

      <Form.Group className="p-2">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          name="password"
          placeholder="Enter password"
          value={form.password}
          onChange={setProperty}
          required
        />
      </Form.Group>

      <div className="d-flex justify-content-between m-3 p-2">
        <Button variant="outline-primary" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" type="submit">
          Sign In
        </Button>
      </div>
    </Form>
  );
}
