import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import { authAPI } from './services/authAPI';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = authAPI.getCurrentUser();
    const token = authAPI.getToken();

    if (storedUser && token) {
      setUser(storedUser);
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        <div style={{textAlign: 'center'}}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  // Show Login/Register if not authenticated
  if (!isAuthenticated) {
    return (
      <div>
        {currentPage === 'login' && (
          <Login setCurrentPage={setCurrentPage} setUser={setUser} setIsAuthenticated={setIsAuthenticated} />
        )}
        {currentPage === 'register' && (
          <Register setCurrentPage={setCurrentPage} setUser={setUser} setIsAuthenticated={setIsAuthenticated} />
        )}
      </div>
    );
  }

  // Show main app if authenticated
  return (
    <div className="app-container">
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard setCurrentPage={setCurrentPage} />}
        {currentPage === 'products' && <Products />}
        {currentPage === 'movements' && (
           <div style={{textAlign: 'center', marginTop: '4rem'}}>
              <h2>Movements History</h2>
              <p style={{color: 'var(--text-muted)'}}>Transactions will appear here.</p>
           </div>
        )}
      </main>
    </div>
  );
}

export default App;
