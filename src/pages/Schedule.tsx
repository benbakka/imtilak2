import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Clock, Search, Filter, Calendar, MapPin, Users, ChevronRight, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CategoryTeamService } from '../lib/categoryTeamService';
import { NotificationService } from '../lib/notificationService';
import { formatDateForDisplay } from '../utils/dateFormatter';

interface DelayAlert {
  id: string;
  projectId: string;
  projectName: string;
  unitId: string;
  unitName: string;
  categoryId: string;
  categoryName: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  taskName: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: 'delayed' | 'imminent';
  daysOverdue?: number;
  daysUntilStart?: number;
  progress: number;
  location: string;
}

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'delayed' | 'imminent'>('all');
  const [delayData, setDelayData] = useState<DelayAlert[]>([]);
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Ref to track if notifications have been marked as read
  const notificationsMarkedRef = useRef(false);

  useEffect(() => {
    loadDelayData();
  }, [user?.company_id]);

  useEffect(() => {
    // Mark notifications as read when this page is visited
    if (user?.id && !notificationsMarkedRef.current) {
      markNotificationsAsRead();
      notificationsMarkedRef.current = true;
    }
  }, [user?.id, location.pathname]);

  const markNotificationsAsRead = async () => {
    try {
      // Mark delay and deadline notifications as read
      await NotificationService.markAllAsRead(user!.id);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const loadDelayData = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      setError('');

      // Load delayed tasks
      const delayedResponse = await CategoryTeamService.getDelayedTasks(user.company_id, 0, 100);
      
      // Load imminent tasks (starting in next 2 days)
      const imminentResponse = await CategoryTeamService.getTasksStartingSoon(user.company_id, 2, 0, 100);
      
      // Process and combine the data
      const processedData: DelayAlert[] = [];
      
      // Process delayed tasks
      for (const task of delayedResponse.content) {
        const category = task.category;
        const team = task.team;
        const unit = category?.unit;
        const project = unit?.project;
        
        if (category && team && unit && project) {
          const endDate = new Date(category.end_date);
          const today = new Date();
          const diffTime = today.getTime() - endDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          processedData.push({
            id: task.id,
            projectId: project.id,
            projectName: project.name,
            unitId: unit.id,
            unitName: unit.name,
            categoryId: category.id,
            categoryName: category.name,
            teamId: team.id,
            teamName: team.name,
            teamColor: team.color,
            taskName: task.tasks?.[0] || `${category.name} work`,
            scheduledStart: category.start_date,
            scheduledEnd: category.end_date,
            status: 'delayed',
            daysOverdue: diffDays > 0 ? diffDays : 0,
            progress: task.progressPercentage || 0,
            location: project.location
          });
        }
      }
      
      // Process imminent tasks
      for (const task of imminentResponse.content) {
        const category = task.category;
        const team = task.team;
        const unit = category?.unit;
        const project = unit?.project;
        
        if (category && team && unit && project) {
          const startDate = new Date(category.start_date);
          const today = new Date();
          const diffTime = startDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          processedData.push({
            id: task.id,
            projectId: project.id,
            projectName: project.name,
            unitId: unit.id,
            unitName: unit.name,
            categoryId: category.id,
            categoryName: category.name,
            teamId: team.id,
            teamName: team.name,
            teamColor: team.color,
            taskName: task.tasks?.[0] || `${category.name} work`,
            scheduledStart: category.start_date,
            scheduledEnd: category.end_date,
            status: 'imminent',
            daysUntilStart: diffDays,
            progress: task.progressPercentage || 0,
            location: project.location
          });
        }
      }
      
      setDelayData(processedData);
      
      // Extract unique projects for filter
      const uniqueProjects = Array.from(new Set(processedData.map(item => ({ id: item.projectId, name: item.projectName }))))
        .filter((project, index, self) => self.findIndex(p => p.id === project.id) === index);
      
      setProjects(uniqueProjects);
    } catch (error) {
      console.error('Error loading delay data:', error);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = delayData.filter(item => {
    const matchesSearch = item.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.taskName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || item.projectId === filterProject;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesProject && matchesStatus;
  });

  const getStatusBadge = (item: DelayAlert) => {
    if (item.status === 'delayed') {
      return (
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            🔴 Delayed
          </span>
          <span className="text-red-600 font-medium text-sm">
            {item.daysOverdue} days overdue
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            🟠 Imminent
          </span>
          <span className="text-orange-600 font-medium text-sm">
            Starts in {item.daysUntilStart} day{item.daysUntilStart !== 1 ? 's' : ''}
          </span>
        </div>
      );
    }
  };

  const getCountdownText = (item: DelayAlert) => {
    if (item.status === 'delayed') {
      return `Deadline passed ${item.daysOverdue} days ago`;
    } else {
      return `Starts in ${item.daysUntilStart} day${item.daysUntilStart !== 1 ? 's' : ''}`;
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleItemClick = (item: DelayAlert) => {
    // Navigate to Projects page and scroll to the specific category/team
    navigate('/projects', { 
      state: { 
        selectedProjectId: item.projectId,
        selectedUnitId: item.unitId,
        selectedCategoryId: item.categoryId,
        selectedTeamId: item.teamId
      } 
    });
  };

  const delayedCount = filteredData.filter(item => item.status === 'delayed').length;
  const imminentCount = filteredData.filter(item => item.status === 'imminent').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Schedule</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDelayData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Delay Alerts</h1>
            {(delayedCount > 0 || imminentCount > 0) && (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {delayedCount + imminentCount}
                </div>
                <Bell className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Monitor delayed tasks and upcoming deadlines across all projects
          </p>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{delayedCount}</div>
              <div className="text-sm text-gray-600">Delayed Tasks</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{imminentCount}</div>
              <div className="text-sm text-gray-600">Starting Soon (≤2 days)</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{delayedCount + imminentCount}</div>
              <div className="text-sm text-gray-600">Total Alerts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects, units, categories, teams, or tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Alerts</option>
              <option value="delayed">🔴 Delayed Only</option>
              <option value="imminent">🟠 Imminent Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {/* Hierarchy Path */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <span className="font-medium text-blue-600">{item.projectName}</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>{item.unitName}</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>{item.categoryName}</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-medium">{item.teamName}</span>
                  </div>
                  
                  {/* Task Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.taskName}
                  </h3>
                  
                  {/* Location and Team Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {item.location}
                    </div>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.teamColor }}
                      ></div>
                      <Users className="h-4 w-4 mr-1" />
                      {item.teamName}
                    </div>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(item)}
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Scheduled Start</div>
                  <div className="text-sm text-gray-900">{formatDate(item.scheduledStart)}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Scheduled End</div>
                  <div className="text-sm text-gray-900">{formatDate(item.scheduledEnd)}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Countdown</div>
                  <div className={`text-sm font-medium ${
                    item.status === 'delayed' ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {getCountdownText(item)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span className="font-medium">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.status === 'delayed' ? 'bg-red-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Hint */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Click to view in project hierarchy
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              {searchTerm || filterProject !== 'all' || filterStatus !== 'all' ? (
                <Search className="h-8 w-8 text-gray-400" />
              ) : (
                <div className="text-2xl">🎉</div>
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterProject !== 'all' || filterStatus !== 'all' 
                ? 'No alerts found' 
                : 'No delays or imminent deadlines!'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterProject !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search criteria'
                : 'All tasks are on schedule. Great work!'}
            </p>
          </div>
        )}
      </div>

      {/* Help Text */}
      {filteredData.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 mt-0.5">
              💡
            </div>
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">How to use Delay Alerts:</div>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>🔴 Delayed:</strong> Tasks that have passed their scheduled end date</li>
                <li>• <strong>🟠 Imminent:</strong> Tasks starting within 2 days that need attention</li>
                <li>• Click any alert to jump directly to that category and team in the project hierarchy</li>
                <li>• Use filters to focus on specific projects or alert types</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;