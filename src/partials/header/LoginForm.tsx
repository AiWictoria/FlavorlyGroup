import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";

interface LoginFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export default function LoginForm({ onBack }: LoginFormProps) {
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });

  function setProperty(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(form.email, form.password);
  }

  return (
    <Form onSubmit={handleSubmit} className="m-2">
      <Form.Group className="p-2">
        <Form.Label>Epost</Form.Label>
        <Form.Control
          type="email"
          name="email"
          placeholder="Ange epost"
          value={form.email}
          onChange={setProperty}
          required
        />
      </Form.Group>

      <Form.Group className="p-2">
        <Form.Label>Lösenord</Form.Label>
        <Form.Control
          type="password"
          name="password"
          placeholder="Ange lösenord"
          value={form.password}
          onChange={setProperty}
          required
        />
      </Form.Group>

      <div className="d-flex justify-content-between m-3 p-2">
        <Button variant="outline-primary" onClick={onBack}>
          Tillbaka
        </Button>
        <Button variant="primary" type="submit">
          Logga in
        </Button>
      </div>
    </Form>
  );
}
