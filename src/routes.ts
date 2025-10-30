import type { JSX } from "react";
import { createElement } from "react";
// page components
import CreateRecipe from "./pages/CreateRecipe.tsx";
import EditRecipeDetails from "./pages/EditRecipeDetails.tsx";
import HomePage from "./pages/HomePage.tsx";
import NotAuthorizedPage from "./pages/NotAuthorizedPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import RecipePage from "./pages/RecipePage.tsx";
import ShoppingListPage from "./pages/ShoppingListPage.tsx";
import ViewRecipeDetails from "./pages/ViewRecipeDetails.tsx";
import MyOrdersPage from "@orders/pages/MyOrdersPage.tsx";
import OrderReceipt from "./pages/OrderReceipt.tsx";
import StoreManagerOrderView from "@orders/pages/StoreManagerOrderView";
import OrderDetailsPage from "@orders/pages/OrderDetailsPage.tsx";

interface Route {
  element: JSX.Element;
  path: string;
  loader?: Function;
  menuLabel?: string;
  index?: number;
  parent?: string;
  protected?: boolean
}

export default [
  CreateRecipe,
  EditRecipeDetails,
  HomePage,
  NotAuthorizedPage,
  NotFoundPage,
  RecipePage,
  ShoppingListPage,
  StoreManagerOrderView,
  ViewRecipeDetails,
  MyOrdersPage,
  OrderReceipt,
  OrderDetailsPage



]
  // map the route property of each page component to a Route
  .map((x) => ({ element: createElement(x), ...x.route } as Route))
  // sort by index (and if an item has no index, sort as index 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));
