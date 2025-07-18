
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/theme-provider';
import Dashboard from './pages/Dashboard';
import AttachmentAnalytics from './pages/AttachmentAnalytics';
import UserActivity from './pages/UserActivity';
import StorageMetrics from './pages/StorageMetrics';
import Layout from './components/Layout';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="analytics-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="attachments" element={<AttachmentAnalytics />} />
              <Route path="user-activity" element={<UserActivity />} />
              <Route path="storage" element={<StorageMetrics />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;