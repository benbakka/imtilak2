import React from 'react';
import { Edit, Trash2, Copy, Building, Home, Store, Users, Clock } from 'lucide-react';
import { UnitTemplate } from '../../types';

interface TemplateCardProps {
  template: UnitTemplate;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const getUnitTypeIcon = (type: string) => {
    switch (type) {
      case 'villa': return Home;
      case 'apartment': return Building;
      case 'commercial': return Store;
      default: return Home;
    }
  };

  const getUnitTypeColor = (type: string) => {
    switch (type) {
      case 'villa': return 'bg-green-100 text-green-800';
      case 'apartment': return 'bg-blue-100 text-blue-800';
      case 'commercial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalTeams = template.categories.reduce((sum, cat) => sum + cat.teams.length, 0);
  const totalDuration = template.categories.reduce((sum, cat) => sum + cat.duration_days, 0);

  const IconComponent = getUnitTypeIcon(template.unit_type);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <IconComponent className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUnitTypeColor(template.unit_type)}`}>
                {template.unit_type}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={onDuplicate}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Duplicate Template"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Edit Template"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete Template"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {template.description && (
        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Building className="h-4 w-4 mr-1" />
            Categories
          </div>
          <span className="font-medium text-gray-900">{template.categories.length}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            Team Assignments
          </div>
          <span className="font-medium text-gray-900">{totalTeams}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            Estimated Duration
          </div>
          <span className="font-medium text-gray-900">{totalDuration} days</span>
        </div>
      </div>

      {template.categories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-600 mb-2">Categories:</div>
          <div className="space-y-1">
            {template.categories.slice(0, 3).map((category, index) => (
              <div key={index} className="flex items-center justify-between text-xs text-gray-600">
                <span>{category.name}</span>
                <span>{category.teams.length} teams • {category.duration_days}d</span>
              </div>
            ))}
            {template.categories.length > 3 && (
              <div className="text-xs text-gray-500 italic">
                +{template.categories.length - 3} more categories...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateCard;