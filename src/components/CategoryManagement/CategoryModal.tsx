import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Users, Save } from 'lucide-react';
import { Category, Team, CategoryTeam } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Partial<Category>, teams: Partial<CategoryTeam>[]) => void;
  unitId: string;
  unitName: string;
  category?: Category;
  existingTeams?: CategoryTeam[];
  availableTeams: Team[];
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  unitId,
  unitName,
  category,
  existingTeams = [],
  availableTeams
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    order: 1
  });

  const [assignedTeams, setAssignedTeams] = useState<Partial<CategoryTeam>[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        start_date: category.start_date,
        end_date: category.end_date,
        order: category.order
      });
      setAssignedTeams(existingTeams);
    } else {
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        order: 1
      });
      setAssignedTeams([]);
    }
    setErrors({});
  }, [category, existingTeams, isOpen]);

  const addTeam = () => {
    setAssignedTeams([...assignedTeams, {
      team_id: '',
      status: 'not_started',
      reception_status: false,
      payment_status: false,
      notes: '',
      tasks: []
    }]);
  };

  const removeTeam = (index: number) => {
    setAssignedTeams(assignedTeams.filter((_, i) => i !== index));
  };

  const updateTeam = (index: number, field: string, value: any) => {
    const updated = [...assignedTeams];
    updated[index] = { ...updated[index], [field]: value };
    setAssignedTeams(updated);
  };

  const updateTeamTasks = (index: number, tasks: string) => {
    const taskArray = tasks.split(',').map(t => t.trim()).filter(t => t);
    updateTeam(index, 'tasks', taskArray);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    
    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const categoryData = {
      ...formData,
      unit_id: unitId,
      id: category?.id
    };

    const validTeams = assignedTeams.filter(team => team.team_id);
    
    onSave(categoryData, validTeams);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Create New Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Basic Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Information</h3>
            <div className="text-sm text-gray-600 mb-4">
              Unit: <span className="font-medium">{unitName}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Fondation, Électricité, Plomberie"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.start_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.end_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Category description..."
                />
              </div>
            </div>
          </div>

          {/* Team Assignments */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Team Assignments</h3>
              <button
                type="button"
                onClick={addTeam}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Team
              </button>
            </div>

            <div className="space-y-4">
              {assignedTeams.map((teamAssignment, index) => {
                const selectedTeam = availableTeams.find(t => t.id === teamAssignment.team_id);
                
                return (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Team Assignment #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeTeam(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Team *
                        </label>
                        <select
                          required
                          value={teamAssignment.team_id || ''}
                          onChange={(e) => updateTeam(index, 'team_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Choose a team...</option>
                          {availableTeams.map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name} ({team.specialty})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={teamAssignment.status || 'not_started'}
                          onChange={(e) => updateTeam(index, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                          <option value="delayed">Delayed</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tasks (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={teamAssignment.tasks?.join(', ') || ''}
                          onChange={(e) => updateTeamTasks(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Creusage, Bétonnage, Ferraillage"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={teamAssignment.notes || ''}
                          onChange={(e) => updateTeam(index, 'notes', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Additional notes or observations..."
                        />
                      </div>

                      <div className="flex items-center space-x-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={teamAssignment.reception_status || false}
                            onChange={(e) => updateTeam(index, 'reception_status', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Reception Complete</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={teamAssignment.payment_status || false}
                            onChange={(e) => updateTeam(index, 'payment_status', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Payment Complete</span>
                        </label>
                      </div>
                    </div>

                    {selectedTeam && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: selectedTeam.color }}
                          ></div>
                          <span className="font-medium">{selectedTeam.name}</span>
                          <span className="text-gray-600 ml-2">({selectedTeam.specialty})</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {assignedTeams.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No teams assigned yet</p>
                  <p className="text-sm">Click "Add Team" to assign teams to this category</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;