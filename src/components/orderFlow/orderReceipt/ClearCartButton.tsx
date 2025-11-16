import { Button } from "react-bootstrap";
import { useAuth } from "../../../features/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

interface ClearCartButtonProps {
  cartId: string;
}

export default function ClearCartButton({ cartId }: ClearCartButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleClearCart = async () => {
    if (!user || !cartId) {
      toast.error("User eller cart information saknas");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: DELETE old cart
      const deleteRes = await fetch(`/api/Cart/${cartId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: [
            {
              id: user.id,
              username: user.username,
            },
          ],
        }),
      });

      if (!deleteRes.ok) {
        throw new Error("Failed to delete old cart");
      }

      // Step 2: POST new empty cart
      const createRes = await fetch("/api/Cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: [
            {
              id: user.id,
              username: user.username,
            },
          ],
        }),
      });

      if (!createRes.ok) {
        throw new Error("Failed to create new cart");
      }

      // Step 3: Navigate to home page
      setTimeout(() => {
        navigate("/MyOrders");
      }, 1000);
    } catch (error) {
      toast.error("Kunde inte rensa kundkorgen");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button className="w-100" onClick={handleClearCart} disabled={isLoading}>
      {isLoading ? "Rensa kundkorg..." : "Till mina ordrar"}
    </Button>
  );
}
