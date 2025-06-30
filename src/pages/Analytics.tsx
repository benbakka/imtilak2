import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Filter, Users, Building2, Clock, DollarSign, Target, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AnalyticsService, AnalyticsData } from '../lib/analyticsService';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('last-6-months');
  const [selectedMetric, setSelectedMetric] = useState('progress');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalyticsData();
  }, [user?.company_id, selectedPeriod]);

  const loadAnalyticsData = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      setError('');
      
      const data = await AnalyticsService.getCompleteAnalyticsData(user.company_id, selectedPeriod);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ElementType;
    color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
    suffix?: string;
  }> = ({ title, value, change, icon: Icon, color, suffix = '' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      orange: 'bg-orange-50 text-orange-600',
      red: 'bg-red-50 text-red-600',
      purple: 'bg-purple-50 text-purple-600'
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {value}{suffix}
            </p>
            <div className="flex items-center">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  const ProgressChart = () => {
    if (!analyticsData) return null;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Project Progress Trends</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Planned</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Actual</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {analyticsData.projectProgress.map((month, index) => (
            <div key={month.month} className="flex items-center space-x-4">
              <div className="w-12 text-sm font-medium text-gray-600">{month.month}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Planned: {month.planned}%</span>
                  <span className="text-gray-600">Actual: {month.actual}%</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full absolute"
                      style={{ width: `${(month.planned / 50) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-green-500 h-3 rounded-full absolute opacity-80"
                      style={{ width: `${(month.actual / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="w-20 text-right">
                <span className={`text-sm font-medium ${
                  month.actual >= month.planned ? 'text-green-600' : 'text-red-600'
                }`}>
                  {month.actual >= month.planned ? '+' : ''}{month.actual - month.planned}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TeamPerformanceChart = () => {
    if (!analyticsData) return null;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Performance Analysis</h3>
        
        <div className="space-y-6">
          {analyticsData.teamPerformance.map((team, index) => (
            <div key={team.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">{team.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  team.efficiency >= 90 ? 'bg-green-100 text-green-800' :
                  team.efficiency >= 80 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {team.efficiency}% Efficiency
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{team.tasksCompleted}</div>
                  <div className="text-xs text-gray-600">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{team.avgDuration}</div>
                  <div className="text-xs text-gray-600">Avg Duration (days)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{team.projects}</div>
                  <div className="text-xs text-gray-600">Active Projects</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    team.efficiency >= 90 ? 'bg-green-500' :
                    team.efficiency >= 80 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${team.efficiency}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CategoryAnalysisChart = () => {
    if (!analyticsData) return null;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance Analysis</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Avg Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Completion Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Delay Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.categoryAnalysis.map((category, index) => (
                <tr key={category.name} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{category.name}</td>
                  <td className="py-3 px-4 text-gray-600">{category.avgDuration} days</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${category.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{category.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      category.delayRate <= 5 ? 'bg-green-100 text-green-800' :
                      category.delayRate <= 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {category.delayRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {category.completionRate >= 90 && category.delayRate <= 5 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : category.delayRate > 10 ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const BudgetAnalysisChart = () => {
    if (!analyticsData) return null;
    
    const { totalBudget, totalSpent, projectedSpend, savings } = analyticsData.budgetAnalysis;
    const spentPercentage = (totalSpent / totalBudget) * 100;
    const projectedPercentage = (projectedSpend / totalBudget) * 100;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Budget Overview</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Budget:</span>
                <span className="font-medium">{(totalBudget / 1000000).toFixed(1)}M MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Spent:</span>
                <span className="font-medium text-blue-600">{(totalSpent / 1000000).toFixed(1)}M MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Projected Total:</span>
                <span className="font-medium text-orange-600">{(projectedSpend / 1000000).toFixed(1)}M MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Projected Savings:</span>
                <span className="font-medium text-green-600">{(savings / 1000000).toFixed(1)}M MAD</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Budget Utilization</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Spent</span>
                  <span className="font-medium">{spentPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${spentPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Projected</span>
                  <span className="font-medium">{projectedPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-orange-500 h-3 rounded-full"
                    style={{ width: `${projectedPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${
                projectedPercentage <= 95 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className={`text-sm font-medium ${
                  projectedPercentage <= 95 ? 'text-green-800' : 'text-red-800'
                }`}>
                  {projectedPercentage <= 95 ? '✓ Under Budget' : '⚠ Over Budget Risk'}
                </div>
                <div className={`text-xs ${
                  projectedPercentage <= 95 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {projectedPercentage <= 95 
                    ? `${(100 - projectedPercentage).toFixed(1)}% buffer remaining`
                    : `${(projectedPercentage - 100).toFixed(1)}% over budget`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RiskAnalysis = () => {
    if (!analyticsData) return null;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Analysis</h3>
        
        <div className="space-y-4">
          {analyticsData.riskFactors.map((risk, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{risk.factor}</h4>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    risk.impact === 'High' ? 'bg-red-100 text-red-800' :
                    risk.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {risk.impact} Impact
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    risk.probability === 'High' ? 'bg-red-100 text-red-800' :
                    risk.probability === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {risk.probability} Probability
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Mitigation:</strong> {risk.mitigation}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Advanced insights and performance metrics for your construction projects
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="last-month">Last Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="last-year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Project Completion Rate"
            value={analyticsData.overview.projectCompletionRate}
            change={5.2}
            icon={Target}
            color="green"
            suffix="%"
          />
          <MetricCard
            title="Budget Efficiency"
            value={analyticsData.overview.budgetEfficiency}
            change={2.1}
            icon={DollarSign}
            color="blue"
            suffix="%"
          />
          <MetricCard
            title="On-Time Delivery"
            value={analyticsData.overview.onTimeDelivery}
            change={-1.5}
            icon={Clock}
            color="orange"
            suffix="%"
          />
          <MetricCard
            title="Active Projects"
            value={analyticsData.overview.activeProjects}
            change={0}
            icon={Building2}
            color="purple"
          />
          <MetricCard
            title="Team Utilization"
            value={analyticsData.overview.teamUtilization}
            change={12.5}
            icon={Users}
            color="green"
          />
          <MetricCard
            title="Avg Project Duration"
            value={analyticsData.overview.avgProjectDuration}
            change={-8.3}
            icon={Activity}
            color="blue"
            suffix=" days"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart />
        <TeamPerformanceChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryAnalysisChart />
        <BudgetAnalysisChart />
      </div>

      {/* Risk Analysis */}
      <RiskAnalysis />

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights & Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">🎯 Performance Highlights</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                {analyticsData?.teamPerformance[2]?.name || 'Équipe C'} shows exceptional efficiency at {analyticsData?.teamPerformance[2]?.efficiency || 95}% - consider as model team
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                {analyticsData?.categoryAnalysis[0]?.name || 'Fondation'} category has {analyticsData?.categoryAnalysis[0]?.completionRate || 95}% completion rate with minimal delays
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Budget efficiency improved by 2.1% compared to last period
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">⚠️ Areas for Improvement</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                {analyticsData?.categoryAnalysis[4]?.name || 'Finitions'} category shows {analyticsData?.categoryAnalysis[4]?.delayRate || 15}% delay rate - review scheduling
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                On-time delivery decreased by 1.5% - investigate bottlenecks
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                Consider cross-training teams to improve flexibility
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;