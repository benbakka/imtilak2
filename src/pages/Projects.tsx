import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Filter, ChevronRight, ChevronDown, Home, MapPin, Calendar, Users, Edit, Trash2, X, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Project, Unit, Category, CategoryTeam, Team, UnitTemplate } from '../types';
import { ProjectService, ProjectCreateRequest, ProjectUpdateRequest } from '../lib/projectService';
import { UnitService } from '../lib/unitService';
import { CategoryService } from '../lib/categoryService';
import { TeamService } from '../lib/teamService';
import { CategoryTeamService } from '../lib/categoryTeamService';
import { TemplateService } from '../lib/templateService';
import UnitModal from '../components/UnitManagement/UnitModal';
import UnitCard from '../components/UnitManagement/UnitCard';
import CategoryModal from '../components/CategoryManagement/CategoryModal';
import CategoryCard from '../components/CategoryManagement/CategoryCard';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryTeams, setCategoryTeams] = useState<CategoryTeam[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [templates, setTemplates] = useState<UnitTemplate[]>([]);
  
  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    projects: true,
    units: false,
    categories: false
  });
  
  // Refs for scrolling
  const unitsRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  
  // Load initial data
  useEffect(() => {
    if (user?.company_id) {
      loadProjects();
      loadTeams();
      loadTemplates();
    }
  }, [user?.company_id]);
  
  // Check for navigation state to auto-select project/unit/category
  useEffect(() => {
    if (location.state) {
      const state = location.state as any;
      
      if (state.selectedProjectId) {
        const projectId = state.selectedProjectId;
        // Find the project in our loaded projects or load it
        const project = projects.find(p => p.id === projectId);
        if (project) {
          handleSelectProject(project);
          
          // If we also have a unit ID, select that unit
          if (state.selectedUnitId) {
            loadUnits(projectId).then(() => {
              const unit = units.find(u => u.id === state.selectedUnitId);
              if (unit) {
                handleSelectUnit(unit);
                
                // If we also have a category ID, select that category
                if (state.selectedCategoryId) {
                  loadCategories(state.selectedUnitId).then(() => {
                    const category = categories.find(c => c.id === state.selectedCategoryId);
                    if (category) {
                      handleSelectCategory(category);
                    }
                  });
                }
              }
            });
          }
        } else {
          // Load the project if not found
          loadProject(projectId);
        }
      }
    }
  }, [location.state, projects.length]);
  
  const loadProjects = async () => {
    if (!user?.company_id) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await ProjectService.getProjects(user.company_id);
      setProjects(response.content);
      
      // If we have projects and none selected, select the first one
      if (response.content.length > 0 && !selectedProject) {
        handleSelectProject(response.content[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };
  
  const loadProject = async (projectId: string) => {
    if (!user?.company_id) return;
    
    try {
      setLoading(true);
      
      const project = await ProjectService.getProject(projectId, user.company_id);
      
      // Add to projects list if not already there
      setProjects(prev => {
        if (!prev.find(p => p.id === project.id)) {
          return [...prev, project];
        }
        return prev;
      });
      
      handleSelectProject(project);
    } catch (error) {
      console.error(`Error loading project ${projectId}:`, error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadUnits = async (projectId: string) => {
    try {
      setLoading(true);
      
      const response = await UnitService.getUnits(projectId);
      setUnits(response.content);
      
      return response.content;
    } catch (error) {
      console.error(`Error loading units for project ${projectId}:`, error);
      setUnits([]);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const loadCategories = async (unitId: string) => {
    try {
      setLoading(true);
      
      const categoriesData = await CategoryService.getCategories(unitId);
      setCategories(categoriesData);
      
      return categoriesData;
    } catch (error) {
      console.error(`Error loading categories for unit ${unitId}:`, error);
      setCategories([]);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const loadCategoryTeams = async (categoryId: string) => {
    try {
      const categoryTeamsData = await CategoryTeamService.getCategoryTeamsByCategory(categoryId);
      
      // Enhance with team data
      const enhancedCategoryTeams = await Promise.all(
        categoryTeamsData.map(async (ct) => {
          try {
            if (ct.team_id && user?.company_id) {
              const teamData = await TeamService.getTeam(ct.team_id, user.company_id);
              return { ...ct, team: teamData };
            }
            return ct;
          } catch (error) {
            console.error(`Error loading team for category team ${ct.id}:`, error);
            return ct;
          }
        })
      );
      
      setCategoryTeams(enhancedCategoryTeams);
    } catch (error) {
      console.error(`Error loading category teams for category ${categoryId}:`, error);
      setCategoryTeams([]);
    }
  };
  
  const loadTeams = async () => {
    if (!user?.company_id) return;
    
    try {
      const teamsData = await TeamService.getAllActiveTeams(user.company_id);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };
  
  const loadTemplates = async () => {
    if (!user?.company_id) return;
    
    try {
      const response = await TemplateService.getTemplates(user.company_id);
      setTemplates(response.content);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };
  
  // Selection handlers
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setSelectedUnit(null);
    setSelectedCategory(null);
    setCategories([]);
    setCategoryTeams([]);
    
    // Load units for this project
    loadUnits(project.id);
    
    // Expand projects section, collapse others
    setExpandedSections({
      projects: true,
      units: true,
      categories: false
    });
  };
  
  const handleSelectUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setSelectedCategory(null);
    setCategoryTeams([]);
    
    // Load categories for this unit
    loadCategories(unit.id);
    
    // Expand units and projects sections
    setExpandedSections({
      projects: true,
      units: true,
      categories: true
    });
    
    // Scroll to units section
    if (unitsRef.current) {
      unitsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    
    // Load category teams for this category
    loadCategoryTeams(category.id);
    
    // Expand all sections
    setExpandedSections({
      projects: true,
      units: true,
      categories: true
    });
    
    // Scroll to categories section
    if (categoriesRef.current) {
      categoriesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Modal handlers
  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };
  
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };
  
  const handleCreateUnit = () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }
    
    setEditingUnit(null);
    setShowUnitModal(true);
  };
  
  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowUnitModal(true);
  };
  
  const handleCreateCategory = () => {
    if (!selectedUnit) {
      alert('Please select a unit first');
      return;
    }
    
    setEditingCategory(null);
    setShowCategoryModal(true);
  };
  
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };
  
  // Save handlers
  const handleSaveProject = async (projectData: Partial<Project>) => {
    if (!user?.company_id) {
      alert('User authentication required');
      return;
    }
    
    try {
      if (editingProject) {
        // Update existing project - convert from Project to ProjectUpdateRequest
        const updateRequest: ProjectUpdateRequest = {
          name: projectData.name!,
          location: projectData.location!,
          startDate: projectData.start_date!,
          endDate: projectData.end_date!,
          description: projectData.description,
          status: projectData.status
        };
        
        const updatedProject = await ProjectService.updateProject(
          editingProject.id,
          user.company_id,
          updateRequest
        );
        
        setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
        setSelectedProject(updatedProject);
      } else {
        // Create new project - convert from Project to ProjectCreateRequest
        const createRequest: ProjectCreateRequest = {
          name: projectData.name!,
          location: projectData.location!,
          startDate: projectData.start_date!,
          endDate: projectData.end_date!,
          description: projectData.description
        };
        
        const newProject = await ProjectService.createProject(
          user.company_id,
          createRequest
        );
        
        setProjects([...projects, newProject]);
        handleSelectProject(newProject);
      }
      
      setShowProjectModal(false);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };
  
  const handleSaveUnit = async (unitData: Partial<Unit>, useTemplate?: boolean, templateData?: any) => {
    if (!user?.company_id || !selectedProject) {
      alert('Project selection required');
      return;
    }
    
    try {
      // Prepare clean unit data without undefined values
      const cleanUnitData = {
        name: unitData.name!,
        type: unitData.type!,
        floor: unitData.floor === undefined ? null : unitData.floor,
        area: unitData.area === undefined ? null : unitData.area,
        description: unitData.description === undefined ? null : unitData.description
      };
      
      console.log('Saving unit with data:', cleanUnitData);
      
      if (editingUnit) {
        // Update existing unit
        const updatedUnit = await UnitService.updateUnit(
          editingUnit.id,
          selectedProject.id,
          cleanUnitData
        );
        
        setUnits(units.map(u => u.id === editingUnit.id ? updatedUnit : u));
        setSelectedUnit(updatedUnit);
      } else {
        // Create new unit
        const newUnit = await UnitService.createUnit(
          selectedProject.id,
          user.company_id,
          cleanUnitData
        );
        
        setUnits([...units, newUnit]);
        handleSelectUnit(newUnit);
        
        // If using template, apply template
        if (useTemplate && templateData?.template) {
          // TODO: Apply template to unit
          console.log('Applying template to unit:', templateData.template);
          alert(`Unit "${newUnit.name}" created successfully! Template will be applied.`);
        } else {
          alert(`Unit "${newUnit.name}" created successfully!`);
        }
      }
      
      setShowUnitModal(false);
    } catch (error) {
      console.error('Error saving unit:', error);
      if (error instanceof Error) {
        alert(`Failed to save unit: ${error.message}`);
      } else {
        alert('Failed to save unit');
      }
    }
  };
  
  const handleCloneUnit = async (newUnitData: Partial<Unit>) => {
    if (!user?.company_id || !selectedProject) {
      alert('Project selection required');
      return;
    }
    
    try {
      // Prepare clean unit data without undefined values
      const cleanUnitData = {
        name: newUnitData.name!,
        type: newUnitData.type!,
        floor: newUnitData.floor === undefined ? null : newUnitData.floor,
        area: newUnitData.area === undefined ? null : newUnitData.area,
        description: newUnitData.description === undefined ? null : newUnitData.description
      };
      
      console.log('Cloning unit with data:', cleanUnitData);
      
      const newUnit = await UnitService.createUnit(
        selectedProject.id,
        user.company_id,
        cleanUnitData
      );
      
      setUnits([...units, newUnit]);
      handleSelectUnit(newUnit);
      
      alert(`Unit "${newUnit.name}" cloned successfully!`);
      setShowUnitModal(false);
    } catch (error) {
      console.error('Error cloning unit:', error);
      if (error instanceof Error) {
        alert(`Failed to clone unit: ${error.message}`);
      } else {
        alert('Failed to clone unit');
      }
    }
  };
  
  const handleSaveCategory = async (categoryData: Partial<Category>, teamAssignments: Partial<CategoryTeam>[]) => {
    if (!selectedUnit) {
      alert('Unit selection required');
      return;
    }
    
    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategory = await CategoryService.updateCategory(
          editingCategory.id,
          selectedUnit.id,
          {
            name: categoryData.name!,
            description: categoryData.description,
            startDate: categoryData.start_date!,
            endDate: categoryData.end_date!,
            orderSequence: categoryData.order
          }
        );
        
        // Update category teams
        for (const teamAssignment of teamAssignments) {
          if (teamAssignment.id) {
            // Update existing team assignment
            await CategoryTeamService.updateCategoryTeam(
              teamAssignment.id,
              {
                status: teamAssignment.status,
                receptionStatus: teamAssignment.reception_status,
                paymentStatus: teamAssignment.payment_status,
                notes: teamAssignment.notes
              }
            );
          } else if (teamAssignment.team_id) {
            // Create new team assignment
            await CategoryTeamService.createCategoryTeam(
              updatedCategory.id,
              {
                teamId: teamAssignment.team_id,
                status: teamAssignment.status,
                receptionStatus: teamAssignment.reception_status,
                paymentStatus: teamAssignment.payment_status,
                notes: teamAssignment.notes
              }
            );
          }
        }
        
        // Refresh categories
        const refreshedCategories = await loadCategories(selectedUnit.id);
        
        // Find and select the updated category
        const category = refreshedCategories.find(c => c.id === editingCategory.id);
        if (category) {
          handleSelectCategory(category);
        }
      } else {
        // Create new category
        const newCategory = await CategoryService.createCategory(
          selectedUnit.id,
          selectedProject!.id,
          {
            name: categoryData.name!,
            description: categoryData.description,
            startDate: categoryData.start_date!,
            endDate: categoryData.end_date!,
            orderSequence: categoryData.order
          }
        );
        
        // Create team assignments
        for (const teamAssignment of teamAssignments) {
          if (teamAssignment.team_id) {
            await CategoryTeamService.createCategoryTeam(
              newCategory.id,
              {
                teamId: teamAssignment.team_id,
                status: teamAssignment.status,
                receptionStatus: teamAssignment.reception_status,
                paymentStatus: teamAssignment.payment_status,
                notes: teamAssignment.notes
              }
            );
          }
        }
        
        // Refresh categories
        const refreshedCategories = await loadCategories(selectedUnit.id);
        
        // Find and select the new category
        const category = refreshedCategories.find(c => c.id === newCategory.id);
        if (category) {
          handleSelectCategory(category);
        }
      }
      
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };
  
  // Delete handlers
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.') || !user?.company_id) {
      return;
    }
    
    try {
      await ProjectService.deleteProject(projectId, user.company_id);
      
      // Remove from projects list
      setProjects(projects.filter(p => p.id !== projectId));
      
      // If this was the selected project, clear selection
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setSelectedUnit(null);
        setSelectedCategory(null);
        setUnits([]);
        setCategories([]);
        setCategoryTeams([]);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };
  
  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this unit? This action cannot be undone.') || !selectedProject) {
      return;
    }
    
    try {
      await UnitService.deleteUnit(unitId, selectedProject.id);
      
      // Remove from units list
      setUnits(units.filter(u => u.id !== unitId));
      
      // If this was the selected unit, clear selection
      if (selectedUnit?.id === unitId) {
        setSelectedUnit(null);
        setSelectedCategory(null);
        setCategories([]);
        setCategoryTeams([]);
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert('Failed to delete unit');
    }
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.') || !selectedUnit) {
      return;
    }
    
    try {
      await CategoryService.deleteCategory(categoryId, selectedUnit.id);
      
      // Remove from categories list
      setCategories(categories.filter(c => c.id !== categoryId));
      
      // If this was the selected category, clear selection
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
        setCategoryTeams([]);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };
  
  // Project Modal Component
  const ProjectModal: React.FC = () => {
    const [formData, setFormData] = useState({
      name: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      status: 'planning'
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    useEffect(() => {
      if (editingProject) {
        setFormData({
          name: editingProject.name,
          location: editingProject.location,
          startDate: editingProject.start_date,
          endDate: editingProject.end_date,
          description: editingProject.description || '',
          status: editingProject.status
        });
      } else {
        // Set default dates for new projects
        const today = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);
        
        setFormData({
          name: '',
          location: '',
          startDate: today.toISOString().split('T')[0],
          endDate: nextYear.toISOString().split('T')[0],
          description: '',
          status: 'planning'
        });
      }
    }, [editingProject, showProjectModal]);
    
    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.name.trim()) {
        newErrors.name = 'Project name is required';
      }
      
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }
      
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      }
      
      if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }
      
      // Create the appropriate request object based on whether we're editing or creating
      if (editingProject) {
        // For updating an existing project
        const updateRequest: ProjectUpdateRequest = {
          name: formData.name,
          location: formData.location,
          startDate: formData.startDate,
          endDate: formData.endDate,
          description: formData.description,
          status: formData.status as Project['status']
        };
        
        handleSaveProject({
          ...editingProject,
          name: formData.name,
          location: formData.location,
          start_date: formData.startDate,
          end_date: formData.endDate,
          description: formData.description,
          status: formData.status as Project['status']
        });
      } else {
        // For creating a new project
        const createRequest: ProjectCreateRequest = {
          name: formData.name,
          location: formData.location,
          startDate: formData.startDate,
          endDate: formData.endDate,
          description: formData.description,
          status: formData.status
        };
        
        handleSaveProject({
          name: formData.name,
          location: formData.location,
          start_date: formData.startDate,
          end_date: formData.endDate,
          description: formData.description,
          status: formData.status as Project['status']
        });
      }
    };
    
    if (!showProjectModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h3>
            <button
              onClick={() => setShowProjectModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
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
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
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
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.startDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>
            
            {editingProject && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            )}
            
            <div>
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
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2 inline" />
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
        <button
          onClick={handleCreateProject}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
          onClick={() => toggleSection('projects')}
        >
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Projects</h2>
            <span className="ml-2 text-sm text-gray-500">({projects.length})</span>
          </div>
          <button>
            {expandedSections.projects ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        
        {expandedSections.projects && (
          <div className="p-4">
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedProject?.id === project.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectProject(project)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.location}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                      <div className="flex">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{project.progress || 0}%</div>
                      <div className="text-xs text-gray-600">Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(project.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-600">End Date</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{project.unit_count || 0}</div>
                      <div className="text-xs text-gray-600">Units</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {projects.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first project</p>
                  <button
                    onClick={handleCreateProject}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </button>
                </div>
              )}
              
              {loading && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600">Loading projects...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Units Section */}
      {selectedProject && (
        <div 
          ref={unitsRef}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
            onClick={() => toggleSection('units')}
          >
            <div className="flex items-center">
              <Home className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Units</h2>
              <span className="ml-2 text-sm text-gray-500">({units.length})</span>
              <span className="ml-2 text-sm text-blue-600">
                Project: {selectedProject.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateUnit();
                }}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Unit
              </button>
              <button onClick={(e) => {
                e.stopPropagation();
                toggleSection('units');
              }}>
                {expandedSections.units ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          
          {expandedSections.units && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    categories={categories.filter(c => c.unit_id === unit.id)}
                    onEdit={() => handleEditUnit(unit)}
                    onDelete={() => handleDeleteUnit(unit.id)}
                    onAddCategory={() => {
                      setSelectedUnit(unit);
                      handleCreateCategory();
                    }}
                    onSelect={() => handleSelectUnit(unit)}
                  />
                ))}
                
                {units.length === 0 && !loading && (
                  <div className="col-span-full text-center py-8">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No units found</h3>
                    <p className="text-gray-600 mb-4">Add units to organize your project</p>
                    <button
                      onClick={handleCreateUnit}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Unit
                    </button>
                  </div>
                )}
                
                {loading && (
                  <div className="col-span-full text-center py-8">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading units...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories Section */}
      {selectedUnit && (
        <div 
          ref={categoriesRef}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
            onClick={() => toggleSection('categories')}
          >
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Categories</h2>
              <span className="ml-2 text-sm text-gray-500">({categories.length})</span>
              <span className="ml-2 text-sm text-blue-600">
                Unit: {selectedUnit.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateCategory();
                }}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </button>
              <button onClick={(e) => {
                e.stopPropagation();
                toggleSection('categories');
              }}>
                {expandedSections.categories ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          
          {expandedSections.categories && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    categoryTeams={
                      selectedCategory?.id === category.id
                        ? categoryTeams
                        : []
                    }
                    onEdit={() => handleEditCategory(category)}
                    onDelete={() => handleDeleteCategory(category.id)}
                    onSelect={() => handleSelectCategory(category)}
                  />
                ))}
                
                {categories.length === 0 && !loading && (
                  <div className="col-span-full text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No categories found</h3>
                    <p className="text-gray-600 mb-4">Add categories to organize work in this unit</p>
                    <button
                      onClick={handleCreateCategory}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Category
                    </button>
                  </div>
                )}
                
                {loading && (
                  <div className="col-span-full text-center py-8">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading categories...</p>
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
        projectId={selectedProject?.id || ''}
        projectName={selectedProject?.name || ''}
        unit={editingUnit || undefined}
        availableUnits={units}
        availableTemplates={templates}
      />
      
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={handleSaveCategory}
        unitId={selectedUnit?.id || ''}
        unitName={selectedUnit?.name || ''}
        category={editingCategory || undefined}
        existingTeams={categoryTeams}
        availableTeams={teams}
      />
    </div>
  );
};

export default Projects;