import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PianoRoll from '../components/studio/PianoRoll';
import Controls from '../components/studio/Controls';
import SoundVisualizer from '../components/studio/SoundVisualizer';
import InstrumentSelector from '../components/studio/InstrumentSelector';
import ShareModal from '../components/studio/ShareModal';
import { joinComposition, getSocket, onNoteUpdated, updateNote } from '../services/socketService';

function Studio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [composition, setComposition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentInstrument, setCurrentInstrument] = useState('synth');
  const [showShareModal, setShowShareModal] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  
  // Check if this is a new composition or editing an existing one
  const isNewComposition = id === 'new';
  
  useEffect(() => {
    if (isNewComposition) {
      // Initialize a new composition
      setComposition({
        title: 'Untitled Composition',
        notes: [],
        bpm: 120,
        isPublic: true,
        creator: 'Anonymous' // Would be replaced with actual user info in a full app
      });
      setLoading(false);
    } else {
      // Fetch existing composition
      const fetchComposition = async () => {
        try {
          const response = await axios.get(`http://localhost:5001/api/compositions/${id}`);
          setComposition(response.data);
          setBpm(response.data.bpm);
          setLoading(false);
          
          // Join the composition room for real-time collaboration
          joinComposition(id);
        } catch (error) {
          console.error('Error fetching composition:', error);
          setError('Failed to load composition. It may have been deleted or you don\'t have access.');
          setLoading(false);
        }
      };
      
      fetchComposition();
    }
  }, [id, isNewComposition]);
  
  // Set up socket listeners for real-time collaboration
  useEffect(() => {
    if (!isNewComposition) {
      // Listen for note updates from other users
      onNoteUpdated((data) => {
        if (data.compositionId === id) {
          setComposition(prev => ({
            ...prev,
            notes: data.notes
          }));
        }
      });
      
      // Listen for collaborator updates
      const socket = getSocket();
      socket.on('collaborator-joined', (data) => {
        if (data.compositionId === id) {
          setCollaborators(prev => {
            if (!prev.includes(data.userId)) {
              return [...prev, data.userId];
            }
            return prev;
          });
        }
      });
      
      socket.on('collaborator-left', (data) => {
        if (data.compositionId === id) {
          setCollaborators(prev => prev.filter(userId => userId !== data.userId));
        }
      });
      
      return () => {
        socket.off('collaborator-joined');
        socket.off('collaborator-left');
      };
    }
  }, [id, isNewComposition]);
  
  const handleSaveComposition = async () => {
    try {
      let response;
      
      if (isNewComposition) {
        response = await axios.post('http://localhost:5001/api/compositions', composition);
        // Redirect to the new composition's edit page
        navigate(`/studio/${response.data._id}`, { replace: true });
      } else {
        response = await axios.put(`http://localhost:5001/api/compositions/${id}`, composition);
      }
      
      alert('Composition saved successfully!');
    } catch (error) {
      console.error('Error saving composition:', error);
      alert('Failed to save composition. Please try again.');
    }
  };
  
  const handleNoteChange = (updatedNotes) => {
    setComposition(prev => ({
      ...prev,
      notes: updatedNotes
    }));
    
    // Emit note changes to other collaborators
    if (!isNewComposition) {
      updateNote({
        compositionId: id,
        notes: updatedNotes
      });
    }
  };
  
  const handleTitleChange = (e) => {
    setComposition(prev => ({
      ...prev,
      title: e.target.value
    }));
  };
  
  const handleBpmChange = (newBpm) => {
    setBpm(newBpm);
    setComposition(prev => ({
      ...prev,
      bpm: newBpm
    }));
  };
  
  if (loading) return <div className="flex justify-center mt-10">Loading studio...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          value={composition.title}
          onChange={handleTitleChange}
          className="text-2xl font-bold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 px-2"
        />
        <div className="flex gap-2">
          {!isNewComposition && (
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Share
            </button>
          )}
          <button
            onClick={handleSaveComposition}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Composition
          </button>
        </div>
      </div>
      
      {collaborators.length > 0 && (
        <div className="mb-4 flex items-center">
          <span className="mr-2">Collaborating with:</span>
          <div className="flex -space-x-2">
            {collaborators.map((userId, index) => (
              <div
                key={userId}
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-900"
                title={`User ${userId}`}
              >
                {userId.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Controls 
            bpm={bpm}
            setBpm={handleBpmChange}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
          <PianoRoll 
            notes={composition.notes}
            onNotesChange={handleNoteChange}
            bpm={bpm}
            isPlaying={isPlaying}
            currentInstrument={currentInstrument}
          />
        </div>
        <div className="lg:col-span-1">
          <InstrumentSelector 
            currentInstrument={currentInstrument}
            setCurrentInstrument={setCurrentInstrument}
          />
          <SoundVisualizer isPlaying={isPlaying} />
        </div>
      </div>
      
      {showShareModal && (
        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          compositionId={id}
          title={composition.title}
        />
      )}
    </div>
  );
}

export default Studio;