import { Link } from 'react-router-dom';

function Header({ theme, toggleTheme }) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Collaborative Music Studio
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-blue-500">
            Home
          </Link>
          <button 
            onClick={toggleTheme}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;