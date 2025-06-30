import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Filter, Calendar, MapPin, Home, Edit, Trash2, X, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Project, Unit, Category, CategoryTeam, Team } from '../types';
import { ProjectService } from '../lib/projectService';
import { UnitService } from '../lib/unitService';
import { CategoryService } from '../lib/categoryService';
import { CategoryTeamService } from '../lib/categoryTeamService';
import { TeamService } from '../lib/teamService';

import UnitModal from '../components/UnitManagement/UnitModal';
import CategoryModal from '../components/CategoryManagement/CategoryModal';
import CategoryCard from '../components/CategoryManagement/CategoryCard';
import UnitCard from '../components/UnitManagement/UnitCard';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const projectListRef = useRef<HTMLDivElement>(null);
  const unitListRef = useRef<HTMLDivElement>(null);
  const categoryListRef = useRef<HTMLDivElement>(null);

  // State for projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<'all' | 'active' | 'planning' | 'completed' | 'on_hold'>('all');

  // State for units
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitSearchTerm, setUnitSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<'all' | 'villa' | 'apartment' | 'commercial'>('all');

  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryTeams, setCategoryTeams] = useState<CategoryTeam[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // This effect runs once on mount to handle initial project/unit/category selection
  // passed through navigation state.
  useEffect(() => {
    const state = location.state as { selectedProjectId?: string, selectedUnitId?: string, selectedCategoryId?: string } | null;

    if (state) {
      // Clear the location state to avoid re-triggering this logic on refresh.
      // The `navigate` call is intentionally done here.
      navigate(location.pathname, { replace: true });
    }

    // Load all projects, and select the one specified in the state if it exists.
    loadProjects(state?.selectedProjectId, state?.selectedUnitId, state?.selectedCategoryId);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // IMPORTANT: This effect should only run ONCE on component mount.
  
  // Function to toggle mock data mode


  const loadProjects = async (projectIdToSelect?: string, unitIdToSelect?: string, categoryIdToSelect?: string) => {
    if (!user?.company_id) {
      console.error('Cannot load projects: No company ID available');
      setError('User company information not available. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Loading projects for company:', user.company_id);

      // Load projects
      console.log(`Attempting to load projects for company ID: ${user.company_id}`);
      const projectsResponse = await ProjectService.getProjects(user.company_id, 0, 100);
      console.log('Projects loaded successfully:', projectsResponse);
      
      if (!projectsResponse.content) {
        console.error('Invalid project response format:', projectsResponse);
        setError('Invalid response format from server');
        return;
      }
      
      setProjects(projectsResponse.content);
      console.log(`Loaded ${projectsResponse.content.length} projects`);

      // If we have a project to select, do it now
      if (projectIdToSelect && projectsResponse.content.length > 0) {
        const projectToSelect = projectsResponse.content.find(p => p.id === projectIdToSelect);
        if (projectToSelect) {
          console.log('Selecting project:', projectToSelect);
          setSelectedProject(projectToSelect);
          
          // Load units for this project
          await loadUnits(projectToSelect.id, unitIdToSelect, categoryIdToSelect);
        } else {
          console.warn('Project to select not found in results:', projectIdToSelect);
        }
      }
    } catch (error: any) {
      console.error('Error loading projects:', error);
      let errorMessage = 'Failed to load projects';
      
      if (error.message) {
        // Check for specific connection errors
        if (error.message.includes('Cannot connect to the server') || 
            error.message.includes('Failed to fetch') ||
            error.message.includes('Connection refused')) {
          errorMessage = 'Cannot connect to the backend server. Please ensure the server is running and try again.';
        } else if (error.message.includes('HTTP error! status: 500') || 
                   error.message.includes('database connection issue')) {
          errorMessage = 'The server encountered an error while processing your request. This might be due to a connection issue with the backend database. Please check if the database server is properly configured and running.';
        } else {
          errorMessage += `: ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async (projectId: string, unitIdToSelect?: string, categoryIdToSelect?: string) => {
    try {
      // Load units for the selected project
      const unitsResponse = await UnitService.getUnits(projectId, 0, 100);
      setUnits(unitsResponse.content);

      // If we have a unit to select, do it now
      if (unitIdToSelect && unitsResponse.content.length > 0) {
        const unitToSelect = unitsResponse.content.find(u => u.id === unitIdToSelect);
        if (unitToSelect) {
          setSelectedUnit(unitToSelect);
          
          // Load categories for this unit
          await loadCategories(unitToSelect.id, categoryIdToSelect);
        } else {
          // If no specific unit to select, clear the selection
          setSelectedUnit(null);
          setCategories([]);
          setCategoryTeams([]);
        }
      } else {
        // If no specific unit to select, clear the selection
        setSelectedUnit(null);
        setCategories([]);
        setCategoryTeams([]);
      }
    } catch (error) {
      console.error('Error loading units:', error);
      setError('Failed to load units');
    }
  };

  const loadCategories = async (unitId: string, categoryIdToSelect?: string) => {
    try {
      // Load categories for the selected unit
      const categoriesData = await CategoryService.getCategories(unitId);
      setCategories(categoriesData);

      // If we have a category to select, do it now
      if (categoryIdToSelect && categoriesData.length > 0) {
        const categoryToSelect = categoriesData.find(c => c.id === categoryIdToSelect);
        if (categoryToSelect) {
          setSelectedCategory(categoryToSelect);
          
          // Load teams for this category
          await loadCategoryTeams(categoryToSelect.id);
        } else {
          // If no specific category to select, clear the selection
          setSelectedCategory(null);
          setCategoryTeams([]);
        }
      } else {
        // If no specific category to select, clear the selection
        setSelectedCategory(null);
        setCategoryTeams([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
    }
  };

  const loadCategoryTeams = async (categoryId: string) => {
    try {
      // Load category teams for the selected category
      const teamsData = await CategoryTeamService.getCategoryTeamsByCategory(categoryId);
      setCategoryTeams(teamsData);
    } catch (error) {
      console.error('Error loading category teams:', error);
      setError('Failed to load category teams');
    }
  };

  const loadAvailableTeams = async () => {
    if (!user?.company_id) return;

    try {
      const teamsResponse = await TeamService.getAllActiveTeams(user.company_id);
      setAvailableTeams(teamsResponse);
    } catch (error) {
      console.error('Error loading teams:', error);
      setError('Failed to load teams');
    }
  };

  // Handle project selection
  const handleSelectProject = async (project: Project) => {
    setSelectedProject(project);
    setSelectedUnit(null);
    setSelectedCategory(null);
    setCategories([]);
    setCategoryTeams([]);
    await loadUnits(project.id);
    
    // Scroll to project list
    if (projectListRef.current) {
      projectListRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle unit selection
  const handleSelectUnit = async (unit: Unit) => {
    setSelectedUnit(unit);
    setSelectedCategory(null);
    setCategoryTeams([]);
    await loadCategories(unit.id);
    
    // Scroll to unit list
    if (unitListRef.current) {
      unitListRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle category selection
  const handleSelectCategory = async (category: Category) => {
    setSelectedCategory(category);
    await loadCategoryTeams(category.id);
    
    // Scroll to category list
    if (categoryListRef.current) {
      categoryListRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Project CRUD operations
  const handleCreateProject = () => {
    console.log('handleCreateProject called');
    console.log('Current modal state before:', showProjectModal);
    setEditingProject(null);
    setShowProjectModal(true);
    console.log('Modal state should now be set to true');
    
    // Verify after a short delay that the state was actually updated
    setTimeout(() => {
      console.log('Modal state after timeout:', showProjectModal);
    }, 100);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.') || !user?.company_id) {
      return;
    }

    try {
      await ProjectService.deleteProject(projectId, user.company_id);
      
      // If the deleted project was selected, clear the selection
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setSelectedUnit(null);
        setSelectedCategory(null);
        setUnits([]);
        setCategories([]);
        setCategoryTeams([]);
      }
      
      // Reload projects
      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    }
  };

  // Unit CRUD operations
  const handleCreateUnit = () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }
    
    setEditingUnit(null);
    setShowUnitModal(true);
    
    // Load available teams for unit creation
    loadAvailableTeams();
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowUnitModal(true);
    
    // Load available teams for unit editing
    loadAvailableTeams();
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this unit? This action cannot be undone.') || !selectedProject) {
      return;
    }

    try {
      await UnitService.deleteUnit(unitId, selectedProject.id);
      
      // If the deleted unit was selected, clear the selection
      if (selectedUnit?.id === unitId) {
        setSelectedUnit(null);
        setSelectedCategory(null);
        setCategories([]);
        setCategoryTeams([]);
      }
      
      // Reload units
      await loadUnits(selectedProject.id);
    } catch (error) {
      console.error('Error deleting unit:', error);
      setError('Failed to delete unit');
    }
  };

  const handleSaveUnit = async (unitData: Partial<Unit>) => {
    if (!selectedProject || !user?.company_id) return;

    try {
      if (editingUnit) {
        // Update existing unit
        await UnitService.updateUnit(editingUnit.id, selectedProject.id, {
          name: unitData.name!,
          type: unitData.type!,
          floor: unitData.floor,
          area: unitData.area,
          description: unitData.description
        });
      } else {
        // Create new unit
        await UnitService.createUnit(selectedProject.id, user.company_id, {
          name: unitData.name!,
          type: unitData.type!,
          floor: unitData.floor,
          area: unitData.area,
          description: unitData.description
        });
      }
      
      // Reload units
      await loadUnits(selectedProject.id);
      setShowUnitModal(false);
    } catch (error) {
      console.error('Error saving unit:', error);
      alert('Failed to save unit. Please try again.');
    }
  };

  const handleCloneUnit = async (newUnitData: Partial<Unit>) => {
    if (!selectedProject || !user?.company_id) return;

    try {
      // The backend doesn't support full cloning yet, so this creates a new unit with the same details.
      // The sourceUnitId is not used in the current implementation.
      await UnitService.createUnit(selectedProject.id, user.company_id, {
        name: newUnitData.name!,
        type: newUnitData.type!,
        floor: newUnitData.floor,
        area: newUnitData.area,
        description: newUnitData.description
      });
      
      await loadUnits(selectedProject.id);
      setShowUnitModal(false);
    } catch (error) {
      console.error('Error cloning unit:', error);
      alert('Failed to clone unit. Please try again.');
    }
  };

  // Category CRUD operations
  const handleCreateCategory = () => {
    if (!selectedUnit) {
      alert('Please select a unit first');
      return;
    }
    
    setEditingCategory(null);
    setShowCategoryModal(true);
    
    // Load available teams for category creation
    loadAvailableTeams();
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
    
    // Load available teams for category editing
    loadAvailableTeams();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.') || !selectedUnit) {
      return;
    }

    try {
      await CategoryService.deleteCategory(categoryId, selectedUnit.id);
      
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
        setCategoryTeams([]);
      }
      
      await loadCategories(selectedUnit.id);
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    }
  };

  const handleSaveCategory = async (categoryData: Partial<Category>, teams: Partial<CategoryTeam>[]) => {
    if (!selectedUnit || !selectedProject) return;

    try {
      let savedCategory: Category;

      if (editingCategory) {
        // Update existing category
        savedCategory = await CategoryService.updateCategory(editingCategory.id, selectedUnit.id, {
          name: categoryData.name!,
          description: categoryData.description,
          startDate: categoryData.start_date!,
          endDate: categoryData.end_date!,
          orderSequence: categoryData.order,
          progressPercentage: categoryData.progress
        });
      } else {
        // Create new category
        savedCategory = await CategoryService.createCategory(selectedUnit.id, selectedProject.id, {
          name: categoryData.name!,
          description: categoryData.description,
          startDate: categoryData.start_date!,
          endDate: categoryData.end_date!,
          orderSequence: categoryData.order
        });
      }

      // Handle team assignments
      if (savedCategory.id && teams) {
        const teamAssignments = teams.map(team => {
          if (!team.team_id) return Promise.resolve();
          return CategoryTeamService.createCategoryTeam(savedCategory.id, {
            teamId: team.team_id,
          });
        });
        await Promise.all(teamAssignments);
      }

      await loadCategories(selectedUnit.id);
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Failed to save category:", error);
      alert('Failed to save category. Please try again.');
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(projectSearchTerm.toLowerCase());
    // Case-insensitive status comparison to handle both uppercase and lowercase status values
    const matchesFilter = projectFilter === 'all' || 
                         project.status.toLowerCase() === projectFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Filter units
  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.name.toLowerCase().includes(unitSearchTerm.toLowerCase());
    const matchesFilter = unitFilter === 'all' || unit.type === unitFilter;
    return matchesSearch && matchesFilter;
  });

  // Project Modal Component
  const ProjectModal: React.FC = () => {
    console.log('ProjectModal rendering, showProjectModal:', showProjectModal);
    
    const [formData, setFormData] = useState({
      name: '',
      location: '',
      start_date: '',
      end_date: '',
      description: '',
      budget: '',
      status: 'planning' as Project['status']
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      if (editingProject) {
        setFormData({
          name: editingProject.name,
          location: editingProject.location,
          start_date: editingProject.start_date,
          end_date: editingProject.end_date,
          description: editingProject.description || '',
          budget: editingProject.budget?.toString() || '',
          status: editingProject.status
        });
      } else {
        setFormData({
          name: '',
          location: '',
          start_date: '',
          end_date: '',
          description: '',
          budget: '',
          status: 'planning'
        });
      }
      setErrors({});
    }, [editingProject, showProjectModal]);

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

      if (formData.budget && (isNaN(Number(formData.budget)) || Number(formData.budget) <= 0)) {
        newErrors.budget = 'Budget must be a positive number';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      console.log('FORM SUBMIT EVENT:', e);
      e.preventDefault();
      console.log('Form submitted with data:', formData);
      
      if (!validateForm()) {
        console.log('Form validation failed');
        return;
      }
      
      const companyId = user?.company_id || '1';
      console.log('Form validated, company ID:', companyId);

      try {
        setIsSubmitting(true);
        console.log('Setting isSubmitting to true');
        
        if (editingProject) {
          // Update existing project
          const projectData = {
            name: formData.name,
            description: formData.description,
            status: formData.status,
            startDate: formData.start_date,
            endDate: formData.end_date,
            location: formData.location,
            budget: formData.budget ? Number(formData.budget) : undefined
          };
          
          await ProjectService.updateProject(editingProject.id, companyId, projectData);
        } else {
          // Create new project
          const projectData = {
            name: formData.name,
            description: formData.description,
            status: formData.status,
            startDate: formData.start_date,
            endDate: formData.end_date,
            location: formData.location,
            budget: formData.budget ? Number(formData.budget) : undefined
          };
          
          await ProjectService.createProject(companyId, projectData);
        }
        
        await loadProjects();
        setShowProjectModal(false);
      } catch (error: any) {
        console.error('Error saving project:', error);
        
        // More detailed error logging for debugging
        if (error.response) {
          console.error('Error response:', error.response);
        }
        
        // More detailed error handling
        let errorMessage = 'Failed to save project. Please try again.';
        
        if (error.message) {
          errorMessage = `Error: ${error.message}`;
          console.error('Detailed error message:', error.message);
        }
        
        // Check for specific error conditions
        if (error.message?.includes('401')) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (error.message?.includes('403')) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.message?.includes('400')) {
          errorMessage = 'Invalid project data. Please check your inputs.';
        } else if (error.message?.includes('500')) {
          errorMessage = 'Server error. Please contact support with the following details: ' + 
                         (error.message || 'Unknown error');
        }
        
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleClose = () => {
      setShowProjectModal(false);
      setFormData({
        name: '',
        location: '',
        start_date: '',
        end_date: '',
        description: '',
        budget: '',
        status: 'planning'
      });
      setErrors({});
    };

    if (!showProjectModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
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
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
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
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (MAD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.budget ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 1500000"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                )}
              </div>
              
              {editingProject && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Project description..."
                />
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
                {isSubmitting ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Project Card Component
  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const getStatusColor = (status: string) => {
      const statusLower = status.toLowerCase();
      const colors = {
        'planning': 'bg-blue-100 text-blue-800',
        'active': 'bg-green-100 text-green-800',
        'completed': 'bg-purple-100 text-purple-800',
        'on_hold': 'bg-yellow-100 text-yellow-800'
      };
      return colors[statusLower as keyof typeof colors] || colors.planning;
    };

    const getProgressColor = (progress: number) => {
      if (progress < 30) return 'bg-blue-500';
      if (progress < 70) return 'bg-yellow-500';
      return 'bg-green-500';
    };

    return (
      <div 
        className={`bg-white rounded-lg border ${
          selectedProject?.id === project.id 
            ? 'border-blue-500 shadow-md' 
            : 'border-gray-200 hover:shadow-sm'
        } p-4 cursor-pointer transition-all duration-200`}
        onClick={() => handleSelectProject(project)}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {project.location}
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status.toLowerCase().charAt(0).toUpperCase() + project.status.toLowerCase().slice(1)}
          </span>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(project.end_date).toLocaleDateString()}
          </div>
          <div>
            {project.budget ? `${(project.budget / 1000000).toFixed(1)}M MAD` : 'No budget set'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Error:</span>
            <span className="ml-1">{error}</span>
          </div>
          {error.includes('Cannot connect to the backend server') && import.meta.env.DEV && (
            <div className="mt-2 text-sm">
              <p>The backend server appears to be unavailable. You can:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>Ensure the backend server is running</li>
                <li>
                  Please try again later
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your construction projects, units, and categories
          </p>

        </div>
        <button
          onClick={(e) => {
            console.log('New Project button clicked');
            // Try to directly set the state without going through the handler
            setEditingProject(null);
            setShowProjectModal(true);
            console.log('Set showProjectModal to true directly');
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4" ref={projectListRef}>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={projectSearchTerm}
              onChange={(e) => setProjectSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">
                {projectSearchTerm || projectFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first project'}
              </p>
              {!projectSearchTerm && projectFilter === 'all' && (
                <button
                  onClick={handleCreateProject}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Project Details */}
      {selectedProject && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-900 mr-3">{selectedProject.name}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedProject.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                  selectedProject.status.toLowerCase() === 'planning' ? 'bg-blue-100 text-blue-800' :
                  selectedProject.status.toLowerCase() === 'completed' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedProject.status.toLowerCase().charAt(0).toUpperCase() + selectedProject.status.toLowerCase().slice(1)}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {selectedProject.location}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditProject(selectedProject)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Edit Project"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDeleteProject(selectedProject.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Delete Project"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">Timeline</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Start Date</div>
                  <div className="font-medium">{new Date(selectedProject.start_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">End Date</div>
                  <div className="font-medium">{new Date(selectedProject.end_date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">Progress</div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{selectedProject.progress}%</div>
                <div className="text-xs text-gray-500">
                  {selectedProject.progress < 30 ? 'Early Stage' : 
                   selectedProject.progress < 70 ? 'In Progress' : 
                   selectedProject.progress < 100 ? 'Advanced Stage' : 'Completed'}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    selectedProject.progress < 30 ? 'bg-blue-500' :
                    selectedProject.progress < 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${selectedProject.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">Budget</div>
              <div className="font-medium text-lg">
                {selectedProject.budget 
                  ? `${(selectedProject.budget / 1000000).toFixed(2)}M MAD` 
                  : 'No budget set'}
              </div>
              {selectedProject.budget && (
                <div className="text-xs text-gray-500">
                  Estimated cost per unit: {(selectedProject.budget / Math.max(units.length, 1) / 1000).toFixed(0)}K MAD
                </div>
              )}
            </div>
          </div>

          {selectedProject.description && (
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
              <p className="text-gray-600">{selectedProject.description}</p>
            </div>
          )}

          {/* Units Section */}
          <div className="border-t border-gray-200 pt-6" ref={unitListRef}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900">Units</h3>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {units.length}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search units..."
                    value={unitSearchTerm}
                    onChange={(e) => setUnitSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartment</option>
                  <option value="commercial">Commercial</option>
                </select>
                
                <button
                  onClick={handleCreateUnit}
                  className="inline-flex items-center px-3 py-1 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Unit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUnits.length > 0 ? (
                filteredUnits.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    onSelect={() => handleSelectUnit(unit)}
                    categories={categories.filter(c => c.unit_id === unit.id)}
                    onEdit={() => handleEditUnit(unit)}
                    onDelete={() => handleDeleteUnit(unit.id)}
                    onAddCategory={() => {
                      setSelectedUnit(unit);
                      handleCreateCategory();
                    }}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8 bg-gray-50 rounded-lg">
                  <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No units found</h3>
                  <p className="text-gray-600 mb-4">
                    {unitSearchTerm || unitFilter !== 'all'
                      ? 'Try adjusting your search criteria'
                      : 'Get started by adding your first unit'}
                  </p>
                  {!unitSearchTerm && unitFilter === 'all' && (
                    <button
                      onClick={handleCreateUnit}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Unit
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Categories Section */}
          {selectedUnit && (
            <div className="border-t border-gray-200 pt-6 mt-6" ref={categoryListRef}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Categories for {selectedUnit.name}</h3>
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {categories.length}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedUnit.type.charAt(0).toUpperCase() + selectedUnit.type.slice(1)}
                    {selectedUnit.floor && ` • Floor: ${selectedUnit.floor}`}
                    {selectedUnit.area && ` • Area: ${selectedUnit.area}m²`}
                  </div>
                </div>
                <button
                  onClick={handleCreateCategory}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                </button>
              </div>

              <div className="space-y-4">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <CategoryCard
                      onSelect={() => handleSelectCategory(category)}
                      key={category.id}
                      category={category}
                      categoryTeams={selectedCategory?.id === category.id ? categoryTeams : []}
                      onEdit={() => handleEditCategory(category)}
                      onDelete={() => handleDeleteCategory(category.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                    <p className="text-gray-600 mb-4">
                      Get started by adding your first category
                    </p>
                    <button
                      onClick={handleCreateCategory}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Category
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ProjectModal />
      
      <UnitModal
        isOpen={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        onSave={handleSaveUnit}
        onCloneUnit={handleCloneUnit}
        projectId={selectedProject?.id || ""}
        projectName={selectedProject?.name || ""}
        unit={editingUnit || undefined}
        availableUnits={units}
      />
      
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={handleSaveCategory}
        unitId={selectedUnit?.id || ""}
        unitName={selectedUnit?.name || ""}
        category={editingCategory || undefined}
        existingTeams={categoryTeams}
        availableTeams={availableTeams}
      />
    </div>
  );
};

export default Projects;