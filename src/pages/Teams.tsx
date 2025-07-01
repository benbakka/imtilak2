import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Wrench, Zap, Droplets, Shield, Edit, Trash2, Eye, X, Save } from 'lucide-react';
import { Team } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { TeamService } from '../lib/teamService';

const specialtyIcons = {
  'Electrical': Zap,
  'Plumbing': Droplets,
  'Waterproofing': Shield,
  'Masonry': Wrench,
  'General': Users,
  'Terrassement': Wrench,
  'Ferraillage': Shield,
  'Électricité': Zap,
  'Maçonnerie': Wrench,
  'Finitions': Users
};

const specialtyOptions = [
  'Electrical',
  'Plumbing', 
  'Waterproofing',
  'Masonry',
  'Carpentry',
  'Painting',
  'Roofing',
  'HVAC',
  'General',
  'Terrassement',
  'Ferraillage',
  'Électricité',
  'Maçonnerie',
  'Finitions'
];

const colorOptions = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280'  // Gray
];

const Teams: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      if (!user.company_id) {
        console.warn('User is missing company_id, using default value');
        user.company_id = '1';
      }
      loadTeams();
    }
  }, [user]);

  const loadTeams = async (): Promise<void> => {
    if (!user?.company_id) {
      console.log('No company ID available, cannot load teams');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // First, get all teams to have a complete list of team objects
      const allTeamsResponse = await TeamService.getAllActiveTeams(user.company_id);
      
      // Create a map of team IDs to team objects for quick lookup
      const teamMap = new Map<number, Team>();
      allTeamsResponse.forEach(team => {
        if (team && typeof team === 'object' && team.id) {
          teamMap.set(Number(team.id), team);
        }
      });
      
      // Now get the paginated teams response
      const teamsResponse = await TeamService.getTeams(user.company_id, 0, 100);

      if (!teamsResponse.content) {
        console.error('Invalid teams response format:', teamsResponse);
        setError('Invalid response format from server');
        return;
      }

      const normalizedTeams = teamsResponse.content.map(team => {
        // If team is a number (ID), look it up in our team map
        if (typeof team === 'number') {
          const fullTeam = teamMap.get(team);
          if (fullTeam) {
            return fullTeam;
          }
          console.warn(`Team with ID ${team} not found in the complete teams list`);
          return null;
        }
        
        // If team is not a proper object or missing name
        if (!team || typeof team !== 'object' || !team.name) {
          console.warn('Invalid team data found:', team);
          return null;
        }
        
        return {
          id: team.id || String(Math.random()),
          name: team.name,
          specialty: team.specialty || 'General',
          company_id: team.company_id || user.company_id,
          color: team.color || colorOptions[Math.floor(Math.random() * colorOptions.length)],
          created_at: team.created_at || new Date().toISOString(),
          description: team.description || '',
          is_active: team.is_active !== false
        } as Team;
      }).filter((team): team is Team => team !== null);
      
      setTeams(normalizedTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    if (!searchTerm.trim()) {
      return true;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return (
      team.name.toLowerCase().includes(searchLower) ||
      team.specialty.toLowerCase().includes(searchLower)
    );
  });

  const handleCreateTeam = () => {
    setEditingTeam(null);
    setShowCreateModal(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setShowCreateModal(true);
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.') || !user?.company_id) {
      return;
    }

    try {
      await TeamService.deleteTeam(teamId, user.company_id);
      await loadTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team');
    }
  };

  const handleViewDetails = async (team: Team) => {
    try {
      if (user?.company_id) {
        const teamDetail = await TeamService.getTeam(team.id, user.company_id);
        setSelectedTeam(teamDetail);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error loading team details:', error);
      setSelectedTeam(team);
      setShowDetailsModal(true);
    }
  };

  const TeamCard: React.FC<{ team: Team }> = ({ team }) => {
    const IconComponent = specialtyIcons[team.specialty as keyof typeof specialtyIcons] || Users;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: `${team.color}20`, color: team.color }}
            >
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
              <p className="text-sm text-gray-600">{team.specialty}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleViewDetails(team)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleEditTeam(team)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Edit Team"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleDeleteTeam(team.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete Team"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button 
            onClick={() => handleViewDetails(team)}
            className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View Team Details
          </button>
        </div>
      </div>
    );
  };

  const TeamModal: React.FC = () => {
    const [formData, setFormData] = useState({
      name: '',
      specialty: '',
      color: colorOptions[0],
      description: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useEffect(() => {
      if (editingTeam) {
        setFormData({
          name: editingTeam.name,
          specialty: editingTeam.specialty,
          color: editingTeam.color,
          description: editingTeam.description || ''
        });
      } else {
        setFormData({
          name: '',
          specialty: '',
          color: colorOptions[0],
          description: ''
        });
      }
      setErrors({});
    }, [editingTeam, showCreateModal]);

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      if (!formData.name.trim()) {
        newErrors.name = 'Team name is required';
      }

      if (!formData.specialty) {
        newErrors.specialty = 'Specialty is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm() || !user?.company_id) {
        return;
      }

      setIsSubmitting(true);
      try {
        const completeFormData = {
          name: formData.name.trim(),
          specialty: formData.specialty,
          color: formData.color || colorOptions[0],
          description: formData.description || ''
        };
        
        if (editingTeam) {
          await TeamService.updateTeam(editingTeam.id, user.company_id, completeFormData);
          setTeams(prevTeams => 
            prevTeams.map(team => 
              team.id === editingTeam.id 
                ? { ...team, ...completeFormData }
                : team
            )
          );
        } else {
          const newTeam = await TeamService.createTeam(user.company_id, completeFormData);
          if (newTeam) {
            const newTeamWithDefaults = {
              ...completeFormData,
              id: newTeam.id || String(Math.random()),
              company_id: user.company_id,
              created_at: new Date().toISOString(),
              is_active: true
            };
            setTeams(prevTeams => [...prevTeams, newTeamWithDefaults]);
          }
        }

        await loadTeams();
        setShowCreateModal(false);
      } catch (error) {
        console.error('Error saving team:', error);
        setError('Failed to save team');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleClose = () => {
      setShowCreateModal(false);
      setFormData({ name: '', specialty: '', color: colorOptions[0], description: '' });
      setErrors({});
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingTeam ? 'Edit Team' : 'Create New Team'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Équipe Électricité"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty *
              </label>
              <select
                required
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.specialty ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a specialty...</option>
                {specialtyOptions.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              {errors.specialty && (
                <p className="mt-1 text-sm text-red-600">{errors.specialty}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg border-2 ${
                      formData.color === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Team description..."
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: `${formData.color}20`, color: formData.color }}
                >
                  {React.createElement(
                    specialtyIcons[formData.specialty as keyof typeof specialtyIcons] || Users,
                    { className: "h-4 w-4" }
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {formData.name || 'Team Name'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formData.specialty || 'Specialty'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : (editingTeam ? 'Update Team' : 'Create Team')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TeamDetailsModal: React.FC = () => {
    if (!showDetailsModal || !selectedTeam) return null;

    const IconComponent = specialtyIcons[selectedTeam.specialty as keyof typeof specialtyIcons] || Users;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Team Details</h3>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center mr-4"
                style={{ backgroundColor: `${selectedTeam.color}20`, color: selectedTeam.color }}
              >
                <IconComponent className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedTeam.name}</h2>
                <p className="text-gray-600">{selectedTeam.specialty}</p>
                <p className="text-sm text-gray-500">Created: {new Date(selectedTeam.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedTeam.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedTeam.description}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEditTeam(selectedTeam);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Team
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="col-span-full text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
      <p className="text-gray-600 mb-4">
        {searchTerm
          ? 'Try adjusting your search criteria'
          : 'Get started by creating your first team'}
      </p>
      {!searchTerm && (
        <button
          onClick={handleCreateTeam}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Team
        </button>
      )}
    </div>
  );

  const renderLoadingState = () => (
    <div className="col-span-full text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Loading teams...</h3>
    </div>
  );

  const renderErrorState = () => (
    <div className="col-span-full text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <X className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading teams</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={loadTeams}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your construction teams and specialties
          </p>
        </div>
        <button
          onClick={handleCreateTeam}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Team
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : filteredTeams.length === 0 ? (
          renderEmptyState()
        ) : (
          filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))
        )}
      </div>

      <TeamModal />
      <TeamDetailsModal />
    </div>
  );
};

export default Teams;