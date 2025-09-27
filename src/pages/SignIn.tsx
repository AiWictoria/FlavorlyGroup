import { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";

SignIn.route = {
  path: "signIn",
  menuLabel: "Sign In",
  index: 1,
};

export default function SignIn() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const { user, loading, login, logout, createUser } = useAuth();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const result = await createUser(
      form.email,
      form.password,
      form.firstName,
      form.lastName
    );
    if (result.success) {
      alert("Användare skapad");
    } else {
      alert("något gick fel");
      console.log(result.error);
    }
  }

  function setProperty(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await login(form.email, form.password);

    if (result.success) {
      alert("Inloggad");
    } else {
      alert("något gick fel");
      console.log(result.error);
    }
  }

  if (loading) return <p>Loading session...</p>;
  if (user) {
    return (
      <>
        <p>Hello {user.firstName}</p>
        <button onClick={logout}>Logout</button>
      </>
    );
  }
  return (
    <>
      <Row>
        <Col>
          <Form onSubmit={handleSignUp}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={setProperty}
                placeholder="Enter email"
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={setProperty}
                placeholder="Enter password"
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={setProperty}
                placeholder="First Name"
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={setProperty}
                placeholder="Last Name"
                required
              />
            </Form.Group>

            <Button type="submit">Sign Up</Button>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={setProperty}
                placeholder="Enter email"
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={setProperty}
                placeholder="Enter password"
                required
              />
            </Form.Group>

            <Button type="submit">Sign In</Button>
          </Form>

          <div className="">
            <a href="/">Forgot password?</a>
            <a href="/">Sign up!</a>
          </div>
        </Col>
      </Row>
    </>
  );
}
