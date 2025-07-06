import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Search, Building2, Home, ListTree, ChevronRight,
  Edit, Trash2, X, Save, Filter, Calendar, MapPin, Users,
  CheckCircle, AlertTriangle, Clock, Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Project, Unit, Category, Team, CategoryTeam } from '../types';
import { ProjectService, ProjectCreateRequest, ProjectUpdateRequest, ProjectFilters } from '../lib/projectService';
import { UnitService, UnitCreateRequest, UnitUpdateRequest, BackendUnitType } from '../lib/unitService';
import { CategoryService, CategoryCreateRequest, CategoryUpdateRequest } from '../lib/categoryService';
import { CategoryTeamService, CategoryTeamUpdateRequest, BackendTaskStatus } from '../lib/categoryTeamService';
import { TeamService } from '../lib/teamService';
import { TemplateService } from '../lib/templateService';
import ProjectCard from '../components/Dashboard/ProjectCard'; // Reusing ProjectCard from Dashboard
import UnitCard from '../components/UnitManagement/UnitCard';
import CategoryCard from '../components/CategoryManagement/CategoryCard';
import UnitModal from '../components/UnitManagement/UnitModal';
import CategoryModal from '../components/CategoryManagement/CategoryModal';
import { useNavigate, useLocation } from 'react-router-dom';

