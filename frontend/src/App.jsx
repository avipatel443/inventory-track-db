import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Movements from './pages/Movements';
import AddProduct from './pages/AddProduct';
import AddMovement from './pages/AddMovement';
import Login from './pages/Login';
import Register from './pages/Register';
import { authAPI } from './services/authAPI';

function App() {
  const storedUser = authAPI.getCurrentUser();
  const token = authAPI.getToken();
  const hasSession = Boolean(storedUser && token);

  const [currentPage, setCurrentPage] = useState(hasSession ? 'dashboard' : 'login');
  const [user, setUser] = useState(hasSession ? storedUser : null);
  const [isAuthenticated, setIsAuthenticated] = useState(hasSession);

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

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
        {currentPage === 'dashboard'   && <Dashboard setCurrentPage={setCurrentPage} />}
        {currentPage === 'products'    && <Products setCurrentPage={setCurrentPage} />}
        {currentPage === 'add-product' && <AddProduct setCurrentPage={setCurrentPage} />}
        {currentPage === 'movements'   && <Movements setCurrentPage={setCurrentPage} />}
        {currentPage === 'add-movement' && <AddMovement setCurrentPage={setCurrentPage} />}
      </main>
    </div>
  );
}

export default App;
