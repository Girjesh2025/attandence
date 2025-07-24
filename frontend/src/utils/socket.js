import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return this.socket;
    }

    const serverURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(serverURL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join admin room for real-time updates
  joinAdminRoom(adminData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_admin', adminData);
      
      // Listen for confirmation
      this.socket.on('admin_joined', (response) => {
        console.log('✅ Admin room joined:', response);
      });
    }
  }

  // Leave admin room
  leaveAdminRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_admin');
    }
  }

  // Join employee room
  joinEmployeeRoom(employeeData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_employee', employeeData);
      
      // Listen for confirmation
      this.socket.on('employee_joined', (response) => {
        console.log('✅ Employee connected:', response);
      });
    }
  }

  // Listen for attendance updates (admin only)
  onAttendanceUpdate(callback) {
    if (this.socket) {
      this.socket.on('attendance_update', callback);
    }
  }

  // Remove attendance update listener
  offAttendanceUpdate(callback) {
    if (this.socket) {
      this.socket.off('attendance_update', callback);
    }
  }

  // Listen for specific events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit custom events
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 