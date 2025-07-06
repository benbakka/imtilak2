import React from 'react';
import { Calendar, MapPin, Users, AlertTriangle, Home, Edit, Trash2, BarChart2 } from 'lucide-react';
import { Project } from '../../types';
import { formatDateForDisplay } from '../../utils/dateFormatter';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onStatusUpdate?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onEdit, onDelete, onStatusUpdate }) => {
  const getStatusColor = (status: string, progress: number) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'bg-green-100 text-green-800';
    if (statusLower === 'on_hold') return 'bg-gray-100 text-gray-800';
    if (progress < 30) return 'bg-blue-100 text-blue-800';
    if (progress < 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-blue-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-1 relative"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{project.location || 'No location'}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          {onStatusUpdate && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onStatusUpdate(project);
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Update Status"
            >
              <BarChart2 className="h-5 w-5" />
            </button>
          )}
          {onEdit && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit Project"
            >
              <Edit className="h-5 w-5" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id);
              }}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete Project"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`${getProgressColor(project.progress)} h-2.5 rounded-full`} 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
          <span className="text-sm text-gray-500">{formatDateForDisplay(project.start_date)} - {formatDateForDisplay(project.end_date)}</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status, project.progress)}`}>
          {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;