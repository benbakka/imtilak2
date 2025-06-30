import React from 'react';
import { Edit, Trash2, Calendar, Users, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Category, CategoryTeam, Team } from '../../types';

interface CategoryCardProps {
  category: Category;
  categoryTeams: (CategoryTeam & { team?: Team })[];
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
  onSelect: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  categoryTeams,
  onEdit,
  onDelete,
  onSelect
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      'not_started': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'done': 'bg-green-100 text-green-800',
      'delayed': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.not_started;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'delayed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const completedTeams = categoryTeams.filter(ct => ct.status === 'done').length;
  const totalTeams = categoryTeams.length;
  const progressPercentage = totalTeams > 0 ? (completedTeams / totalTeams) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(category.start_date).toLocaleDateString()} - {new Date(category.end_date).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {totalTeams} teams
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span className="font-medium">{Math.round(progressPercentage)}% ({completedTeams}/{totalTeams})</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Assigned Teams:</h4>
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
                  {getStatusIcon(categoryTeam.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(categoryTeam.status)}`}>
                    {categoryTeam.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="flex space-x-1">
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
          <div className="text-sm text-gray-500 italic">No teams assigned</div>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;