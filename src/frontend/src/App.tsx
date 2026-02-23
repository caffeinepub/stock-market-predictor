import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import HomePage from './pages/HomePage';
import PredictionResultsPage from './pages/PredictionResultsPage';
import Layout from './components/Layout';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const predictionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/prediction/$symbol',
  component: PredictionResultsPage,
});

const routeTree = rootRoute.addChildren([indexRoute, predictionRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
