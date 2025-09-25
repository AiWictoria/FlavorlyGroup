import { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";

export default function SignIn() {
  const [user, setUser] = useState({ email: "", password: "" });

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
    setUser({ ...user, [name]: value });
  }

  function setNewUserProperty(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (res.ok) {
      alert("INLOGGAD");
    } else {
      alert("Något gick fel!");
    }
    const data = await res.json();
    console.log(data);
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
                value={user.email}
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
                value={user.password}
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

SignIn.route = {
  path: "/signIn",
  menuLabel: "Sign In",
  index: 1,
};
