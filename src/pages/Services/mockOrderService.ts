import type { Order, CreateOrderDto, OrderResponse, OrdersResponse, OrderStatus, OrderItem } from "../../types/order.types";

// Mockdata - realistiska beställningar
let mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-20251024-A3F89B",
    recipeId: "recipe-001",
    recipeName: "Pasta Carbonara",
    ingredients: [
      { id: 1, amount: 400, unit: "g", ingredient: "Spaghetti", cost: 29.90, checked: false },
      { id: 2, amount: 200, unit: "g", ingredient: "Bacon", cost: 45.50, checked: false },
      { id: 3, amount: 3, unit: "st", ingredient: "Ägg", cost: 12.00, checked: false },
      { id: 4, amount: 100, unit: "g", ingredient: "Parmesan", cost: 38.90, checked: false },
    ],
    customerId: "user-123",
    customerName: "Anna Andersson",
    sum: 126.30,
    date: "2025-10-24T10:30:00Z",
    status: "pending",
    createdAt: "2025-10-24T10:30:00Z",
    updatedAt: "2025-10-24T10:30:00Z",
  },
  {
    id: "2",
    orderNumber: "ORD-20251024-B7G12C",
    recipeId: "recipe-002",
    recipeName: "Thailändsk Wok",
    ingredients: [
      { id: 1, amount: 300, unit: "g", ingredient: "Kycklingfilé", cost: 65.00, checked: true },
      { id: 2, amount: 200, unit: "g", ingredient: "Broccoli", cost: 22.00, checked: true },
      { id: 3, amount: 1, unit: "st", ingredient: "Paprika", cost: 18.50, checked: true },
      { id: 4, amount: 1, unit: "burk", ingredient: "Kokosmjölk", cost: 29.90, checked: false },
      { id: 5, amount: 1, unit: "förp", ingredient: "Ramen-nudlar", cost: 25.00, checked: false },
    ],
    customerId: "user-456",
    customerName: "Erik Eriksson",
    sum: 160.40,
    date: "2025-10-23T14:20:00Z",
    status: "processing",
    createdAt: "2025-10-23T14:20:00Z",
    updatedAt: "2025-10-24T09:15:00Z",
  },
  {
    id: "3",
    orderNumber: "ORD-20251023-C9K45D",
    recipeId: "recipe-003",
    recipeName: "Vegetarisk Lasagne",
    ingredients: [
      { id: 1, amount: 500, unit: "g", ingredient: "Lasagneplattor", cost: 32.00, checked: true },
      { id: 2, amount: 400, unit: "g", ingredient: "Ricotta", cost: 48.90, checked: true },
      { id: 3, amount: 300, unit: "g", ingredient: "Spenat", cost: 28.00, checked: true },
      { id: 4, amount: 500, unit: "g", ingredient: "Tomatsås", cost: 35.50, checked: true },
      { id: 5, amount: 200, unit: "g", ingredient: "Mozzarella", cost: 42.00, checked: true },
    ],
    customerId: "user-789",
    customerName: "Maria Svensson",
    sum: 186.40,
    date: "2025-10-22T16:45:00Z",
    status: "completed",
    createdAt: "2025-10-22T16:45:00Z",
    updatedAt: "2025-10-23T11:30:00Z",
  },
  {
    id: "4",
    orderNumber: "ORD-20251022-D2L78E",
    recipeId: "recipe-004",
    recipeName: "Fiskgryta med Saffran",
    ingredients: [
      { id: 1, amount: 600, unit: "g", ingredient: "Torskfilé", cost: 98.00, checked: false },
      { id: 2, amount: 300, unit: "g", ingredient: "Räkor", cost: 75.50, checked: false },
      { id: 3, amount: 1, unit: "burk", ingredient: "Krossade tomater", cost: 22.00, checked: false },
      { id: 4, amount: 1, unit: "förp", ingredient: "Saffran", cost: 45.00, checked: false },
      { id: 5, amount: 2, unit: "st", ingredient: "Gul lök", cost: 12.00, checked: false },
    ],
    customerId: "user-101",
    customerName: "Johan Johansson",
    sum: 252.50,
    date: "2025-10-21T12:00:00Z",
    status: "pending",
    createdAt: "2025-10-21T12:00:00Z",
    updatedAt: "2025-10-21T12:00:00Z",
  },
  {
    id: "5",
    orderNumber: "ORD-20251021-E5M23F",
    recipeId: "recipe-005",
    recipeName: "Tacos med Pulled Pork",
    ingredients: [
      { id: 1, amount: 800, unit: "g", ingredient: "Fläskkarré", cost: 89.00, checked: true },
      { id: 2, amount: 1, unit: "förp", ingredient: "Tortillas (12 st)", cost: 32.00, checked: true },
      { id: 3, amount: 200, unit: "g", ingredient: "Cheddarost", cost: 38.50, checked: true },
      { id: 4, amount: 1, unit: "st", ingredient: "Lime", cost: 8.00, checked: false },
      { id: 5, amount: 1, unit: "burk", ingredient: "Svarta bönor", cost: 18.90, checked: false },
    ],
    customerId: "user-202",
    customerName: "Lisa Larsson",
    sum: 186.40,
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