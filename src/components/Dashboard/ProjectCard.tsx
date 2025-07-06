import React from 'react';
import { Calendar, MapPin, Users, AlertTriangle, Home, Edit, Trash2 } from 'lucide-react';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onEdit, onDelete }) => {
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {project.location}
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status, project.progress)}`}>
              {project.status.toLowerCase().charAt(0).toUpperCase() + project.status.toLowerCase().slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-1" />
          {(project.start_date && !isNaN(new Date(project.start_date).getTime()) ? new Date(project.start_date).toLocaleDateString() : 'No Start Date')} - {(project.end_date && !isNaN(new Date(project.end_date).getTime()) ? new Date(project.end_date).toLocaleDateString() : 'No End Date')}
        </div>
        <div className="flex items-center text-gray-600">
          <Users className="h-4 w-4 mr-1" />
          {typeof project.active_team_count === 'number' && project.active_team_count !== null ? project.active_team_count : (project.active_team_count === 0 ? 0 : '—')} teams
        </div>
      </div>
      
      {/* Edit and Delete buttons */}
      <div className="absolute top-2 right-2 flex space-x-1">
        {onEdit && (
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onEdit(project); 
            }} 
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-blue-200" 
            title="Edit Project"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onDelete(project.id); 
            }} 
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-red-200" 
            title="Delete Project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;