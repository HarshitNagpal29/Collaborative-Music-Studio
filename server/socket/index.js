const socketHandler = (io) => {
    // Store active users per composition
    const activeCompositions = new Map();
    
    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
      
      // Join a composition room
      socket.on('join-composition', (compositionId) => {
        socket.join(compositionId);
        console.log(`User ${socket.id} joined composition ${compositionId}`);
        
        // Track user in active compositions
        if (!activeCompositions.has(compositionId)) {
          activeCompositions.set(compositionId, new Set());
        }
        activeCompositions.get(compositionId).add(socket.id);
        
        // Notify others that a new collaborator joined
        socket.to(compositionId).emit('collaborator-joined', {
          compositionId,
          userId: socket.id
        });
        
        // Send current collaborators to the new user
        const collaborators = Array.from(activeCompositions.get(compositionId));
        socket.emit('current-collaborators', {
          compositionId,
          collaborators: collaborators.filter(id => id !== socket.id)
        });
      });
      
      // Handle note updates
      socket.on('update-note', (data) => {
        socket.to(data.compositionId).emit('note-updated', data);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove user from all active compositions
        for (const [compositionId, users] of activeCompositions.entries()) {
          if (users.has(socket.id)) {
            users.delete(socket.id);
            
            // Notify others that this collaborator left
            io.to(compositionId).emit('collaborator-left', {
              compositionId,
              userId: socket.id
            });
            
            // Clean up empty compositions
            if (users.size === 0) {
              activeCompositions.delete(compositionId);
            }
          }
        }
      });
    });
  };
  
  module.exports = socketHandler;