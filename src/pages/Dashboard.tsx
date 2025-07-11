import React, { useState, useEffect } from 'react';
import { Building2, Users, Home, Plus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/Dashboard/StatsCard';
import { useAuth } from '../contexts/AuthContext';
import { Project, Unit } from '../types';
import UnitModal from '../components/UnitManagement/UnitModal';
import { ProjectService } from '../lib/projectService';
import { BackendUnitType, UnitService } from '../lib/unitService';
import { DashboardService, DashboardStats } from '../lib/dashboardService';
import ProjectCard from '../components/Dashboard/ProjectCard';
import { formatDateForInput } from '../utils/dateFormatter';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal states for Quick Actions
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateUnitModal, setShowCreateUnitModal] = useState(false);

  const loadDashboardData = async () => {
    if (!user?.company_id) return;

    setLoading(true);
    setError('');
    
    try {
      // Load dashboard stats
      const stats = await DashboardService.getDashboardStats(user.company_id);
      setDashboardStats(stats);
      
      // Load projects
      const projectsResponse = await ProjectService.getProjects(user.company_id, 0, 4);
      // Map start_date/end_date for compatibility
      const mappedProjects = projectsResponse.content.map((p) => ({
        ...p,
        start_date: p.startDate || p.start_date,
        end_date: p.endDate || p.end_date,
        startDate: p.startDate || p.start_date,
        endDate: p.endDate || p.end_date,
      }));
      setProjects(mappedProjects);
      
      // Get units from the first project if available
      if (projectsResponse.content.length > 0) {
        const firstProjectId = projectsResponse.content[0].id;
        const unitsResponse = await UnitService.getUnits(firstProjectId, 0, 4);
        setUnits(unitsResponse.content);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadDashboardData();
  }, [user?.company_id]);

  useEffect(() => {
    if (projects.length > 0) {
      console.log('Dashboard projects:', projects);
    }
  }, [projects]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleProjectClick = (projectId: string) => {
    navigate('/projects', { state: { selectedProjectId: projectId } });
  };

  const handleCreateProject = () => {
    setShowCreateProjectModal(true);
  };

  const handleCreateUnit = () => {
    // Only show the create unit modal if we have at least one project
    if (projects.length === 0) {
      alert('Please create a project first before adding units.');
      return;
    }
    setShowCreateUnitModal(true);
  };

  const handleSaveUnit = async (unitData: Partial<Unit>, useTemplate?: boolean, templateData?: any) => {
    try {
      if (!user?.company_id) {
        alert('User authentication required. Please log in again.');
        return;
      }

      // Ensure we have a valid projectId
      const projectId = unitData.project_id || projects[0]?.id;
      if (!projectId) {
        alert('No project selected. Please select a project first.');
        return;
      }

      // Ensure all required fields are present and valid
      if (!unitData.name || !unitData.type) {
        alert('Unit name and type are required.');
        return;
      }

      // Create a clean unit object without undefined values
      const cleanUnitData = {
        name: unitData.name,
        type: unitData.type as BackendUnitType,
        floor: unitData.type === 'apartment' ? unitData.floor || '' : undefined,
        area: unitData.area ? Number(unitData.area) : undefined,
        description: unitData.description || ''
      };

      console.log('Creating unit with data:', { projectId, companyId: user.company_id, unitData: cleanUnitData });
      
      await UnitService.createUnit(projectId, user.company_id, cleanUnitData);

      alert(`Unit "${unitData.name}" created successfully!`);
      setShowCreateUnitModal(false);
      navigate('/projects', { state: { selectedProjectId: projectId } });
    } catch (error) {
      console.error('Error creating unit:', error);
      if (error instanceof Error) {
        alert(`Failed to create unit: ${error.message}`);
      } else {
        alert('Failed to create unit. Please try again.');
      }
    }
  };

  const handleCloneUnit = async (newUnitData: Partial<Unit>) => {
    try {
      if (!user?.company_id) {
        alert('User authentication required. Please log in again.');
        return;
      }

      // Ensure we have a valid projectId
      const projectId = newUnitData.project_id || projects[0]?.id;
      if (!projectId) {
        alert('No project selected. Please select a project first.');
        return;
      }

      // Ensure all required fields are present
      if (!newUnitData.name || !newUnitData.type) {
        alert('Unit name and type are required.');
        return;
      }

      // Create a clean unit object without undefined values
      const cleanUnitData = {
        name: newUnitData.name,
        type: newUnitData.type as BackendUnitType,
        floor: newUnitData.type === 'apartment' ? newUnitData.floor || '' : undefined,
        area: newUnitData.area ? Number(newUnitData.area) : undefined,
        description: newUnitData.description || ''
      };

      console.log('Cloning unit with data:', { projectId, companyId: user.company_id, unitData: cleanUnitData });
      
      await UnitService.createUnit(projectId, user.company_id, cleanUnitData);

      alert(`Unit "${newUnitData.name}" cloned successfully!`);
      setShowCreateUnitModal(false);
      navigate('/projects', { state: { selectedProjectId: projectId } });
    } catch (error) {
      console.error('Error cloning unit:', error);
      if (error instanceof Error) {
        alert(`Failed to clone unit: ${error.message}`);
      } else {
        alert('Failed to clone unit. Please try again.');
      }
    }
  };

  // Create Project Modal Component
  const CreateProjectModal: React.FC = () => {
    const [formData, setFormData] = useState({
      name: '',
      location: '',
      start_date: '',
      end_date: '',
      description: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.name.trim()) {
        newErrors.name = 'Project name is required';
      }
      
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
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

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm() || !user?.company_id) {
        return;
      }

      try {
        setIsSubmitting(true);
        
        await ProjectService.createProject(user.company_id, {
          name: formData.name,
          location: formData.location,
          startDate: formData.start_date,
          endDate: formData.end_date,
          description: formData.description
        });

        alert(`Project "${formData.name}" created successfully!`);
        setShowCreateProjectModal(false);
        setFormData({ name: '', location: '', start_date: '', end_date: '', description: '' });
        setErrors({});
        
        // Refresh dashboard data
        loadDashboardData();
      } catch (error) {
        console.error('Error creating project:', error);
        alert('Failed to create project. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleClose = () => {
      setShowCreateProjectModal(false);
      setFormData({ name: '', location: '', start_date: '', end_date: '', description: '' });
      setErrors({});
    };

    if (!showCreateProjectModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Résidence Azure"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Casablanca"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date ? formatDateForInput(formData.start_date) : ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.start_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.end_date ? formatDateForInput(formData.end_date) : ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.end_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-blue-100">
          Here's an overview of your construction projects and team performance.
        </p>
        <div className="mt-4 text-sm">
          <span className="font-semibold">Company:</span> {user?.company?.name || 'Your Company'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Projects"
          value={dashboardStats?.activeProjects || 0}
          icon={Building2}
          change="+2 this month"
          changeType="increase"
          color="blue"
        />
        <StatsCard
          title="Total Units"
          value={dashboardStats?.totalUnits || 0}
          icon={Home}
          change="+5 new units"
          changeType="increase"
          color="green"
        />
        <StatsCard
          title="Active Teams"
          value={dashboardStats?.activeTeams || 0}
          icon={Users}
          change="+3 new teams"
          changeType="increase"
          color="orange"
        />
        <StatsCard
          title="Delayed Tasks"
          value={dashboardStats?.delayedTasks || 0}
          icon={AlertTriangle}
          change="-1 from last week"
          changeType="decrease"
          color="red"
        />
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
          <button 
            onClick={() => navigate('/projects')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All Projects →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg">
              <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first project</p>
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleCreateProject}
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
          >
            <Building2 className="h-6 w-6 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
            <span className="text-gray-700 font-medium group-hover:text-blue-700">Create New Project</span>
          </button>
          <button 
            onClick={handleCreateUnit}
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group"
          >
            <Home className="h-6 w-6 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
            <span className="text-gray-700 font-medium group-hover:text-green-700">Add New Unit</span>
          </button>
          <button 
            onClick={() => navigate('/teams')}
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors group"
          >
            <Users className="h-6 w-6 text-orange-600 mr-3 group-hover:scale-110 transition-transform" />
            <span className="text-gray-700 font-medium group-hover:text-orange-700">Manage Teams</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal />
      
      {/* Unit Modal */}
      <UnitModal
        isOpen={showCreateUnitModal}
        onClose={() => setShowCreateUnitModal(false)}
        onSave={handleSaveUnit}
        onCloneUnit={handleCloneUnit}
        projectId={projects[0]?.id || ""}
        projectName={projects[0]?.name || ""}
        availableUnits={units}
      />
    </div>
  );
};

export default Dashboard;