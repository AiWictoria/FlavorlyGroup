import type { OrderStatus } from "./typer";
import type { LucideIcon } from "lucide-react"
import { ShoppingCart, Hourglass, CheckCircle, XCircle } from "lucide-react";

type StatusTheme = {
    surface: string;
    button: string;
    icon: LucideIcon;
    buttonText: string;
};

export const STATUS_THEME: Record<OrderStatus, StatusTheme> = {
    NotStarted: {
        surface: "bg-danger text-white",
        button: "btn btn-danger text-white",
        icon: ShoppingCart,
        buttonText: "Begin processing"
    },
    Started: {
        surface: "bg-warning text-white",
        button: "btn btn-warning text-white",
        icon: Hourglass,
        buttonText: "Mark as finished"
    },
    Finished: {
        surface: "bg-success text-white",
        button: "btn btn-success text-white",
        icon: CheckCircle,
        buttonText: "Notify customer"
    },
    Cancelled: {
        surface: "bg-secondary-subtle text-danger border-bottom border-danger",
        button: "btn btn-outline-danger",
        icon: XCircle,
        buttonText: "Order cancelled"
    }
} as const;

export const surfaceFor = (s: OrderStatus) => STATUS_THEME[s].surface;
export const buttonFor = (s: OrderStatus) => STATUS_THEME[s].button;
export const iconFor = (s: OrderStatus) => STATUS_THEME[s].icon;
export const buttonTextFor = (s: OrderStatus) => STATUS_THEME[s].buttonText;
