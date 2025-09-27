import type {JSX} from 'react';
import{createElement} from 'react';
// page components
import NotFoundPage from './pages/NotFoundPage.tsx';
import RecipePage from './pages/RecipePage.tsx';
import SignIn from './pages/SignIn.tsx';

interface Route {
  element: JSX.Element;
  path: string;
  loader?: Function;
  menuLabel?: string;
  index?: number;
  parent?: string;
}

export default [
  NotFoundPage,
  RecipePage,
  SignIn
]
  // map the route property of each page component to a Route
  .map(x => (({ element: createElement(x), ...x.route }) as Route))
  // sort by index (and if an item has no index, sort as index 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));