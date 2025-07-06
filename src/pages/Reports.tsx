import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp, Building2, Users, Clock, DollarSign, CheckCircle, AlertTriangle, Eye, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../contexts/AuthContext';
import { ReportService, ReportData, ReportProject } from '../lib/reportService';
import { ProjectService } from '../lib/projectService';
import { formatDateForDisplay, calculateDurationInDays } from '../utils/dateFormatter';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<'overview' | 'projects' | 'teams' | 'financial'>('overview');
  const [dateRange, setDateRange] = useState('last-6-months');
  const [selectedProject, setSelectedProject] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    { id: 'overview', name: 'Project Overview', icon: BarChart3, description: 'Complete project status and progress summary' },
    { id: 'projects', name: 'Project Details', icon: Building2, description: 'Detailed analysis of individual projects' },
    { id: 'teams', name: 'Team Performance', icon: Users, description: 'Team efficiency and productivity metrics' },
    { id: 'financial', name: 'Financial Summary', icon: DollarSign, description: 'Budget tracking and cost analysis' }
  ];

  useEffect(() => {
    loadReportData();
  }, [user?.company_id, dateRange, selectedProject, selectedReport]);

  useEffect(() => {
    if (user?.company_id) {
      loadProjects();
    }
  }, [user?.company_id]);

  const loadProjects = async () => {
    if (!user?.company_id) return;

    try {
      const projectsResponse = await ProjectService.getProjects(user.company_id, 0, 100);
      setProjects(projectsResponse.content.map(p => ({ id: p.id, name: p.name })));
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadReportData = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      setError('');
      
      const data = await ReportService.getReportData(
        user.company_id, 
        dateRange, 
        selectedProject !== 'all' ? selectedProject : undefined
      );
      
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (reportType: string) => {
    const element = document.getElementById('report-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handlePreview = (reportType: string) => {
    setPreviewContent(reportType);
    setShowPreview(true);
  };

  const OverviewReport = () => {
    if (!reportData) return null;
    
    const totalProjects = reportData.projects.length;
    const totalBudget = reportData.projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = reportData.projects.reduce((sum, p) => sum + p.spent, 0);
    const avgProgress = Math.round(reportData.projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects);
    const totalDelayed = reportData.projects.reduce((sum, p) => sum + p.delayedTasks, 0);

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalProjects}</div>
                <div className="text-sm text-blue-600">Active Projects</div>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{avgProgress}%</div>
                <div className="text-sm text-green-600">Avg Progress</div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{((totalSpent / totalBudget) * 100).toFixed(1)}%</div>
                <div className="text-sm text-orange-600">Budget Used</div>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{totalDelayed}</div>
                <div className="text-sm text-red-600">Delayed Tasks</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Project Status Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Project Status Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {((project.spent / (project.budget || 1)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {(project.spent / 1000000).toFixed(1)}M / {((project.budget || 0) / 1000000).toFixed(1)}M MAD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {project.completedUnits}/{project.units}
                      </div>
                      <div className="text-sm text-gray-500">completed</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        project.delayedTasks > 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {project.delayedTasks > 0 ? `${project.delayedTasks} delayed` : 'On track'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ProjectDetailsReport = () => {
    if (!reportData) return null;
    
    const filteredProjects = selectedProject === 'all' 
      ? reportData.projects 
      : reportData.projects.filter(p => p.id === selectedProject);

    return (
      <div className="space-y-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                <p className="text-gray-600">{project.location}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{project.progress}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{project.units}</div>
                <div className="text-sm text-blue-600">Total Units</div>
                <div className="text-xs text-gray-600">{project.completedUnits} completed</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-lg font-bold text-green-600">{project.categories}</div>
                <div className="text-sm text-green-600">Categories</div>
                <div className="text-xs text-gray-600">{project.completedCategories} completed</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{project.teams}</div>
                <div className="text-sm text-orange-600">Active Teams</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {((project.budget || 0) / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-purple-600">Budget (MAD)</div>
                <div className="text-xs text-gray-600">
                  {(project.spent / 1000000).toFixed(1)}M spent
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{formatDateForDisplay(project.start_date, undefined, 'No Start Date')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium">{formatDateForDisplay(project.end_date, undefined, 'No End Date')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {calculateDurationInDays(project.start_date, project.end_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Financial Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Budget:</span>
                    <span className="font-medium">{((project.budget || 0) / 1000000).toFixed(2)}M MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Spent:</span>
                    <span className="font-medium">{(project.spent / 1000000).toFixed(2)}M MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-medium">{(((project.budget || 0) - project.spent) / 1000000).toFixed(2)}M MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget Usage:</span>
                    <span className={`font-medium ${
                      (project.spent / (project.budget || 1)) > 0.8 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {((project.spent / (project.budget || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const TeamPerformanceReport = () => {
    if (!reportData) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Team Performance Metrics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Projects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.teams.map((team) => (
                  <tr key={team.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.specialty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.projects}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.tasksCompleted}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              team.efficiency >= 90 ? 'bg-green-500' : 
                              team.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${team.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{team.efficiency}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.avgDuration} days</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Efficiency Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Efficiency Comparison</h3>
          <div className="space-y-4">
            {reportData.teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{team.name}</span>
                    <span className="text-sm text-gray-600">{team.efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        team.efficiency >= 90 ? 'bg-green-500' : 
                        team.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${team.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const FinancialReport = () => {
    if (!reportData) return null;
    
    const totalBudget = reportData.projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = reportData.projects.reduce((sum, p) => sum + p.spent, 0);
    const totalRemaining = totalBudget - totalSpent;

    return (
      <div className="space-y-6">
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {(totalBudget / 1000000).toFixed(1)}M MAD
            </div>
            <div className="text-sm text-blue-600">Total Budget</div>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {(totalSpent / 1000000).toFixed(1)}M MAD
            </div>
            <div className="text-sm text-orange-600">Total Spent</div>
            <div className="text-xs text-gray-600">
              {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(totalRemaining / 1000000).toFixed(1)}M MAD
            </div>
            <div className="text-sm text-green-600">Remaining</div>
            <div className="text-xs text-gray-600">
              {((totalRemaining / totalBudget) * 100).toFixed(1)}% available
            </div>
          </div>
        </div>

        {/* Project Financial Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Project Financial Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.projects.map((project) => {
                  const usagePercent = ((project.spent / (project.budget || 1)) * 100);
                  const remaining = (project.budget || 0) - project.spent;
                  
                  return (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {((project.budget || 0) / 1000000).toFixed(2)}M MAD
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(project.spent / 1000000).toFixed(2)}M MAD
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(remaining / 1000000).toFixed(2)}M MAD
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                usagePercent > 90 ? 'bg-red-500' : 
                                usagePercent > 75 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{usagePercent.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          usagePercent > 90 ? 'bg-red-100 text-red-800' :
                          usagePercent > 75 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {usagePercent > 90 ? 'Over Budget Risk' :
                           usagePercent > 75 ? 'Monitor' : 'On Track'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview': return <OverviewReport />;
      case 'projects': return <ProjectDetailsReport />;
      case 'teams': return <TeamPerformanceReport />;
      case 'financial': return <FinancialReport />;
      default: return <OverviewReport />;
    }
  };

  const PreviewModal = () => {
    if (!showPreview) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Report Preview</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div id="report-content">
              {/* Report Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {reportTypes.find(r => r.id === previewContent)?.name} Report
                </h1>
                <p className="text-gray-600">
                  Generated on {new Date().toLocaleDateString()} | {user?.company?.name || 'Your Company'}
                </p>
                <p className="text-sm text-gray-500">
                  Period: {dateRange.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
              
              {/* Report Content */}
              {renderReportContent()}
              
              {/* Report Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>This report was generated automatically by ConstructManager</p>
                <p>© 2024 {user?.company?.name || 'Your Company'} - All rights reserved</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
            <button
              onClick={() => generatePDF(previewContent)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate comprehensive reports for your construction projects
          </p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id as any)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  selectedReport === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <IconComponent className={`h-6 w-6 mb-2 ${
                  selectedReport === type.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className={`font-medium ${
                  selectedReport === type.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {type.name}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {type.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="last-month">Last Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="last-year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {selectedReport === 'projects' && (
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex space-x-2 ml-auto">
            <button
              onClick={() => handlePreview(selectedReport)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button
              onClick={() => generatePDF(selectedReport)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {reportTypes.find(r => r.id === selectedReport)?.name}
          </h2>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
        
        {renderReportContent()}
      </div>

      {/* Preview Modal */}
      <PreviewModal />
    </div>
  );
};

export default Reports;