import { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";

SignIn.route = {
  path: "/signIn",
  menuLabel: "Sign In",
  index: 1,
};

export default function SignIn() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { user, loading, login, logout } = useAuth();

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (res.ok) {
      alert("Användare skapad");
    } else {
      alert("Något gick fel");
    }
    const data = await res.json();
    console.log(data);
  }

  function setProperty(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function setNewUserProperty(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await login(form.email, form.password);

    if (result.success) {
      alert("inloggad");
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
                value={newUser.email}
                onChange={setNewUserProperty}
                placeholder="Enter email"
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={newUser.password}
                onChange={setNewUserProperty}
                placeholder="Enter password"
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={newUser.firstName}
                onChange={setNewUserProperty}
                placeholder="First Name"
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={newUser.lastName}
                onChange={setNewUserProperty}
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
