import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './routes/AppRoutes';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';

// Create TanStack Query client for caching API server states
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <PwaInstallPrompt />
    </QueryClientProvider>
  );
}

export default App;
