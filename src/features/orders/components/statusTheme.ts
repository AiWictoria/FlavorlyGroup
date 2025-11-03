import type { OrderStatus } from "@models/order.types";
import "bootstrap-icons/font/bootstrap-icons.css";
type StatusTheme = {
    surface: string;
    button: string;
    iconClass: string;
    buttonText: string;
};

export const STATUS_THEME: Record<OrderStatus, StatusTheme> = {
    pending: {
        surface: "bg-danger text-white",
        button: "btn btn-danger text-white",
        iconClass: "bi-cart",
        buttonText: "Begin processing"
    },
    processing: {
        surface: "bg-warning text-white",
        button: "btn btn-warning text-white",
        iconClass: "bi-three-dots",
        buttonText: "Mark as completed"
    },
    completed: {
        surface: "bg-success text-white",
        button: "btn btn-success text-white",
        iconClass: "bi-check-lg",
        buttonText: "Notify customer"
    },
    cancelled: {
        surface: "bg-secondary-subtle text-danger border-bottom border-danger",
        button: "btn btn-outline-danger",
        iconClass: "bi-x-lg",
        buttonText: "Order cancelled"
    }
} as const;

export const surfaceFor = (s: OrderStatus) => STATUS_THEME[s].surface;
export const buttonFor = (s: OrderStatus) => STATUS_THEME[s].button;
export const iconClassFor = (s: OrderStatus) => STATUS_THEME[s].iconClass;
export const buttonTextFor = (s: OrderStatus) => STATUS_THEME[s].buttonText;
