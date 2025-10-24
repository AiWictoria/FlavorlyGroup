import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";

interface SignupFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export default function SignupForm({ onBack }: SignupFormProps) {
  const { createUser } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
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
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="username"
          name="username"
          placeholder="Enter username"
          value={form.username}
          onChange={setProperty}
          required
        />
      </Form.Group>
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
      <Form.Group className="p-2">
        <Form.Label>First Name</Form.Label>
        <Form.Control
          type="text"
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={setProperty}
          required
        />
      </Form.Group>
      <Form.Group className="p-2">
        <Form.Label>Last Name</Form.Label>
        <Form.Control
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={setProperty}
          required
        />
      </Form.Group>

      <Form.Group className="p-2">
        <Form.Label>Phone</Form.Label>
        <Form.Control
          type="phone"
          name="phone"
          placeholder="Phone number"
          value={form.phone}
          onChange={setProperty}
          required
        />
      </Form.Group>

      <div className="d-flex justify-content-between m-3 p-2">
        <Button variant="outline-primary" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" type="submit">
          Sign up
        </Button>
      </div>
    </Form>
  );
}
