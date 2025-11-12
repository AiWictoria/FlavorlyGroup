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
      console.log(`[ClearCartButton] Deleting cart ${cartId}`);
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
      console.log("[ClearCartButton] Old cart deleted successfully");
      toast.success("Gammal kundkorg raderad");

      // Step 2: POST new empty cart
      console.log("[ClearCartButton] Creating new empty cart");
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
      console.log("[ClearCartButton] New empty cart created successfully");
      toast.success("Ny tom kundkorg skapad");

      // Step 3: Navigate to home page
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("[ClearCartButton] Error:", error);
      toast.error("Kunde inte rensa kundkorgen");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-100"
      onClick={handleClearCart}
      disabled={isLoading}
    >
      {isLoading ? "Rensa kundkorg..." : "Tillbaka till startsida"}
    </Button>
  );
}
