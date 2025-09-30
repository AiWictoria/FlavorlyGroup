import type {JSX} from 'react';
import{createElement} from 'react';
// page components
import CreateRecipe from './pages/CreateRecipe.tsx';
import EditRecipeDetails from './pages/EditRecipeDetails.tsx';
import HomePage from './pages/HomePage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import RecipePage from './pages/RecipePage.tsx';
import ShoppingListPage from './pages/ShoppingListPage.tsx';
import ViewRecipeDetails from './pages/ViewRecipeDetails.tsx';

interface Route {
  element: JSX.Element;
  path: string;
  loader?: Function;
  menuLabel?: string;
  index?: number;
  parent?: string;
}

export default [
  CreateRecipe,
  EditRecipeDetails,
  HomePage,
  NotFoundPage,
  RecipePage,
  ShoppingListPage,
  ViewRecipeDetails
]
  // map the route property of each page component to a Route
  .map(x => (({ element: createElement(x), ...x.route }) as Route))
  // sort by index (and if an item has no index, sort as index 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));