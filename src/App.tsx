import { useLocation } from "react-router-dom";
import Header from "./partials/Header";
import Main from "./partials/Main";
import Footer from "./partials/Footer";
import BootstrapBreakpoints from "./parts/BootstrapBreakpoints";

// turn off when not needed for debugging
const showBootstrapBreakpoints = true;

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
        {showBootstrapBreakpoints ? <BootstrapBreakpoints /> : null}
      </div>
    </>
  );
}
