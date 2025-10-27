//tillfällig mockdata som jag bara gjort temporärt med ai för att kunna testa beställningsflödet
//tillfällig mockdata som jag bara gjort temporärt med ai för att kunna testa beställningsflödet
//tillfällig mockdata som jag bara gjort temporärt med ai för att kunna testa beställningsflödet
//tillfällig mockdata som jag bara gjort temporärt med ai för att kunna testa beställningsflödet
//tillfällig mockdata som jag bara gjort temporärt med ai för att kunna testa beställningsflödet

import type { Order, CreateOrderDto, OrderResponse, OrdersResponse, OrderStatus, OrderItem } from "../../types/order.types";

// Mockdata - realistiska beställningar
let mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "#0001",
    recipeId: "recipe-1",
    recipeName: "Tacos",
    ingredients: [
      { id: 1, amount: 8, unit: "st", ingredient: "Tortillabröd", cost: 25, checked: false },
      { id: 2, amount: 500, unit: "g", ingredient: "Köttfärs", cost: 45, checked: false },
      { id: 3, amount: 200, unit: "g", ingredient: "Gurka", cost: 8, checked: false },
      { id: 4, amount: 200, unit: "g", ingredient: "Tomat", cost: 6, checked: false },
    ],
    customerId: "user-1",
    customerName: "Anna Svensson",
    sum: 84,
    date: "2025-10-24T10:00:00Z",
    status: "pending",
    createdAt: "2025-10-24T10:00:00Z",
    updatedAt: "2025-10-24T10:00:00Z",
  },
  {
    id: "2",
    orderNumber: "#0002",
    recipeId: "recipe-2",
    recipeName: "Köttbullar med potatismos",
    ingredients: [
      { id: 1, amount: 500, unit: "g", ingredient: "Köttbullar", cost: 40, checked: true },
      { id: 2, amount: 450, unit: "g", ingredient: "Potatismos", cost: 18, checked: true },
      { id: 3, amount: 125, unit: "g", ingredient: "Lingonsylt", cost: 15, checked: false },
      { id: 4, amount: 200, unit: "ml", ingredient: "Grädde", cost: 10, checked: false },
    ],
    customerId: "user-2",
    customerName: "Erik Karlsson",
    sum: 83,
    date: "2025-10-23T14:20:00Z",
    status: "processing",
    createdAt: "2025-10-23T14:20:00Z",
    updatedAt: "2025-10-24T09:15:00Z",
  },
  {
    id: "3",
    orderNumber: "#0003",
    recipeId: "recipe-3",
    recipeName: "Pannkakor",
    ingredients: [
      { id: 1, amount: 500, unit: "g", ingredient: "Mjöl", cost: 15, checked: true },
      { id: 2, amount: 1000, unit: "ml", ingredient: "Mjölk", cost: 12, checked: true },
      { id: 3, amount: 6, unit: "st", ingredient: "Ägg", cost: 28, checked: true },
      { id: 4, amount: 200, unit: "g", ingredient: "Sylt", cost: 15, checked: true },
    ],
    customerId: "user-3",
    customerName: "Maria Larsson",
    sum: 70,
    date: "2025-10-22T16:45:00Z",
    status: "completed",
    createdAt: "2025-10-22T16:45:00Z",
    updatedAt: "2025-10-23T11:30:00Z",
  },
  {
    id: "4",
    orderNumber: "#0004",
    recipeId: "recipe-4",
    recipeName: "Kycklinggryta",
    ingredients: [
      { id: 1, amount: 600, unit: "g", ingredient: "Kycklingfilé", cost: 55, checked: false },
      { id: 2, amount: 2, unit: "st", ingredient: "Grönsaksbuljong", cost: 6, checked: false },
      { id: 3, amount: 300, unit: "ml", ingredient: "Grädde", cost: 15, checked: false },
      { id: 4, amount: 400, unit: "g", ingredient: "Ris", cost: 12, checked: false },
    ],
    customerId: "user-4",
    customerName: "Johan Johansson",
    sum: 88,
    date: "2025-10-21T12:00:00Z",
    status: "pending",
    createdAt: "2025-10-21T12:00:00Z",
    updatedAt: "2025-10-21T12:00:00Z",
  },
  {
    id: "5",
    orderNumber: "#0005",
    recipeId: "recipe-5",
    recipeName: "Pizza",
    ingredients: [
      { id: 1, amount: 400, unit: "g", ingredient: "Pizzadeg", cost: 20, checked: true },
      { id: 2, amount: 200, unit: "ml", ingredient: "Pizzasås", cost: 15, checked: true },
      { id: 3, amount: 200, unit: "g", ingredient: "Mozzarella", cost: 25, checked: true },
      { id: 4, amount: 150, unit: "g", ingredient: "Skinka", cost: 22, checked: false },
    ],
    customerId: "user-5",
    customerName: "Lisa Larsson",
    sum: 82,
    date: "2025-10-20T18:30:00Z",
    status: "completed",
    createdAt: "2025-10-20T18:30:00Z",
    updatedAt: "2025-10-21T10:45:00Z",
  },
];

