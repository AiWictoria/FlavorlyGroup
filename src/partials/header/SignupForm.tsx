import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

interface SignupFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export default function SignupForm({ onBack }: SignupFormProps) {
  const { createUser } = useAuth();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  function setProperty(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createUser(
      form.username,
      form.email,
      form.password,
      form.firstName,
      form.lastName,
      form.phone
    );
  }

  return (
    <Form onSubmit={handleSubmit} className="m-2">
      <Form.Group className="p-2">
        <Form.Label>Användarnamn</Form.Label>
        <Form.Control
          type="username"
          name="username"
          placeholder="Ange användarnamn"
          value={form.username}
          onChange={setProperty}
          required
        />
      </Form.Group>
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
      <Form.Group className="p-2">
        <Form.Label>Förnamn</Form.Label>
        <Form.Control
          type="text"
          name="firstName"
          placeholder="Ange förnamn"
          value={form.firstName}
          onChange={setProperty}
          required
        />
      </Form.Group>
      <Form.Group className="p-2">
        <Form.Label>Efternamn</Form.Label>
        <Form.Control
          type="text"
          name="lastName"
          placeholder="Ange efternamn"
          value={form.lastName}
          onChange={setProperty}
          required
        />
      </Form.Group>

      <Form.Group className="p-2">
        <Form.Label>Telefonnummer</Form.Label>
        <Form.Control
          type="phone"
          name="phone"
          placeholder="Ange telefonnummer"
          value={form.phone}
          onChange={setProperty}
          required
        />
      </Form.Group>

      <div className="d-flex justify-content-between m-3 p-2">
        <Button variant="outline-primary" onClick={onBack}>
          Tillbaka
        </Button>
        <Button variant="primary" type="submit">
          Registrera
        </Button>
      </div>
    </Form>
  );
}
