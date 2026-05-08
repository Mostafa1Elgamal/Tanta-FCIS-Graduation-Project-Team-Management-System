const Notification = require('../models/notificationModel');

class NotificationService {
  static async sendNotification(io, userId, content, type, relatedId = null) {
    try {
      // 1) Save to DB
      const notification = await Notification.create({
        userId,
        content,
        type,
        relatedId
      });

      // 2) Send via Socket.io if user is online
      if (io) {
        io.to(userId.toString()).emit('notification', notification);
        
        // Specific event types for easier frontend handling
        const eventMap = {
          'NEW_APPLICATION': 'new_application',
          'INVITATION_RECEIVED': 'invitation_received',
          'REQUEST_ACCEPTED': 'request_accepted',
          'REQUEST_REJECTED': 'request_rejected',
          'TEAM_UPDATED': 'team_updated'
        };
        
        if (eventMap[type]) {
          io.to(userId.toString()).emit(eventMap[type], notification);
        }
      }

      return notification;
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  }
}

module.exports = NotificationService;
