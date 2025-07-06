import React, { useState } from 'react';
import { Edit, Trash2, Calendar, Users, CheckCircle, XCircle, Clock, AlertTriangle, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Category, CategoryTeam, Team } from '../../types';
import { BackendTaskStatus } from '../../lib/categoryTeamService';

interface CategoryCardProps {
  category: Category;
  categoryTeams: (CategoryTeam & { team?: Team })[];
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
  onSelect: () => void;
  onUpdateCategoryTeamStatus?: (categoryTeamId: string, newStatus: BackendTaskStatus, progressPercentage?: number) => Promise<void>;
  isExpanded: boolean;
  onToggleExpand: (e: React.MouseEvent) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  categoryTeams,
  onEdit,
  onDelete,
  onSelect,
  onUpdateCategoryTeamStatus,
  isExpanded,
  onToggleExpand
}) => {
  const getStatusColor = (status: BackendTaskStatus) => {
    const colors = {
      'NOT_STARTED': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'DONE': 'bg-green-100 text-green-800',
      'DELAYED': 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.NOT_STARTED;
  };

  const getStatusIcon = (status: BackendTaskStatus) => {
    switch (status) {
      case 'DONE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'DELAYED': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'NOT_STARTED': return <XCircle className="h-4 w-4 text-gray-400" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getNextStatus = (currentStatus: BackendTaskStatus): BackendTaskStatus => {
    switch (currentStatus) {
      case 'NOT_STARTED': return 'IN_PROGRESS';
      case 'IN_PROGRESS': return 'DONE';
      case 'DONE': return 'NOT_STARTED';
      case 'DELAYED': return 'IN_PROGRESS';
      default: return 'NOT_STARTED';
    }
  };

  const completedTeams = categoryTeams.filter(ct => ct.status === 'DONE').length;
  const totalTeams = categoryTeams.length;
  const progressPercentage = totalTeams > 0 ? (completedTeams / totalTeams) * 100 : 0;

  // Remove this function, as isExpanded is now a prop and not local state
  // const toggleExpand = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setIsExpanded(!isExpanded);
  // };
  
  // Add this state for the dropdown if not already present
  const [openDropdownTeamId, setOpenDropdownTeamId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Card Header - Always visible */}
      <div 
        className="p-4 flex items-start justify-between cursor-pointer hover:bg-gray-50 rounded-t-lg transition-colors duration-150"
        onClick={onToggleExpand}
      >
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <button className="ml-2 text-gray-400">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(category.start_date).toLocaleDateString()} - {new Date(category.end_date).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {totalTeams} teams
            </div>
          </div>
          {/* Mini Progress Bar - Always visible */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% ({completedTeams}/{totalTeams})</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-green-200"
            title="Add Team"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-blue-200"
            title="Edit Category"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-red-200"
            title="Delete Category"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 pt-2 border-t space-y-3">
          {/* Teams Header */}
          <div className="flex items-center">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Assigned Teams ({totalTeams})
            </h4>
          </div>
          {categoryTeams.length > 0 ? (
            <div className="space-y-2">
              {categoryTeams.map((categoryTeam) => (
                <div key={categoryTeam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryTeam.team?.color }}
                    ></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {categoryTeam.team?.name}
                      </div>
                      {categoryTeam.tasks && categoryTeam.tasks.length > 0 && (
                        <div className="text-xs text-gray-600">
                          {categoryTeam.tasks.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Status Dropdown */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownTeamId(openDropdownTeamId === categoryTeam.id ? null : categoryTeam.id);
                        }}
                        className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${openDropdownTeamId === categoryTeam.id ? 'border-blue-400 ring-2 ring-blue-200' : 'border-transparent'} ${getStatusColor(categoryTeam.status)} transition-all`}
                        title="Change status"
                        style={{ minWidth: '110px', justifyContent: 'center' }}
                      >
                        {getStatusIcon(categoryTeam.status)}
                        <span className="ml-1">{categoryTeam.status.replace('_', ' ')}</span>
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </button>
                      {openDropdownTeamId === categoryTeam.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg z-20 overflow-hidden" onClick={e => e.stopPropagation()}>
                          {['NOT_STARTED', 'IN_PROGRESS', 'DONE', 'DELAYED'].map(statusOption => (
                            <button
                              key={statusOption}
                              className={`flex items-center w-full text-left px-3 py-2 text-xs gap-2 ${categoryTeam.status === statusOption ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}`}
                              onClick={() => {
                                setOpenDropdownTeamId(null);
                                if (onUpdateCategoryTeamStatus) {
                                  onUpdateCategoryTeamStatus(categoryTeam.id, statusOption as BackendTaskStatus, categoryTeam.progressPercentage || 0);
                                }
                              }}
                            >
                              {getStatusIcon(statusOption as BackendTaskStatus)}
                              <span>{statusOption.replace('_', ' ')}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Progress Input */}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={categoryTeam.progressPercentage || 0}
                      onChange={e => {
                        const value = Math.max(0, Math.min(100, Number(e.target.value)));
                        if (onUpdateCategoryTeamStatus) {
                          onUpdateCategoryTeamStatus(categoryTeam.id, categoryTeam.status, value);
                        }
                      }}
                      className="w-14 px-2 py-1 border border-gray-300 rounded text-xs ml-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      title="Update team progress (%)"
                      style={{ minWidth: '40px' }}
                    />
                    <div className="flex space-x-1 ml-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${categoryTeam.reception_status ? 'bg-green-500' : 'bg-gray-300'}`} 
                        title="Reception Status"
                      ></div>
                      <div 
                        className={`w-2 h-2 rounded-full ${categoryTeam.payment_status ? 'bg-green-500' : 'bg-gray-300'}`} 
                        title="Payment Status"
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic p-3">No teams assigned</div>
          )}
        </div>
      )}

      {/* We've removed the collapsed view team chips since we now have a fully collapsible card */}
    </div>
  );
};

export default CategoryCard;