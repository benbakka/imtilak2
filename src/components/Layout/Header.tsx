import React, { useState, useEffect } from 'react';
import { Bell, Settings, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CategoryTeamService } from '../../lib/categoryTeamService';
import { NotificationService, Notification } from '../../lib/notificationService';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Set up polling for notifications
    const interval = setInterval(() => {
      loadNotifications(false);
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadNotifications = async (showLoading = true) => {
    if (!user?.id) return;

    try {
      if (showLoading) {
        setLoading(true);
      }
      
      try {
        // Try to get notifications from API
        const response = await NotificationService.getNotifications(user.id, 0, 10, true);
        setNotifications(response.content);
        setNotificationCount(response.content.length);
      } catch (error) {
        console.error('Error loading notifications from API:', error);
        
        // Fallback to generating notifications from delayed tasks
        if (!user?.company_id) return;
        
        // Load delayed tasks
        const delayedResponse = await CategoryTeamService.getDelayedTasks(user.company_id, 0, 5);
        
        // Load imminent tasks (starting in next 2 days)
        const imminentResponse = await CategoryTeamService.getTasksStartingSoon(user.company_id, 2, 0, 5);
        
        // Process notifications
        const delayedNotifications = delayedResponse.content.map(task => ({
          id: `delayed-${task.id}`,
          title: 'Delayed Task',
          message: `${task.category?.name} is delayed for ${task.category?.unit?.name}`,
          type: 'delay' as const,
          isRead: false,
          createdAt: new Date().toISOString(),
          categoryTeamId: task.id,
          projectId: task.category?.unit?.project?.id,
          unitId: task.category?.unit?.id,
          categoryId: task.category?.id,
          teamId: task.team?.id
        }));
        
        const imminentNotifications = imminentResponse.content.map(task => ({
          id: `imminent-${task.id}`,
          title: 'Task Starting Soon',
          message: `${task.category?.name} is starting soon for ${task.category?.unit?.name}`,
          type: 'deadline' as const,
          isRead: false,
          createdAt: new Date().toISOString(),
          categoryTeamId: task.id,
          projectId: task.category?.unit?.project?.id,
          unitId: task.category?.unit?.id,
          categoryId: task.category?.id,
          teamId: task.team?.id
        }));
        
        const allNotifications = [...delayedNotifications, ...imminentNotifications];
        setNotifications(allNotifications);
        setNotificationCount(allNotifications.length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      project_manager: 'bg-blue-100 text-blue-800',
      team_leader: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || colors.viewer;
  };

  const markAllAsRead = async () => {
    try {
      if (user?.id) {
        await NotificationService.markAllAsRead(user.id);
      }
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setNotificationCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      // Fallback for demo
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setNotificationCount(0);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    try {
      if (notification.id) {
        NotificationService.markAsRead(notification.id);
      }
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      ));
      setNotificationCount(prev => Math.max(0, prev - 1));
      
      // Navigate to the relevant page
      if (notification.type === 'delay' || notification.type === 'deadline') {
        navigate('/schedule');
      } else if (notification.type === 'payment') {
        navigate('/payments');
      } else if (notification.projectId) {
        navigate('/projects', { 
          state: { 
            selectedProjectId: notification.projectId,
            selectedUnitId: notification.unitId,
            selectedCategoryId: notification.categoryId,
            selectedTeamId: notification.teamId
          } 
        });
      }
      
      // Close notifications panel
      setShowNotifications(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button and Logo */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Logo - visible on mobile when sidebar is closed */}
            <div className="flex-shrink-0 flex items-center lg:hidden ml-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                ConstructManager
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-lg"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 block h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900">Notifications</p>
                    {notificationCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading notifications...
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-gray-100 ${notification.isRead ? 'bg-white' : 'bg-blue-50'} cursor-pointer hover:bg-gray-50`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start">
                            <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 ${
                              notification.type === 'delay' ? 'bg-red-500' : 
                              notification.type === 'deadline' ? 'bg-orange-500' :
                              notification.type === 'payment' ? 'bg-green-500' :
                              'bg-blue-500'
                            }`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-600">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-200">
                    <a href="/schedule" className="text-xs text-blue-600 hover:text-blue-800">
                      View all alerts
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRoleColor(user?.role || 'viewer')}`}>
                      {user?.role?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/settings');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </button>
                    <button 
                      onClick={() => {
                        handleSignOut();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;