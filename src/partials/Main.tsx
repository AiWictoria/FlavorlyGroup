
import { Container } from 'react-bootstrap';
import SignIn from '../pages/SignIn';

export default function Main() {

  return <main className="mt-5">
    <Container className="mt-5 mb-4">
      <SignIn/>
    </Container>
  </main>;
}