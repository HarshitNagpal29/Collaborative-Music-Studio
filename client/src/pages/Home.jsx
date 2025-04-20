import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [compositions, setCompositions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCompositions = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL + 'api/compositions');
        setCompositions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching compositions:', error);
        setLoading(false);
      }
    };
    
    fetchCompositions();
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Public Compositions</h2>
        <Link 
          to="/studio/new" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create New
        </Link>
      </div>
      
      {loading ? (
        <p>Loading compositions...</p>
      ) : compositions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg mb-4">No compositions available yet</p>
          <Link 
            to="/studio/new" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create the first composition
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {compositions.map(comp => (
            <div 
              key={comp._id} 
              className="p-4 border rounded-md hover:shadow-md bg-white dark:bg-gray-800"
            >
              <h3 className="text-xl font-bold">{comp.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                By {comp.creator} • {new Date(comp.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-4">
                <Link 
                  to={`/studio/${comp._id}`} 
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Open in Studio
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;