// Define a simple ProjectModal for creation/editing
interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => Promise<void>;
  project?: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, project }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      // Format dates properly for the date input fields (YYYY-MM-DD)
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return '';
          return date.toISOString().split('T')[0];
        } catch (e) {
          return '';
        }
      };

      setFormData({
        name: project.name,
        location: project.location,
        start_date: project.start_date && !isNaN(new Date(project.start_date).getTime()) ? new Date(project.start_date).toISOString().split('T')[0] : '',
        end_date: project.end_date && !isNaN(new Date(project.end_date).getTime()) ? new Date(project.end_date).toISOString().split('T')[0] : '',
        description: project.description || ''
      });
    } else {
      setFormData({
        name: '',
        location: '',
        start_date: '',
        end_date: '',
        description: ''
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: project?.id,
        name: formData.name,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        description: formData.description
      });
      onClose();
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{project ? 'Edit Project' : 'Create New Project'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="e.g., Résidence Azure" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.location ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="e.g., Casablanca" />
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input type="date" required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.start_date ? 'border-red-300' : 'border-gray-300'}`} />
              {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input type="date" required value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.end_date ? 'border-red-300' : 'border-gray-300'}`} />
              {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Project description..." />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Projects: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [teams, setTeams] = useState<Team[]>([]); // All teams for template/assignment
  const [templates, setTemplates] = useState<any[]>([]); // Unit templates

  // Selection states for tree view
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Modals states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState<'card' | 'tree'>('card'); // 'card' or 'tree'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Project['status'] | 'all'>('all');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<{ [categoryId: string]: boolean }>({});

  // Refs for scrolling to elements
  const projectRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const unitRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // --- Data Loading ---
  const loadProjects = useCallback(async () => {
    if (!user?.company_id) return;
    setLoading(true);
    try {
      const filters: ProjectFilters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterStatus !== 'all') filters.status = filterStatus;

      const response = await ProjectService.getProjects(user.company_id, 0, 100, 'name', 'asc', filters);
      // Normalize project data to use snake_case for ProjectCard
      const normalizedProjects = response.content.map((p) => ({
        ...p,
        start_date: p.start_date || p.start_date || '',
        end_date: p.end_date || p.end_date || '',
        active_team_count: typeof p.active_team_count === 'number' ? p.active_team_count : (p.active_team_count || 0)
      }));
      setProjects(normalizedProjects);
      setError('');
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [user?.company_id, searchTerm, filterStatus]);

  const loadUnits = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const response = await UnitService.getUnits(projectId, 0, 100);
      setUnits(response.content);
      setError('');
    } catch (err) {
      console.error(`Failed to load units for project ${projectId}:`, err);
      setError(`Failed to load units for project ${projectId}.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async (unitId: string) => {
    setLoading(true);
    try {
      console.log(`loadCategories: Fetching categories for unitId: ${unitId}`);
      const response = await CategoryService.getCategories(unitId);
      console.log('loadCategories: Received response:', response);
      setCategories([...response]);
      setError('');
    } catch (err) {
      console.error(`loadCategories: Failed to load categories for unit ${unitId}:`, err);
      setError(`Failed to load categories for unit ${unitId}.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTeams = useCallback(async () => {
    if (!user?.company_id) return;
    try {
      const response = await TeamService.getAllActiveTeams(user.company_id);
      setTeams(response);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  }, [user?.company_id]);

  const loadTemplates = useCallback(async () => {
    if (!user?.company_id) return;
    try {
      const response = await TemplateService.getTemplates(user.company_id, 0, 100);
      setTemplates(response.content);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }, [user?.company_id]);

  useEffect(() => {
    loadProjects();
    loadTeams();
    loadTemplates();
  }, [loadProjects, loadTeams, loadTemplates]);

  // Handle deep linking from other pages (e.g., Schedule)
  useEffect(() => {
    if (location.state) {
      const { selectedProjectId, selectedUnitId, selectedCategoryId } = location.state;
      if (selectedProjectId) {
        setSelectedProjectId(selectedProjectId);
        setActiveView('tree'); // Switch to tree view
        if (selectedUnitId) {
          setSelectedUnitId(selectedUnitId);
          if (selectedCategoryId) {
            setSelectedCategoryId(selectedCategoryId);
          }
        }
        // Clear state after processing
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, navigate]);

  // Load units when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      loadUnits(selectedProjectId);
      setUnits([]); // Clear previous units
      setCategories([]); // Clear previous categories
      setSelectedUnitId(null);
      setSelectedCategoryId(null);
    }
  }, [selectedProjectId, loadUnits]);

  // Load categories when a unit is selected
  useEffect(() => {
    if (selectedUnitId) {
      loadCategories(selectedUnitId);
      setCategories([]); // Clear previous categories
      setSelectedCategoryId(null);
    }
  }, [selectedUnitId, loadCategories]);

  // Scroll to selected item when deep linking
  useEffect(() => {
    if (selectedProjectId && projectRefs.current[selectedProjectId]) {
      projectRefs.current[selectedProjectId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (selectedUnitId && unitRefs.current[selectedUnitId]) {
      unitRefs.current[selectedUnitId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (selectedCategoryId && categoryRefs.current[selectedCategoryId]) {
      categoryRefs.current[selectedCategoryId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedProjectId, selectedUnitId, selectedCategoryId, projects, units, categories]);


  // --- Project CRUD Operations ---
  const handleCreateProject = async (projectData: Partial<Project>) => {
    if (!user?.company_id) return;
    const newProject: ProjectCreateRequest = {
      name: projectData.name!,
      location: projectData.location!,
      startDate: projectData.start_date!,
      endDate: projectData.end_date!,
      description: projectData.description || '',
      status: 'PLANNING' // Default status
    };
    await ProjectService.createProject(user.company_id, newProject);
    await loadProjects();
  };

  const handleUpdateProject = async (projectData: Partial<Project>) => {
    if (!user?.company_id || !projectData.id) return;
    
    // Find the existing project to preserve any fields not being updated
    const existingProject = projects.find(p => p.id === projectData.id);
    
    const updatedProject: ProjectUpdateRequest = {
      name: projectData.name!,
      location: projectData.location!,
      startDate: projectData.start_date!,
      endDate: projectData.end_date!,
      description: projectData.description || '',
      status: projectData.status // Keep existing status
    };
    
    await ProjectService.updateProject(projectData.id, user.company_id, updatedProject);
    await loadProjects();
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user?.company_id || !confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    await ProjectService.deleteProject(projectId, user.company_id);
    await loadProjects();
    setSelectedProjectId(null);
    setSelectedUnitId(null);
    setSelectedCategoryId(null);
    setUnits([]);
    setCategories([]);
  };

  // --- Unit CRUD Operations ---
  const handleCreateUnit = async (unitData: Partial<Unit>, useTemplate?: boolean, templateData?: any) => {
    if (!user?.company_id || !selectedProjectId) return;

    const newUnit: UnitCreateRequest = {
      name: unitData.name!,
      type: unitData.type as BackendUnitType,
      floor: unitData.floor || null,
      area: unitData.area || null,
      description: unitData.description || null
    };

    const createdUnit = await UnitService.createUnit(selectedProjectId, user.company_id, newUnit);

    if (useTemplate && templateData?.template) {
      // Apply template categories and teams
      for (const tCategory of templateData.template.categories) {
        const newCategory: CategoryCreateRequest = {
          name: tCategory.name,
          description: tCategory.description || '',
          startDate: new Date().toISOString().split('T')[0], // Use current date for template application
          endDate: new Date(new Date().setDate(new Date().getDate() + tCategory.duration_days)).toISOString().split('T')[0],
          orderSequence: tCategory.order
        };
        const createdCategory = await CategoryService.createCategory(createdUnit.id, selectedProjectId, newCategory);

        if (createdCategory && tCategory.teams) {
          for (const tTeam of tCategory.teams) {
            const team = teams.find(tm => tm.id === tTeam.team_id);
            if (team) {
              await CategoryTeamService.createCategoryTeam(createdCategory.id, {
                teamId: team.id,
                status: 'NOT_STARTED',
                notes: tTeam.notes || '',
                receptionStatus: false,
                paymentStatus: false,
              });
            }
          }
        }
      }
    }
    await loadUnits(selectedProjectId);
  };

  const handleUpdateUnit = async (unitData: Partial<Unit>) => {
    if (!selectedProjectId || !unitData.id) return;
    const updatedUnit: UnitUpdateRequest = {
      name: unitData.name!,
      type: unitData.type!.toUpperCase() as UnitUpdateRequest['type'],
      floor: unitData.floor || null,
      area: unitData.area || null,
      description: unitData.description || null,
      progressPercentage: unitData.progress || 0
    };
    await UnitService.updateUnit(unitData.id, selectedProjectId, updatedUnit);
    await loadUnits(selectedProjectId);
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!selectedProjectId || !confirm('Are you sure you want to delete this unit? This action cannot be undone.')) return;
    await UnitService.deleteUnit(unitId, selectedProjectId);
    await loadUnits(selectedProjectId);
    setSelectedUnitId(null);
    setSelectedCategoryId(null);
    setCategories([]);
  };

  // --- Category CRUD Operations ---
  const handleCreateCategory = async (categoryData: Partial<Category>, assignedTeams: Partial<CategoryTeam>[]) => {
    if (!selectedUnitId || !selectedProjectId) return;
    const newCategory: CategoryCreateRequest = {
      name: categoryData.name!,
      description: categoryData.description || '',
      startDate: categoryData.start_date!,
      endDate: categoryData.end_date!,
      orderSequence: categoryData.order || 1
    };
    const createdCategory = await CategoryService.createCategory(selectedUnitId, selectedProjectId, newCategory);

    if (createdCategory && assignedTeams.length > 0) {
      for (const teamAssignment of assignedTeams) {
        if (teamAssignment.team_id) {
          await CategoryTeamService.createCategoryTeam(createdCategory.id, {
            teamId: teamAssignment.team_id,
            status: teamAssignment.status || 'NOT_STARTED',
            receptionStatus: teamAssignment.reception_status || false,
            paymentStatus: teamAssignment.payment_status || false,
            notes: teamAssignment.notes || '',
          });
        }
      }
    }
    await loadCategories(selectedUnitId);
  };

  const handleUpdateCategory = async (categoryData: Partial<Category>, assignedTeams: Partial<CategoryTeam>[]) => {
    if (!selectedUnitId || !categoryData.id) return;
    const updatedCategory: CategoryUpdateRequest = {
      name: categoryData.name!,
      description: categoryData.description || '',
      startDate: categoryData.start_date!,
      endDate: categoryData.end_date!,
      orderSequence: categoryData.order || 1,
      progressPercentage: categoryData.progress || 0
    };
    await CategoryService.updateCategory(categoryData.id, selectedUnitId, updatedCategory);

    // Update/create/delete CategoryTeam assignments
    const existingCategoryTeams = categories.find(c => c.id === categoryData.id)?.categoryTeams || [];
    const newTeamIds = new Set(assignedTeams.map(at => at.team_id));
    const existingTeamIds = new Set(existingCategoryTeams.map(ect => ect.team_id));

    // Teams to remove
    for (const existingTeam of existingCategoryTeams) {
      if (!newTeamIds.has(existingTeam.team_id)) {
        await CategoryTeamService.deleteCategoryTeam(existingTeam.id);
      }
    }

    // Teams to add or update
    for (const newTeamAssignment of assignedTeams) {
      const existingAssignment = existingCategoryTeams.find(ect => ect.team_id === newTeamAssignment.team_id);
      if (existingAssignment) {
        // Update existing
        await CategoryTeamService.updateCategoryTeam(existingAssignment.id, {
          status: newTeamAssignment.status || 'NOT_STARTED',
          receptionStatus: newTeamAssignment.reception_status || false,
          paymentStatus: newTeamAssignment.payment_status || false,
          notes: newTeamAssignment.notes || '',
        });
      } else if (newTeamAssignment.team_id) {
        // Add new
        await CategoryTeamService.createCategoryTeam(categoryData.id, {
          teamId: newTeamAssignment.team_id,
          status: newTeamAssignment.status || 'NOT_STARTED',
          receptionStatus: newTeamAssignment.reception_status || false,
          paymentStatus: newTeamAssignment.payment_status || false,
          notes: newTeamAssignment.notes || '',
        });
      }
    }
    await loadCategories(selectedUnitId);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!selectedUnitId || !confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;
    await CategoryService.deleteCategory(categoryId, selectedUnitId);
    await loadCategories(selectedUnitId);
    setSelectedCategoryId(null);
  };

  const handleUpdateCategoryTeamStatus = async (categoryTeamId: string, newStatus: BackendTaskStatus, progressPercentage?: number) => {
    console.log('handleUpdateCategoryTeamStatus called with:', { categoryTeamId, newStatus, progressPercentage });
    try {
      const updateData: CategoryTeamUpdateRequest = { status: newStatus };
      if (typeof progressPercentage === 'number') {
        updateData.progressPercentage = Math.max(0, Math.min(100, progressPercentage));
      }
      console.log('Before CategoryTeamService.updateCategoryTeam:', { categoryTeamId, updateData });
      await CategoryTeamService.updateCategoryTeam(categoryTeamId, updateData);
      console.log('After CategoryTeamService.updateCategoryTeam. Reloading categories...');
      if (selectedUnitId) {
        await loadCategories(selectedUnitId); // Reload categories to reflect change
      }
      console.log('Categories reloaded after status update.');
      console.log('handleUpdateCategoryTeamStatus: Successfully updated category team status and reloaded categories.');
    } catch (error) {
      console.error(`Error updating category team ${categoryTeamId} status:`, error);
      alert('Failed to update team status. Please try again.');
    }
  };



  // --- Modal Handlers ---
  const openProjectModal = (project: Project | null = null) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const openUnitModal = (unit: Unit | null = null) => {
    if (!selectedProjectId) {
      alert('Please select a project first.');
      return;
    }
    setEditingUnit(unit);
    setShowUnitModal(true);
  };

  const openCategoryModal = (category: Category | null = null) => {
    if (!selectedUnitId) {
      alert('Please select a unit first.');
      return;
    }
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  // --- Render Helpers ---
  const renderProjectList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.length > 0 ? (
        projects.map((project) => (
          <div key={project.id} ref={el => projectRefs.current[project.id] = el}>
            <ProjectCard
              project={project}
              onClick={() => {
                if (activeView === 'tree') {
                  setSelectedProjectId(project.id);
                } else {
                  // In card view, clicking a project card should load its units
                  setSelectedProjectId(project.id);
                  loadUnits(project.id);
                  // Switch to tree view to show the project hierarchy
                  setActiveView('tree');
                }
              }}
              onEdit={openProjectModal}
              onDelete={handleDeleteProject}
            />
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first project</p>
          <button onClick={() => openProjectModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Create Project
          </button>
        </div>
      )}
    </div>
  );

  const renderTreeView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Projects Column */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building2 className="h-5 w-5 mr-2" /> Projects
          <button onClick={() => openProjectModal()} className="ml-auto p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-blue-200" title="Add Project"><Plus className="h-4 w-4" /></button>
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.id} ref={el => projectRefs.current[project.id] = el}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedProjectId === project.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedProjectId(project.id)}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{project.name}</span>
                  <div className="flex items-center space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); openProjectModal(project); }} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-blue-200" title="Edit Project"><Edit className="h-4 w-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-red-200" title="Delete Project"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{project.location}</div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No projects available.</p>
          )}
        </div>
      </div>

      {/* Units Column */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Home className="h-5 w-5 mr-2" /> Units
          <button onClick={() => openUnitModal()} className="ml-auto p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-blue-200" title="Add Unit" disabled={!selectedProjectId}><Plus className="h-4 w-4" /></button>
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {selectedProjectId ? (
            units.length > 0 ? (
              units.map((unit) => (
                <div key={unit.id} ref={el => unitRefs.current[unit.id] = el}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedUnitId === unit.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'}`}
                  onClick={() => setSelectedUnitId(unit.id)}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{unit.name}</span>
                    <div className="flex items-center space-x-2">
                      <button onClick={(e) => { e.stopPropagation(); openUnitModal(unit); }} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-blue-200" title="Edit Unit"><Edit className="h-4 w-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.id); }} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-red-200" title="Delete Unit"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{unit.type} {unit.floor ? `(${unit.floor})` : ''}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No units for this project.</p>
            )
          ) : (
            <p className="text-gray-500 text-sm">Select a project to view units.</p>
          )}
        </div>
      </div>

      {/* Categories Column */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ListTree className="h-5 w-5 mr-2" /> Categories
          <button onClick={() => openCategoryModal()} className="ml-auto p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-blue-200" title="Add Category" disabled={!selectedUnitId}><Plus className="h-4 w-4" /></button>
        </h3>
        {selectedUnitId && categories.length > 0 && (
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={categorySearchTerm}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              onChange={(e) => setCategorySearchTerm(e.target.value)}
            />
          </div>
        )}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {selectedUnitId ? (
            categories.length > 0 ? (
              categories
                .filter(category => {
                  // Filter by search term only
                  return categorySearchTerm === '' || 
                    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase());
                })
                .map((category) => (
                  <div key={category.id} ref={el => categoryRefs.current[category.id] = el}
                    className={`${selectedCategoryId === category.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedCategoryId(category.id)}>
                    <CategoryCard
                      category={category}
                      categoryTeams={category.categoryTeams || []}
                      onEdit={() => openCategoryModal(category)}
                      onDelete={() => handleDeleteCategory(category.id)}
                      onSelect={() => setSelectedCategoryId(category.id)}
                      onUpdateCategoryTeamStatus={handleUpdateCategoryTeamStatus}
                      isExpanded={!!expandedCategories[category.id]}
                      onToggleExpand={() => setExpandedCategories(prev => ({ ...prev, [category.id]: !prev[category.id] }))}
                    />
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-sm">No categories for this unit.</p>
            )
          ) : (
            <p className="text-gray-500 text-sm">Select a unit to view categories.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderCardView = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">All Projects</h2>
      {renderProjectList()}

      {/* Units Section (if a project is selected in card view, could show its units here) */}
      {/* For simplicity, in card view, we'll just show all projects.
          Detailed unit/category views would be accessed by clicking into a project card.
          This is a design choice to keep card view flat. */}
    </div>
  );

  // Helper for CategoryTeam status display
  const getStatusColorForCategoryTeam = (status: BackendTaskStatus) => {
    const colors = {
      'NOT_STARTED': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'DONE': 'bg-green-100 text-green-800',
      'DELAYED': 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.NOT_STARTED;
  };

  const getStatusIconForCategoryTeam = (status: BackendTaskStatus) => {
    switch (status) {
      case 'DONE': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'IN_PROGRESS': return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'DELAYED': return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'NOT_STARTED': return <X className="h-3 w-3 text-gray-400" />;
      default: return <X className="h-3 w-3 text-gray-400" />;
    }
  };

  const getNextStatusForCategoryTeam = (currentStatus: BackendTaskStatus): BackendTaskStatus => {
    switch (currentStatus) {
      case 'NOT_STARTED': return 'IN_PROGRESS';
      case 'IN_PROGRESS': return 'DONE';
      case 'DONE': return 'NOT_STARTED';
      case 'DELAYED': return 'IN_PROGRESS';
      default: return 'NOT_STARTED';
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your construction projects, units, and categories
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => openProjectModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </button>
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
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as Project['status'] | 'all')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <ListTree className="h-5 w-5 text-gray-400" />
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveView('card')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${activeView === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Card View
              </button>
              <button
                onClick={() => setActiveView('tree')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${activeView === 'tree' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Tree View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      )}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Content based on active view */}
      {!loading && !error && (
        activeView === 'card' ? renderCardView() : renderTreeView()
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSave={editingProject ? handleUpdateProject : handleCreateProject}
        project={editingProject}
      />
      <UnitModal
        isOpen={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        onSave={editingUnit ? handleUpdateUnit : handleCreateUnit}
        projectId={selectedProjectId || ''}
        projectName={projects.find(p => p.id === selectedProjectId)?.name || ''}
        unit={editingUnit}
        availableUnits={units}
        availableTemplates={templates}
      />
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
        unitId={selectedUnitId || ''}
        unitName={units.find(u => u.id === selectedUnitId)?.name || ''}
        category={editingCategory}
        existingTeams={editingCategory?.categoryTeams || []}
        availableTeams={teams}
      />
    </div>
  );
};

export default Projects;