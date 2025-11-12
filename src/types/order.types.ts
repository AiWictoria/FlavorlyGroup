// Order status types
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

// Order item (ingredient med pris)
export interface OrderItem {
  id: number;
  amount: number;
  unit: string;
  ingredient: string;
  cost: number;
  checked: boolean;
}

// Full order
export interface Order {
  id: string;
  orderNumber: string;
  recipeId: string;
  recipeName: string;
  ingredients: OrderItem[];
  customerId: string;
  customerName: string;
  address?: string;
  postalCode?: string;
  city?: string;
  deliverytype?: string;
  deliveryprice?: number;
  sum: number;
  date: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// DTO för att skapa order
export interface CreateOrderDto {
  recipeId: string;
  recipeName: string;
  ingredients: OrderItem[];
  customerId: string;
  customerName: string;
  sum: number;
}

// DTO för att uppdatera status
export interface UpdateStatusDto {
  status: OrderStatus;
}

// API response types
export interface OrderResponse {
  success: boolean;
  message: string;
  orderId?: string;
  orderNumber?: string;
}

export interface OrdersResponse {
  orders: Order[];
  page: number;
  pageSize: number;
  totalCount: number;
}