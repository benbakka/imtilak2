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
    // Check if user is loaded and has a company_id
    if (user) {
      if (!user.company_id) {
        console.warn('User is missing company_id, using default value');
        // For demo purposes, use a default company ID if missing
        user.company_id = '1';
      }
      loadTeams();
    }
  }, [user]);

  const loadTeams = async () => {
    if (!user?.company_id) {
      console.log('No company ID available, cannot load teams');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Attempting to load teams for company ID:', user.company_id);
      
      // Use getAllActiveTeams to get all active teams without pagination
      const teamsResponse = await TeamService.getAllActiveTeams(user.company_id);
      console.log('Teams response type:', typeof teamsResponse);
      console.log('Teams response:', teamsResponse);
      
      // Handle different response formats
      let teamsData = teamsResponse;
      
      // If the response is an object with a content property that is an array, use that
      if (!Array.isArray(teamsResponse) && teamsResponse && typeof teamsResponse === 'object' && Array.isArray(teamsResponse.content)) {
        console.log('Response has content array, using that instead');
        teamsData = teamsResponse.content;
      }
      
      // If we have a single team object, wrap it in an array
      if (!Array.isArray(teamsData) && teamsData && typeof teamsData === 'object' && teamsData.id) {
        console.log('Response is a single team object, wrapping in array');
        teamsData = [teamsData];
      }
      
      // Ensure we have an array to work with
      if (!Array.isArray(teamsData)) {
        console.error('Could not extract teams array from response:', teamsResponse);
        setTeams([]);
        setError('Received invalid data format from server');
        return;
      }
      
      // Check if we have any teams
      if (teamsData.length === 0) {
        console.log('No teams returned from server');
        setTeams([]);
        return;
      }
      
      // Ensure all teams have the required properties
      teamsData = teamsData.map(team => {
        if (!team) return null;
        
        // Create a new team object with all required properties
        return {
          id: team.id || String(Math.random()), // Ensure ID exists
          name: team.name || 'Unnamed Team',
          specialty: team.specialty || 'General',
          company_id: team.company_id || user.company_id,
          color: team.color || colorOptions[Math.floor(Math.random() * colorOptions.length)], // Random color from options
          created_at: team.created_at || new Date().toISOString(),
          description: team.description || '',
          is_active: team.is_active !== false // Default to active if not specified
        };
      }).filter(Boolean); // Remove any null entries
      
      // Log each team for debugging
      teamsData.forEach((team, index) => {
        console.log(`Team ${index}:`, team.id, team.name, team.specialty, team.color);
      });
      
      console.log('Total teams after normalization:', teamsData.length);
      
      // Set the teams state with normalized teams
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading teams:', error);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  // Filter teams based on search term
  const filteredTeams = teams.filter(team => {
    // If no search term, include all teams
    if (!searchTerm.trim()) {
      return true;
    }
    
    // Otherwise filter by name or specialty
    const searchLower = searchTerm.toLowerCase();
    return (
      team.name.toLowerCase().includes(searchLower) ||
      team.specialty.toLowerCase().includes(searchLower)
    );
  });
  
  console.log('Teams after filtering:', filteredTeams.length, 'of', teams.length);
  console.log('Filtered teams details:', filteredTeams.map(team => ({ id: team.id, name: team.name, specialty: team.specialty })));

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
    console.log('TeamCard rendering for team:', team.id, team.name);
    
    // No need to check for required properties as they're now guaranteed by loadTeams
    // Just use the properties directly with confidence
    
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
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Active Projects</span>
            <span className="font-medium text-gray-900">3</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tasks in Progress</span>
            <span className="font-medium text-gray-900">12</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Completion Rate</span>
            <span className="font-medium text-green-600">85%</span>
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

  // Create/Edit Team Modal
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
        // Ensure all required fields are present in the form data
        const completeFormData = {
          ...formData,
          // Add any missing fields with default values
          name: formData.name.trim(),
          specialty: formData.specialty,
          color: formData.color || colorOptions[0],
          description: formData.description || ''
        };
        
        console.log('Submitting team data:', completeFormData);
        
        let newTeam;
        if (editingTeam) {
          // Update existing team
          console.log('Updating team with ID:', editingTeam.id);
          newTeam = await TeamService.updateTeam(editingTeam.id, user.company_id, completeFormData);
          console.log('Team updated successfully:', newTeam);
          
          // Update the team in the current state immediately
          setTeams(prevTeams => {
            return prevTeams.map(team => 
              team.id === editingTeam.id ? {
                ...team,
                ...completeFormData,
                id: editingTeam.id,
                company_id: user.company_id
              } : team
            );
          });
        } else {
          // Create new team
          console.log('Creating new team for company ID:', user.company_id);
          newTeam = await TeamService.createTeam(user.company_id, completeFormData);
          console.log('Team created successfully:', newTeam);
          
          // If we got a response with the new team
          if (newTeam) {
            // Add the new team to the current state immediately
            const newTeamWithDefaults = {
              ...completeFormData,
              id: newTeam.id || String(Math.random()),
              company_id: user.company_id,
              created_at: new Date().toISOString(),
              is_active: true
            };
            
            console.log('Adding new team to state:', newTeamWithDefaults);
            setTeams(prevTeams => [...prevTeams, newTeamWithDefaults]);
          }
        }

        // Also reload teams from server to ensure we have the latest data
        loadTeams();
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

            {/* Preview */}
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

  // Team Details Modal
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
            {/* Team Header */}
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

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-blue-600">Active Projects</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-green-600">Tasks in Progress</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">45</div>
                <div className="text-sm text-yellow-600">Completed Tasks</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">85%</div>
                <div className="text-sm text-purple-600">Success Rate</div>
              </div>
            </div>

            {/* Recent Projects */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Recent Projects</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Résidence Azure</div>
                    <div className="text-sm text-gray-600">Fondation work</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Villa Moderne</div>
                    <div className="text-sm text-gray-600">Electrical installation</div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    In Progress
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Complexe Commercial</div>
                    <div className="text-sm text-gray-600">Plumbing work</div>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Scheduled
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Search */}
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

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {console.log('Rendering teams grid with', filteredTeams.length, 'teams')}
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team, index) => {
            console.log('Rendering team card for', team.id, team.name, 'with color', team.color);
            return <TeamCard key={team.id || index} team={team} />;
          })
        ) : (
          <div className="col-span-3 text-center py-12">
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
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading teams...</h3>
        </div>
      ) : error ? (
        <div className="text-center py-12">
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
      ) : filteredTeams.length === 0 && (
        <div className="text-center py-12">
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
      )}

      {/* Modals */}
      <TeamModal />
      <TeamDetailsModal />
    </div>
  );
};

export default Teams;