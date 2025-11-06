import { Button } from "react-bootstrap";

export default function PayNowButton({ label = "Pay Now" }) {
  const handleClick = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/stripe/create-checkout-session", {
        method: "POST",
      });

      const data = await res.json();

      if (!data?.url) {
        console.error("No checkout URL returned from backend");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to create checkout session:", error);
    }
  };

  return <Button onClick={handleClick}>{label}</Button>;
}
