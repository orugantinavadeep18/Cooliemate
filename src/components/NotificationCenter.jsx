import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  X,
  Volume2
} from "lucide-react";

const NotificationCenter = ({ userId, userType = "passenger" }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Notification sound URLs (you can use custom sounds or these free ones)
  const notificationSound = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzGH0fPTgjMGHm7A7+OZUQ4NVKzn77FgGQk+ltrywnMnBSuAzvLaizgIGGa47OihURELTaLh8bllHAc4ldfz0H8tBSV5yPDejz8JFV611+yrWBQLR5zi8L94IQcxitDz1IU1BShy7"; // Truncated for brevity

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(notificationSound);
    
    // Fetch notifications on mount
    fetchNotifications();
    
    // Poll for new notifications every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `https://cooliemate.onrender.com/api/notifications/${userId}?type=${userType}`
      );
      const data = await response.json();

      if (data.success) {
        const newNotifications = data.notifications;
        
        // Check for new unread notifications
        const newUnread = newNotifications.filter(n => !n.isRead && !n.isSoundPlayed);
        
        if (newUnread.length > 0) {
          playNotificationSound();
          // Show browser notification if permitted
          showBrowserNotification(newUnread[0]);
        }

        setNotifications(newNotifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log('Sound play failed:', err);
      });
    }
  };

  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        badge: '/badge.png'
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await fetch(
        `https://cooliemate.onrender.com/api/notifications/${notificationId}/read`,
        { method: 'PATCH' }
      );
      
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(
        `https://cooliemate.onrender.com/api/notifications/${userId}/read-all`,
        { method: 'PATCH' }
      );
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_accepted':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'booking_declined':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'booking_created':
        return <Bell className="w-5 h-5 text-blue-600" />;
      case 'booking_completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'review_request':
        return <Star className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_accepted':
      case 'booking_completed':
        return 'bg-green-50 border-green-200';
      case 'booking_declined':
        return 'bg-red-50 border-red-200';
      case 'booking_created':
        return 'bg-blue-50 border-blue-200';
      case 'review_request':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 max-h-[600px] shadow-2xl z-50 border-2">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-bold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-primary/5' : ''
                    } ${getNotificationColor(notification.type)}`}
                    onClick={() => markAsRead(notification._id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          {notification.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        {notification.bookingId && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              {notification.bookingId}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-muted/30 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page if you have one
                  }}
                >
                  View all notifications
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src={notificationSound} type="audio/wav" />
      </audio>
    </div>
  );
};

export default NotificationCenter;