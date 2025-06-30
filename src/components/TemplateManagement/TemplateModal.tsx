import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Copy, Building, Home, Store, ChevronDown, ChevronRight } from 'lucide-react';
import { UnitTemplate, TemplateCategory, TemplateCategoryTeam, Team } from '../../types';
import { TemplateCategoryRequest, TemplateCategoryTeamRequest } from '../../lib/templateService';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Partial<UnitTemplate>) => void;
  template?: UnitTemplate;
  availableTeams: Team[];
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  template,
  availableTeams
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit_type: 'villa' as 'villa' | 'apartment' | 'commercial'
  });

  const [categories, setCategories] = useState<Partial<TemplateCategory>[]>([]);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        unit_type: template.unit_type
      });
      setCategories(template.categories || []);
    } else {
      setFormData({
        name: '',
        description: '',
        unit_type: 'villa'
      });
      setCategories([]);
    }
  }, [template, isOpen]);

  const addCategory = () => {
    const newCategory: Partial<TemplateCategory> = {
      name: '',
      order: categories.length + 1,
      duration_days: 30,
      teams: []
    };
    setCategories([...categories, newCategory]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, field: string, value: any) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const addTeamToCategory = (categoryIndex: number) => {
    const updated = [...categories];
    const newTeam: Partial<TemplateCategoryTeam> = {
      team_id: '',
      tasks: [],
      notes: ''
    };
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      teams: [...(updated[categoryIndex].teams || []), newTeam]
    };
    setCategories(updated);
  };

  const removeTeamFromCategory = (categoryIndex: number, teamIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      teams: updated[categoryIndex].teams?.filter((_, i) => i !== teamIndex) || []
    };
    setCategories(updated);
  };

  const updateCategoryTeam = (categoryIndex: number, teamIndex: number, field: string, value: any) => {
    const updated = [...categories];
    const teams = [...(updated[categoryIndex].teams || [])];
    teams[teamIndex] = { ...teams[teamIndex], [field]: value };
    updated[categoryIndex] = { ...updated[categoryIndex], teams };
    setCategories(updated);
  };

  const updateTeamTasks = (categoryIndex: number, teamIndex: number, tasks: string) => {
    const taskArray = tasks.split(',').map(t => t.trim()).filter(t => t);
    updateCategoryTeam(categoryIndex, teamIndex, 'tasks', taskArray);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert categories to the format expected by the API
    const processedCategories: TemplateCategoryRequest[] = categories
      .filter(cat => cat.name?.trim())
      .map(cat => ({
        name: cat.name || '',
        order: cat.order || 1,
        duration_days: cat.duration_days || 30,
        teams: (cat.teams || [])
          .filter(team => team.team_id)
          .map(team => ({
            team_id: team.team_id || '',
            tasks: team.tasks || [],
            notes: team.notes || ''
          }))
      }));
    
    const templateData = {
      ...formData,
      categories: processedCategories,
      id: template?.id
    };

    onSave(templateData);
  };

  const getUnitTypeIcon = (type: string) => {
    switch (type) {
      case 'villa': return Home;
      case 'apartment': return Building;
      case 'commercial': return Store;
      default: return Home;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Template Basic Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Template Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Villa Standard Template"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Type *
                </label>
                <select
                  required
                  value={formData.unit_type}
                  onChange={(e) => setFormData({ ...formData, unit_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="villa">🏠 Villa</option>
                  <option value="apartment">🏢 Apartment</option>
                  <option value="commercial">🏪 Commercial</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what this template includes..."
                />
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Categories & Teams</h3>
              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-green-700 bg-green-100 hover:bg-green-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </button>
            </div>

            <div className="space-y-6">
              {categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Category #{categoryIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeCategory(categoryIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={category.name || ''}
                        onChange={(e) => updateCategory(categoryIndex, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Fondation, Électricité"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={category.order || 1}
                        onChange={(e) => updateCategory(categoryIndex, 'order', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={category.duration_days || 30}
                        onChange={(e) => updateCategory(categoryIndex, 'duration_days', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Teams for this category */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-700">Teams</h5>
                      <button
                        type="button"
                        onClick={() => addTeamToCategory(categoryIndex)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Team
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(category.teams || []).map((team, teamIndex) => {
                        const selectedTeam = availableTeams.find(t => t.id === team.team_id);
                        
                        return (
                          <div key={teamIndex} className="bg-gray-50 p-3 rounded border">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-700">Team #{teamIndex + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeTeamFromCategory(categoryIndex, teamIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Select Team *
                                </label>
                                <select
                                  required
                                  value={team.team_id || ''}
                                  onChange={(e) => updateCategoryTeam(categoryIndex, teamIndex, 'team_id', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="">Choose a team...</option>
                                  {availableTeams.map(t => (
                                    <option key={t.id} value={t.id}>
                                      {t.name} ({t.specialty})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Tasks (comma-separated)
                                </label>
                                <input
                                  type="text"
                                  value={team.tasks?.join(', ') || ''}
                                  onChange={(e) => updateTeamTasks(categoryIndex, teamIndex, e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="e.g., Creusage, Bétonnage"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Notes
                                </label>
                                <textarea
                                  value={team.notes || ''}
                                  onChange={(e) => updateCategoryTeam(categoryIndex, teamIndex, 'notes', e.target.value)}
                                  rows={2}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Additional notes for this team assignment..."
                                />
                              </div>
                            </div>

                            {selectedTeam && (
                              <div className="mt-2 p-2 bg-white rounded text-xs">
                                <div className="flex items-center">
                                  <div 
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: selectedTeam.color }}
                                  ></div>
                                  <span className="font-medium">{selectedTeam.name}</span>
                                  <span className="text-gray-500 ml-2">({selectedTeam.specialty})</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {(category.teams || []).length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No teams assigned to this category yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No categories defined yet</p>
                  <p className="text-sm">Click "Add Category" to start building your template</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {categories.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Template Preview</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-3">
                  {React.createElement(getUnitTypeIcon(formData.unit_type), { className: "h-5 w-5 text-blue-600" })}
                  <span className="font-medium">{formData.name || 'Template Name'}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {formData.unit_type}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div>📋 {categories.length} categories</div>
                  <div>👥 {categories.reduce((sum, cat) => sum + (cat.teams?.length || 0), 0)} team assignments</div>
                  <div>⏱️ {categories.reduce((sum, cat) => sum + (cat.duration_days || 0), 0)} total days estimated</div>
                </div>
                
                <div className="mt-3 space-y-1">
                  {categories.map((cat, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center justify-between">
                      <span>{index + 1}. {cat.name}</span>
                      <span>{cat.duration_days} days • {cat.teams?.length || 0} teams</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
              {template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateModal;