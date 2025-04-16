import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Studio from './pages/Studio'
import Header from './components/layout/Header'
import { useTheme } from './context/ThemeContext'
import './App.css'

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="container mx-auto p-4 pt-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/studio/:id" element={<Studio />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App