// Hjälpfunktion för att generera unikt ordernummer
function generateOrderNumber(): string {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${date}-${random}`;
}

// Simulera API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// === MOCK API FUNCTIONS ===

/**
 * Skapa ny order (simulerar POST /api/orders)
 */
export async function createOrder(orderDto: CreateOrderDto): Promise<OrderResponse> {
  await delay(500); // Simulera nätverksfördröjning

  const newOrder: Order = {
    id: String(mockOrders.length + 1),
    orderNumber: generateOrderNumber(),
    recipeId: orderDto.recipeId,
    recipeName: orderDto.recipeName,
    ingredients: orderDto.ingredients,
    customerId: orderDto.customerId,
    customerName: orderDto.customerName,
    sum: orderDto.sum,
    date: new Date().toISOString(),
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockOrders.push(newOrder);

  return {
    success: true,
    message: "Beställning mottagen",
    orderId: newOrder.id,
    orderNumber: newOrder.orderNumber,
  };
}

/**
 * Hämta alla orders (simulerar GET /api/orders)
 */
export async function fetchOrders(
  status?: OrderStatus,
  page: number = 1,
  pageSize: number = 20
): Promise<OrdersResponse> {
  await delay(300);

  let filteredOrders = [...mockOrders];

  // Filtrera på status om angiven
  if (status) {
    filteredOrders = filteredOrders.filter((order) => order.status === status);
  }

  // Sortera efter datum (nyaste först)
  filteredOrders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Paginering
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  return {
    orders: paginatedOrders,
    page,
    pageSize,
    totalCount: filteredOrders.length,
  };
}

/**
 * Hämta specifik order (simulerar GET /api/orders/:id)
 */
export async function fetchOrderById(id: string): Promise<Order | null> {
  await delay(300);

  const order = mockOrders.find((o) => o.id === id);
  return order || null;
}

/**
 * Uppdatera order status (simulerar PATCH /api/orders/:id/status)
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<OrderResponse> {
  await delay(400);

  const orderIndex = mockOrders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    return {
      success: false,
      message: "Order hittades inte",
    };
  }

  mockOrders[orderIndex].status = status;
  mockOrders[orderIndex].updatedAt = new Date().toISOString();

  return {
    success: true,
    message: "Status uppdaterad",
  };
}

/**
 * Ta bort order (simulerar DELETE /api/orders/:id)
 */
export async function deleteOrder(orderId: string): Promise<OrderResponse> {
  await delay(300);

  const orderIndex = mockOrders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    return {
      success: false,
      message: "Order hittades inte",
    };
  }

  mockOrders.splice(orderIndex, 1);

  return {
    success: true,
    message: "Order borttagen",
  };
}

/**
 * Toggle ingredient checked status
 */
export async function toggleIngredientChecked(
  orderId: string,
  ingredientId: number
): Promise<OrderResponse> {
  await delay(200);

  const order = mockOrders.find((o) => o.id === orderId);

  if (!order) {
    return {
      success: false,
      message: "Order hittades inte",
    };
  }

  const ingredient = order.ingredients.find((i: OrderItem) => i.id === ingredientId);

  if (!ingredient) {
    return {
      success: false,
      message: "Ingrediens hittades inte",
    };
  }

  ingredient.checked = !ingredient.checked;
  order.updatedAt = new Date().toISOString();

  return {
    success: true,
    message: "Ingrediens uppdaterad",
  };
}

/**
 * Hämta statistik
 */
export async function getOrderStats() {
  await delay(200);

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter((o) => o.status === "pending").length,
    processing: mockOrders.filter((o) => o.status === "processing").length,
    completed: mockOrders.filter((o) => o.status === "completed").length,
    cancelled: mockOrders.filter((o) => o.status === "cancelled").length,
    totalRevenue: mockOrders.reduce((sum, order) => sum + order.sum, 0),
  };

  return stats;
}