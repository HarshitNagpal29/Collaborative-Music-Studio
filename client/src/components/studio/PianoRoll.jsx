import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

// Define piano constants
const OCTAVES = 2;
const NOTES_PER_OCTAVE = 12;
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const STARTING_OCTAVE = 4;
const TOTAL_NOTES = OCTAVES * NOTES_PER_OCTAVE;
const BEATS_PER_BAR = 16;
const BARS = 4;
const GRID_WIDTH = BEATS_PER_BAR * BARS;

function PianoRoll({ notes, onNotesChange, bpm, isPlaying, currentInstrument }) {
  const [gridState, setGridState] = useState(Array(TOTAL_NOTES).fill().map(() => Array(GRID_WIDTH).fill(false)));
  const [mouseDown, setMouseDown] = useState(false);
  const [isAdding, setIsAdding] = useState(true);
  const [synth, setSynth] = useState(null);
  const gridRef = useRef(null);
  const sequencerRef = useRef(null);
  
  // Initialize Web Audio API synth
  useEffect(() => {
    // Create synth based on selected instrument
    let newSynth;
    
    switch(currentInstrument) {
      case 'piano':
        newSynth = new Tone.Sampler({
          urls: {
            C4: "C4.mp3",
            D4: "D4.mp3",
            E4: "E4.mp3",
            F4: "F4.mp3",
            G4: "G4.mp3",
            A4: "A4.mp3",
            B4: "B4.mp3",
          },
          release: 1,
        }).toDestination();
        break;
      case 'bass':
        newSynth = new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: {
            attack: 0.05,
            decay: 0.2,
            sustain: 0.4,
            release: 1.5
          }
        }).toDestination();
        break;
      case 'drums':
        newSynth = new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0,
            release: 0.1
          }
        }).toDestination();
        break;
      case 'synth':
      default:
        newSynth = new Tone.PolySynth(Tone.Synth).toDestination();
        break;
    }
    
    setSynth(newSynth);
    
    // Cleanup function
    return () => {
      if (newSynth) {
        newSynth.dispose();
      }
    };
  }, [currentInstrument]);
  
  // Convert between notes array and grid state
  useEffect(() => {
    if (notes && notes.length > 0) {
      const newGrid = Array(TOTAL_NOTES).fill().map(() => Array(GRID_WIDTH).fill(false));
      
      notes.forEach(note => {
        const { pitch, step } = note;
        const noteIndex = TOTAL_NOTES - 1 - (pitch - (STARTING_OCTAVE * 12));
        if (noteIndex >= 0 && noteIndex < TOTAL_NOTES && step >= 0 && step < GRID_WIDTH) {
          newGrid[noteIndex][step] = true;
        }
      });
      
      setGridState(newGrid);
    }
  }, [notes]);
  
  // Update sequencer when BPM changes
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);
  
  // Handle play/stop
  useEffect(() => {
    if (isPlaying) {
      if (Tone.Transport.state !== "started") {
        // Make sure audio context is running
        if (Tone.context.state !== 'running') {
          Tone.context.resume();
        }
        
        // Create a new sequence
        if (sequencerRef.current) {
          sequencerRef.current.dispose();
        }
        
        sequencerRef.current = new Tone.Sequence(
          (time, step) => {
            // Play all active notes for this step
            gridState.forEach((row, rowIndex) => {
              if (row[step]) {
                const noteIndex = TOTAL_NOTES - 1 - rowIndex;
                const octave = Math.floor(noteIndex / NOTES_PER_OCTAVE) + STARTING_OCTAVE;
                const note = NOTE_NAMES[noteIndex % NOTES_PER_OCTAVE] + octave;
                
                if (currentInstrument === 'drums') {
                  synth?.triggerAttackRelease("16n", time);
                } else {
                  synth?.triggerAttackRelease(note, "16n", time);
                }
              }
            });
            
            // Update visual cursor position
            const cols = document.querySelectorAll('.grid-col');
            cols.forEach((col, colIndex) => {
              if (colIndex === step) {
                col.classList.add('bg-blue-200', 'dark:bg-blue-800');
              } else {
                col.classList.remove('bg-blue-200', 'dark:bg-blue-800');
              }
            });
          },
          Array.from({ length: GRID_WIDTH }, (_, i) => i),
          "16n"
        );
        
        sequencerRef.current.start(0);
        Tone.Transport.start();
      }
    } else {
      Tone.Transport.stop();
      if (sequencerRef.current) {
        sequencerRef.current.stop();
      }
      
      // Remove cursor highlights
      const cols = document.querySelectorAll('.grid-col');
      cols.forEach(col => {
        col.classList.remove('bg-blue-200', 'dark:bg-blue-800');
      });
    }
    
    // Cleanup function
    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
    };
  }, [isPlaying, gridState, bpm, synth, currentInstrument]);
  
  // Convert grid state to notes array and call onNotesChange
  useEffect(() => {
    const newNotes = [];
    
    gridState.forEach((row, rowIndex) => {
      row.forEach((isActive, colIndex) => {
        if (isActive) {
          const pitch = TOTAL_NOTES - 1 - rowIndex + (STARTING_OCTAVE * 12);
          newNotes.push({
            pitch,
            step: colIndex,
            duration: 1, // Default duration
            velocity: 100 // Default velocity
          });
        }
      });
    });
    
    onNotesChange(newNotes);
  }, [gridState, onNotesChange]);
  
  const handleMouseDown = (rowIndex, colIndex) => {
    const newValue = !gridState[rowIndex][colIndex];
    setIsAdding(newValue);
    
    const newGrid = [...gridState];
    newGrid[rowIndex] = [...newGrid[rowIndex]];
    newGrid[rowIndex][colIndex] = newValue;
    setGridState(newGrid);
    
    // Play the note when clicked
    if (newValue && synth) {
      const noteIndex = TOTAL_NOTES - 1 - rowIndex;
      const octave = Math.floor(noteIndex / NOTES_PER_OCTAVE) + STARTING_OCTAVE;
      const note = NOTE_NAMES[noteIndex % NOTES_PER_OCTAVE] + octave;
      
      if (currentInstrument === 'drums') {
        synth.triggerAttackRelease("16n");
      } else {
        synth.triggerAttackRelease(note, "16n");
      }
    }
    
    setMouseDown(true);
  };
  
  const handleMouseUp = () => {
    setMouseDown(false);
  };
  
  const handleMouseEnter = (rowIndex, colIndex) => {
    if (mouseDown) {
      const newGrid = [...gridState];
      newGrid[rowIndex] = [...newGrid[rowIndex]];
      newGrid[rowIndex][colIndex] = isAdding;
      setGridState(newGrid);
      
      // Play the note when dragged over (only if adding)
      if (isAdding && synth) {
        const noteIndex = TOTAL_NOTES - 1 - rowIndex;
        const octave = Math.floor(noteIndex / NOTES_PER_OCTAVE) + STARTING_OCTAVE;
        const note = NOTE_NAMES[noteIndex % NOTES_PER_OCTAVE] + octave;
        
        if (currentInstrument === 'drums') {
          synth.triggerAttackRelease("16n");
        } else {
          synth.triggerAttackRelease(note, "16n");
        }
      }
    }
  };
  
  useEffect(() => {
    // Add global mouse up handler
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  // Generate piano key labels
  const keyLabels = Array.from({ length: TOTAL_NOTES }, (_, i) => {
    const noteIndex = (TOTAL_NOTES - 1 - i) % NOTES_PER_OCTAVE;
    const octave = Math.floor((TOTAL_NOTES - 1 - i) / NOTES_PER_OCTAVE) + STARTING_OCTAVE;
    return `${NOTE_NAMES[noteIndex]}${octave}`;
  });
  
  // Determine if a key is white or black
  const isBlackKey = (index) => {
    const noteIndex = (TOTAL_NOTES - 1 - index) % NOTES_PER_OCTAVE;
    return [1, 3, 6, 8, 10].includes(noteIndex);
  };
  
  return (
    <div className="piano-roll mt-6 overflow-auto border rounded-lg">
      <div className="flex" ref={gridRef}>
        {/* Piano Keys */}
        <div className="keys-column min-w-16 bg-gray-100 dark:bg-gray-800">
          {gridState.map((_, i) => (
            <div 
              key={`key-${i}`} 
              className={`key h-8 flex items-center justify-end pr-2 border-b border-gray-200 dark:border-gray-700 
                ${isBlackKey(i) ? 'bg-gray-800 dark:bg-gray-900 text-white' : 'bg-white dark:bg-gray-700'}`}
            >
              <span className="text-xs font-mono">{keyLabels[i]}</span>
            </div>
          ))}
        </div>
        
        {/* Grid cells */}
        <div className="grid-container flex">
          {Array.from({ length: GRID_WIDTH }).map((_, colIndex) => (
            <div 
              key={`col-${colIndex}`} 
              className={`grid-col ${colIndex % 4 === 0 ? 'border-l-2 border-gray-300 dark:border-gray-600' : ''}`}
            >
              {gridState.map((row, rowIndex) => (
                <div 
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`cell h-8 w-8 border border-gray-200 dark:border-gray-700 cursor-pointer
                    ${isBlackKey(rowIndex) ? 'bg-gray-100 dark:bg-gray-800' : ''}
                    ${row[colIndex] ? 'bg-blue-500 dark:bg-blue-600' : ''}`}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PianoRoll;