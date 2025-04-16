function InstrumentSelector({ currentInstrument, setCurrentInstrument }) {
    const instruments = [
      { id: 'synth', name: 'Synth', icon: '🎹' },
      { id: 'piano', name: 'Piano', icon: '🎵' },
      { id: 'bass', name: 'Bass', icon: '🎸' },
      { id: 'drums', name: 'Drums', icon: '🥁' }
    ];
    
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
        <h3 className="text-lg font-bold mb-3">Instruments</h3>
        <div className="grid grid-cols-2 gap-2">
          {instruments.map(instrument => (
            <button
              key={instrument.id}
              className={`p-3 rounded text-center transition-colors ${
                currentInstrument === instrument.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => setCurrentInstrument(instrument.id)}
            >
              <div className="text-xl mb-1">{instrument.icon}</div>
              <div className="text-sm">{instrument.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }
  
  export default InstrumentSelector;