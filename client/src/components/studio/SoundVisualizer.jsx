import { useRef, useEffect } from 'react';
import * as Tone from 'tone';

function SoundVisualizer({ isPlaying }) {
  const canvasRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Create audio analyzer when component mounts
    const analyzer = new Tone.Analyser('waveform', 256);
    Tone.Destination.connect(analyzer);
    analyzerRef.current = analyzer;

    // Clean up when component unmounts
    return () => {
      Tone.Destination.disconnect(analyzer);
      analyzer.dispose();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !analyzerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyzer = analyzerRef.current;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const draw = () => {
      // Get waveform data
      const dataArray = analyzer.getValue();
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set line style
      ctx.lineWidth = 2;
      ctx.strokeStyle = document.documentElement.classList.contains('dark') 
        ? 'rgba(59, 130, 246, 0.8)' // blue-500 with opacity in dark mode
        : 'rgba(37, 99, 235, 0.8)'; // blue-600 with opacity in light mode
      
      // Draw waveform
      ctx.beginPath();
      const sliceWidth = canvas.width / dataArray.length;
      let x = 0;
      
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i];
        const y = (v + 1) / 2 * canvas.height;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.stroke();
      
      // Continue animation loop if playing
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    };
    
    // Start/stop animation based on isPlaying prop
    if (isPlaying) {
      draw();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      // Clear canvas when stopped
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (isPlaying) {
        draw();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);
  
  return (
    <div className="visualizer-container bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-3">Sound Visualizer</h3>
      <div className="visualizer-wrapper bg-gray-100 dark:bg-gray-900 rounded-lg h-40 overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
        />
        {!isPlaying && (
          <div className="flex justify-center items-center h-full mt-[-160px] text-gray-500 dark:text-gray-400">
            <p>Play to see visualization</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SoundVisualizer;