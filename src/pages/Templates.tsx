import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Building, Home, Store } from 'lucide-react';
import { UnitTemplate, Team } from '../types';
import TemplateModal from '../components/TemplateManagement/TemplateModal';
import TemplateCard from '../components/TemplateManagement/TemplateCard';
import { useAuth } from '../contexts/AuthContext';
import { TeamService } from '../lib/teamService';
import { TemplateService } from '../lib/templateService';

const Templates: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<UnitTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'villa' | 'apartment' | 'commercial'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UnitTemplate | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [user?.company_id]);

  const loadData = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      setError('');

      // Load teams for template creation
      const teamsResponse = await TeamService.getAllActiveTeams(user.company_id);
      setTeams(teamsResponse);

      // Load templates
      try {
        const templatesResponse = await TemplateService.getTemplates(user.company_id, 0, 100);
        setTemplates(templatesResponse.content);
      } catch (templateError) {
        console.error('Error loading templates:', templateError);
        // If API fails, use initial templates for demo
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error loading template data:', error);
      setError('Failed to load teams data');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.unit_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowModal(true);
  };

  const handleEditTemplate = (template: UnitTemplate) => {
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      if (user?.company_id) {
        await TemplateService.deleteTemplate(templateId, user.company_id);
        setTemplates(templates.filter(t => t.id !== templateId));
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleDuplicateTemplate = async (template: UnitTemplate) => {
    try {
      if (user?.company_id) {
        const duplicateData = {
          name: `${template.name} (Copy)`,
          description: template.description,
          unit_type: template.unit_type,
          categories: template.categories.map(cat => ({
            name: cat.name,
            order: cat.order,
            duration_days: cat.duration_days,
            teams: cat.teams.map(team => ({
              team_id: team.team_id,
              tasks: team.tasks,
              notes: team.notes
            }))
          }))
        };

        const newTemplate = await TemplateService.createTemplate(user.company_id, duplicateData);
        setTemplates([...templates, newTemplate]);
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Failed to duplicate template. Please try again.');
    }
  };

  const handleSaveTemplate = async (templateData: Partial<UnitTemplate>) => {
    try {
      if (!user?.company_id) return;

      if (editingTemplate) {
        // Update existing template
        const updatedTemplate = await TemplateService.updateTemplate(
          editingTemplate.id,
          user.company_id,
          {
            id: editingTemplate.id,
            name: templateData.name!,
            description: templateData.description!,
            unit_type: templateData.unit_type!,
            categories: templateData.categories?.map(cat => ({
              name: cat.name!,
              order: cat.order!,
              duration_days: cat.duration_days!,
              teams: cat.teams!.map(team => ({
                team_id: team.team_id!,
                tasks: team.tasks || [],
                notes: team.notes || ''
              }))
            })) || []
          }
        );
        
        setTemplates(templates.map(t => 
          t.id === editingTemplate.id ? updatedTemplate : t
        ));
      } else {
        // Create new template
        const newTemplate = await TemplateService.createTemplate(
          user.company_id,
          {
            name: templateData.name!,
            description: templateData.description!,
            unit_type: templateData.unit_type!,
            categories: templateData.categories?.map(cat => ({
              name: cat.name!,
              order: cat.order!,
              duration_days: cat.duration_days!,
              teams: cat.teams!.map(team => ({
                team_id: team.team_id!,
                tasks: team.tasks || [],
                notes: team.notes || ''
              }))
            })) || []
          }
        );
        
        setTemplates([...templates, newTemplate]);
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const getTypeStats = () => {
    const stats = {
      all: templates.length,
      villa: templates.filter(t => t.unit_type === 'villa').length,
      apartment: templates.filter(t => t.unit_type === 'apartment').length,
      commercial: templates.filter(t => t.unit_type === 'commercial').length
    };
    return stats;
  };

  const stats = getTypeStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unit Templates</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage reusable templates for your construction units
          </p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Building className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.all}</div>
              <div className="text-sm text-gray-600">Total Templates</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Home className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.villa}</div>
              <div className="text-sm text-gray-600">Villa Templates</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Building className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.apartment}</div>
              <div className="text-sm text-gray-600">Apartment Templates</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Store className="h-5 w-5 text-orange-500 mr-2" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.commercial}</div>
              <div className="text-sm text-gray-600">Commercial Templates</div>
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
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="villa">Villa</option>
              <option value="apartment">Apartment</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={() => handleEditTemplate(template)}
            onDelete={() => handleDeleteTemplate(template.id)}
            onDuplicate={() => handleDuplicateTemplate(template)}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Building className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search criteria'
              : 'Get started by creating your first template'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </button>
          )}
        </div>
      )}

      {/* Template Modal */}
      <TemplateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveTemplate}
        template={editingTemplate || undefined}
        availableTeams={teams}
      />
    </div>
  );
};

export default Templates;