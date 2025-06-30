import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, FileText, Settings, DollarSign, AlertTriangle, BarChart3, BookTemplate as FileTemplate } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();

  console.log('Sidebar rendering with user:', user);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'project_manager', 'team_leader', 'viewer'] },
    { name: 'Projects', href: '/projects', icon: Building2, roles: ['admin', 'project_manager', 'team_leader'] },
    { name: 'Teams', href: '/teams', icon: Users, roles: ['admin', 'project_manager'] },
    { name: 'Templates', href: '/templates', icon: FileTemplate, roles: ['admin', 'project_manager'] },
    { name: 'Delay Alerts', href: '/schedule', icon: AlertTriangle, roles: ['admin', 'project_manager', 'team_leader'] },
    { name: 'Reports', href: '/reports', icon: FileText, roles: ['admin', 'project_manager'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'project_manager'] },
    { name: 'Payments', href: '/payments', icon: DollarSign, roles: ['admin', 'project_manager'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
  ];

  // Ensure we have a valid user role, defaulting to 'viewer' if missing
  const userRole = user?.role.toLowerCase() || 'viewer';
  console.log('User role for navigation filtering:', userRole);
  
  const visibleNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );
  
  console.log('Visible navigation items:', visibleNavigation.length);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CM</span>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              ConstructManager
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {visibleNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    // Close mobile sidebar when navigating
                    if (window.innerWidth < 1024 && onToggle) {
                      onToggle();
                    }
                  }}
                  className={`${
                    isActive
                      ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200`}
                >
                  <item.icon
                    className={`${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200`}
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User Info at Bottom */}
          <div className="px-3 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role?.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;