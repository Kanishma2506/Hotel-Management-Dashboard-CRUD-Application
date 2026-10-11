import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PageContainer from './components/layout/PageContainer';
import AppRoutes from './routes/AppRoutes';

function AppContent() {
  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <PageContainer>
          <AppRoutes />
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
