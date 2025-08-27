import { useState } from 'react';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Charts } from './pages/Charts';
import { Transactions } from './pages/Transactions';

type Page = 'dashboard' | 'charts' | 'transactions';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'charts':
        return <Charts />;
      case 'transactions':
        return <Transactions />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
