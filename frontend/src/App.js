import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './contexts/AuthContext';
import { MainRoutes } from './MainRoutes';

import '@/slate/styles/tokens.css';
import '@/slate/styles/base.css';

function App() {
  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <AuthProvider>
        <BrowserRouter>
          <MainRoutes />
          <Analytics />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
