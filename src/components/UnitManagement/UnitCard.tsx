import React from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Unit, Category } from '../../types';

interface UnitCardProps {
  unit: Unit;
  categories: Category[];
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
  onAddCategory: () => void;
  onSelect: () => void;
}

const UnitCard: React.FC<UnitCardProps> = ({
  unit,
  categories,
  onEdit,
  onDelete,
  onAddCategory,
  onSelect
}) => {
  const getUnitTypeIcon = (type: string) => {
    switch (type) {
      case 'villa': return '🏠';
      case 'apartment': return '🏢';
      case 'commercial': return '🏪';
      default: return '🏠';
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getUnitTypeIcon(unit.type)}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{unit.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUnitTypeColor(unit.type)}`}>
                {unit.type}
              </span>
              {unit.floor && (
                <span className="text-xs text-gray-600">{unit.floor}</span>
              )}
              {unit.area && (
                <span className="text-xs text-gray-600">{unit.area}m²</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Categories</span>
          <button
            onClick={onAddCategory}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </button>
        </div>
        
        {categories.length > 0 ? (
          <div className="text-sm text-gray-600">
            {categories.length} categories defined
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            No categories yet
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitCard;