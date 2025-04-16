import { useState } from 'react';

function ShareModal({ isOpen, onClose, compositionId, title }) {
  const [isCopied, setIsCopied] = useState(false);
  
  if (!isOpen) return null;
  
  const shareUrl = `${window.location.origin}/studio/${compositionId}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Share "{title}"</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="mb-4">Share this link with others to collaborate on your composition:</p>
        
        <div className="flex mb-4">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-grow p-2 border rounded-l bg-gray-50 dark:bg-gray-700"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div className="flex justify-between mt-6">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span>Allow editing</span>
          </label>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;