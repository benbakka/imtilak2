import React, { useState, useEffect } from 'react';
import { X, Save, Home, Copy, BookTemplate as FileTemplate, ChevronDown, ChevronRight } from 'lucide-react';
import { Unit, UnitTemplate } from '../../types';
import { TemplateService } from '../../lib/templateService';
import { useAuth } from '../../contexts/AuthContext';

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: Partial<Unit>, useTemplate?: boolean, templateData?: any) => void;
  projectId: string;
  projectName: string;
  unit?: Unit;
  availableUnits?: Unit[]; // For cloning
  availableTemplates?: UnitTemplate[]; // For templates
    onCloneUnit?: (newUnitData: Partial<Unit>) => void;
}

const UnitModal: React.FC<UnitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectId,
  projectName,
  unit,
  availableUnits = [],
  availableTemplates = [],
  onCloneUnit
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    type: 'villa' as 'villa' | 'apartment' | 'commercial',
    floor: '',
    area: '',
    description: ''
  });

  const [creationMode, setCreationMode] = useState<'blank' | 'template' | 'clone'>('blank');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCloneUnit, setSelectedCloneUnit] = useState<string>('');
  const [showTemplateDetails, setShowTemplateDetails] = useState<string>('');
  const [showCloneDetails, setShowCloneDetails] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<UnitTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name,
        type: unit.type,
        floor: unit.floor || '',
        area: unit.area?.toString() || '',
        description: unit.description || ''
      });
      setCreationMode('blank');
    } else {
      setFormData({
        name: '',
        type: 'villa',
        floor: '',
        area: '',
        description: ''
      });
      setCreationMode('blank');
    }
    setSelectedTemplate('');
    setSelectedCloneUnit('');
    setErrors({});
    
    // Load templates if needed
    if (isOpen && !unit && user?.company_id) {
      loadTemplates();
    }
  }, [unit, isOpen, user?.company_id]);

  const loadTemplates = async () => {
    if (!user?.company_id) return;
    
    try {
      setLoading(true);
      const response = await TemplateService.getTemplates(user.company_id);
      setTemplates(response.content);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Use available templates as fallback
      setTemplates(availableTemplates);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Unit name is required';
    }

    if (formData.type === 'apartment' && !formData.floor?.trim()) {
      newErrors.floor = 'Floor is required for apartments';
    }

    if (formData.area && (isNaN(Number(formData.area)) || Number(formData.area) <= 0)) {
      newErrors.area = 'Area must be a positive number';
    }

    if (creationMode === 'template' && !selectedTemplate) {
      newErrors.template = 'Please select a template';
    }

    if (creationMode === 'clone' && !selectedCloneUnit) {
      newErrors.clone = 'Please select a unit to clone';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const unitData = {
      ...formData,
      project_id: projectId,
      area: formData.area ? Number(formData.area) : undefined,
      floor: formData.type === 'apartment' ? formData.floor : undefined,
      id: unit?.id
    };

    if (creationMode === 'clone' && onCloneUnit) {
            onCloneUnit(unitData);
    } else if (creationMode === 'template') {
      const template = templates.find(t => t.id === selectedTemplate) || 
                      availableTemplates.find(t => t.id === selectedTemplate);
      onSave(unitData, true, { template });
    } else {
      onSave(unitData);
    }
    
    onClose();
  };

  const getUnitTypeIcon = (type: string) => {
    switch (type) {
      case 'villa': return '🏠';
      case 'apartment': return '🏢';
      case 'commercial': return '🏪';
      default: return '🏠';
    }
  };

  const filteredTemplates = templates.filter(t => t.unit_type === formData.type);
  const filteredUnits = availableUnits.filter(u => u.type === formData.type && u.id !== unit?.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {unit ? 'Edit Unit' : 'Create New Unit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Project:</div>
            <div className="font-medium text-gray-900">{projectName}</div>
          </div>

          {/* Creation Mode Selection (only for new units) */}
          {!unit && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">How would you like to create this unit?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCreationMode('blank')}
                  className={`p-3 border-2 rounded-lg text-left transition-colors ${
                    creationMode === 'blank'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Home className="h-5 w-5 mb-2" />
                  <div className="font-medium">Start Blank</div>
                  <div className="text-xs text-gray-600">Create from scratch</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCreationMode('template')}
                  className={`p-3 border-2 rounded-lg text-left transition-colors ${
                    creationMode === 'template'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileTemplate className="h-5 w-5 mb-2" />
                  <div className="font-medium">Use Template</div>
                  <div className="text-xs text-gray-600">Predefined categories & teams</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCreationMode('clone')}
                  className={`p-3 border-2 rounded-lg text-left transition-colors ${
                    creationMode === 'clone'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Copy className="h-5 w-5 mb-2" />
                  <div className="font-medium">Clone Unit</div>
                  <div className="text-xs text-gray-600">Copy from existing unit</div>
                </button>
              </div>
            </div>
          )}

          {/* Unit Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unit Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Villa 1, Appartement A1"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Unit Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="villa">🏠 Villa</option>
                <option value="apartment">🏢 Apartment</option>
                <option value="commercial">🏪 Commercial</option>
              </select>
            </div>

            {/* Floor (for apartments) */}
            {formData.type === 'apartment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.floor ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., RDC, 1er étage"
                />
                {errors.floor && (
                  <p className="mt-1 text-sm text-red-600">{errors.floor}</p>
                )}
              </div>
            )}

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (m²)
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.area ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 120, 250.5"
              />
              {errors.area && (
                <p className="mt-1 text-sm text-red-600">{errors.area}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unit description..."
              />
            </div>
          </div>

          {/* Template Selection */}
          {!unit && creationMode === 'template' && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Template</h3>
              {loading ? (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading templates...</p>
                </div>
              ) : filteredTemplates.length > 0 ? (
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg">
                      <div className="p-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="template"
                            value={template.id}
                            checked={selectedTemplate === template.id}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{template.name}</div>
                                <div className="text-sm text-gray-600">{template.description}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {template.categories.length} categories • {template.categories.reduce((sum, cat) => sum + cat.teams.length, 0)} team assignments
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowTemplateDetails(showTemplateDetails === template.id ? '' : template.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showTemplateDetails === template.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </label>
                      </div>
                      
                      {showTemplateDetails === template.id && (
                        <div className="border-t border-gray-200 p-3 bg-white">
                          <div className="text-xs font-medium text-gray-700 mb-2">Categories included:</div>
                          <div className="space-y-2">
                            {template.categories.map((category) => (
                              <div key={category.id} className="flex items-center justify-between text-xs">
                                <span className="font-medium">{category.name}</span>
                                <span className="text-gray-500">{category.duration_days} days • {category.teams.length} teams</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No templates available for {formData.type} units
                </div>
              )}
              {errors.template && (
                <p className="mt-2 text-sm text-red-600">{errors.template}</p>
              )}
            </div>
          )}

          {/* Clone Selection */}
          {!unit && creationMode === 'clone' && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Unit to Clone</h3>
              {filteredUnits.length > 0 ? (
                <div className="space-y-3">
                  {filteredUnits.map((cloneUnit) => (
                    <div key={cloneUnit.id} className="border border-gray-200 rounded-lg">
                      <div className="p-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="clone"
                            value={cloneUnit.id}
                            checked={selectedCloneUnit === cloneUnit.id}
                            onChange={(e) => setSelectedCloneUnit(e.target.value)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{cloneUnit.name}</div>
                                <div className="text-sm text-gray-600">
                                  {getUnitTypeIcon(cloneUnit.type)} {cloneUnit.type}
                                  {cloneUnit.area && ` • ${cloneUnit.area}m²`}
                                  {cloneUnit.floor && ` • ${cloneUnit.floor}`}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowCloneDetails(showCloneDetails === cloneUnit.id ? '' : cloneUnit.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showCloneDetails === cloneUnit.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </label>
                      </div>
                      
                      {showCloneDetails === cloneUnit.id && (
                        <div className="border-t border-gray-200 p-3 bg-white">
                          <div className="text-xs text-gray-500">
                            This will copy all categories, team assignments, and tasks from {cloneUnit.name} to your new unit.
                            You can modify them later as needed.
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No {formData.type} units available to clone in this project
                </div>
              )}
              {errors.clone && (
                <p className="mt-2 text-sm text-red-600">{errors.clone}</p>
              )}
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getUnitTypeIcon(formData.type)}</span>
              <span className="font-medium">
                {formData.name || 'Unit Name'}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {formData.type}
              </span>
              {formData.floor && (
                <span className="text-sm text-gray-600">
                  {formData.floor}
                </span>
              )}
              {formData.area && (
                <span className="text-sm text-gray-600">
                  {formData.area}m²
                </span>
              )}
              {!unit && creationMode !== 'blank' && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  creationMode === 'template' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {creationMode === 'template' ? 'From Template' : 'Cloned'}
                </span>
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
              {unit ? 'Update Unit' : 'Create Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitModal;