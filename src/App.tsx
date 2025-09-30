import { useLocation } from "react-router-dom";
import Header from "./partials/header/Header";
import Main from "./partials/Main";
import Footer from "./partials/Footer";

export default function App() {
  // scroll to top when the route changes
  useLocation();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <Main />
        <Footer />
      </div>
    </>
  );
}
