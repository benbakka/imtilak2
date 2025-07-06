import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Calendar, Download, Eye, CheckCircle, AlertTriangle, Clock, CreditCard, FileText, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CategoryTeamService } from '../lib/categoryTeamService';
import { ProjectService } from '../lib/projectService';
import { PaymentService, Payment, PaymentSummary, PaymentUpdateRequest, PaymentCreateRequest } from '../lib/paymentService';
import { formatDateForInput } from '../utils/dateFormatter';

const Payments: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue' | 'approved' | 'draft'>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    totalBudget: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    paymentsThisMonth: 0,
    pendingApprovals: 0
  });
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPaymentData();
  }, [user?.company_id]);

  const loadPaymentData = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      setError('');

      // Load projects for filter
      const projectsResponse = await ProjectService.getProjects(user.company_id, 0, 100);
      setProjects(projectsResponse.content.map(p => ({ id: p.id, name: p.name })));

      // Load payment summary
      const summary = await PaymentService.getPaymentSummary(user.company_id);
      setPaymentSummary(summary);

      // Load payments
      const paymentsResponse = await PaymentService.getPayments(user.company_id, 0, 100);
      setPayments(paymentsResponse.content);
    } catch (error) {
      console.error('Error loading payment data:', error);
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesProject = filterProject === 'all' || payment.projectId === filterProject;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Overdue' },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Approved' },
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Draft' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleCreatePayment = () => {
    setEditingPayment(null);
    setShowPaymentModal(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setShowPaymentModal(true);
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  const handleSavePayment = async (paymentData: any) => {
    if (!user?.company_id) {
      alert('User not authenticated');
      return;
    }
    
    try {
      if (editingPayment) {
        // Update existing payment
        const updateData: PaymentUpdateRequest = {
          description: paymentData.description,
          amount: Number(paymentData.amount),
          status: paymentData.status,
          dueDate: paymentData.dueDate,
          notes: paymentData.notes || ''
        };
        
        const updatedPayment = await PaymentService.updatePayment(
          editingPayment.id, 
          user.company_id, 
          updateData
        );
        
        setPayments(payments.map(p => 
          p.id === editingPayment.id ? { ...p, ...updateData } : p
        ));
      } else {
        // Validate required fields for new payment
        if (!paymentData.projectId) {
          throw new Error('Project is required');
        }
        
        const paymentRequest: PaymentCreateRequest = {
          projectId: paymentData.projectId,
          unitId: paymentData.unitId || '1', // Default for demo
          categoryId: paymentData.categoryId || '1', // Default for demo
          teamId: paymentData.teamId || '1', // Default for demo
          categoryTeamId: paymentData.categoryTeamId || '1', // Default for demo
          description: paymentData.description || '',
          amount: Number(paymentData.amount) || 0,
          status: paymentData.status || 'draft',
          dueDate: paymentData.dueDate || formatDateForInput(new Date().toISOString()),
          notes: paymentData.notes || ''
        };
        
        const newPayment = await PaymentService.createPayment(paymentRequest);
        setPayments([...payments, newPayment]);
      }
      
      // Reload payment data to get updated summary
      await loadPaymentData();
      
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error saving payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save payment';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!user?.company_id) {
      alert('User not authenticated');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return;
    }
    
    try {
      await PaymentService.deletePayment(paymentId, user.company_id);
      setPayments(payments.filter(p => p.id !== paymentId));
      
      // Show success message
      alert('Payment deleted successfully');
      
      // Reload payment data to update summary
      await loadPaymentData();
    } catch (error) {
      console.error('Error deleting payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete payment';
      alert(`Error: ${errorMessage}`);
    }
  };

  // Payment Modal Component
  const PaymentModal: React.FC = () => {
    const [formData, setFormData] = useState({
      projectId: '',
      unitName: '',
      categoryName: '',
      teamId: '',
      description: '',
      amount: '',
      dueDate: '',
      status: 'draft',
      notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
      if (editingPayment) {
        setFormData({
          projectId: editingPayment.projectId,
          unitName: editingPayment.unitName,
          categoryName: editingPayment.categoryName,
          teamId: editingPayment.teamId,
          description: editingPayment.description,
          amount: editingPayment.amount.toString(),
          dueDate: editingPayment.dueDate,
          status: editingPayment.status,
          notes: editingPayment.notes
        });
      } else {
        setFormData({
          projectId: '',
          unitName: '',
          categoryName: '',
          teamId: '',
          description: '',
          amount: '',
          dueDate: '',
          status: 'draft',
          notes: ''
        });
      }
      setErrors({});
    }, [editingPayment, showPaymentModal]);

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      if (!formData.projectId) newErrors.projectId = 'Project is required';
      if (!formData.description?.trim()) newErrors.description = 'Description is required';
      
      const amount = Number(formData.amount);
      if (!formData.amount || isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Valid amount greater than 0 is required';
      }
      
      if (!formData.dueDate) {
        newErrors.dueDate = 'Due date is required';
      } else {
        const today = new Date();
        const dueDate = new Date(formData.dueDate);
        if (dueDate < today && formData.status !== 'paid') {
          newErrors.dueDate = 'Due date cannot be in the past for pending payments';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setIsLoading(true);
      
      try {
        const paymentData = {
          ...formData,
          amount: Number(formData.amount),
          status: formData.status as Payment['status']
        };
        
        await handleSavePayment(paymentData);
      } catch (error) {
        console.error('Error saving payment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save payment';
        alert(`Error: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
        setIsLoading(false);
      }
    };

    const handleClose = () => {
      setShowPaymentModal(false);
      setFormData({
        projectId: '',
        unitName: '',
        categoryName: '',
        teamId: '',
        description: '',
        amount: '',
        dueDate: '',
        status: 'draft',
        notes: ''
      });
      setErrors({});
    };

    if (!showPaymentModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingPayment ? 'Edit Payment' : 'Create New Payment'}
            </h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project *
                </label>
                <select
                  required
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.projectId ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select a project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {errors.projectId && <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Name
                </label>
                <input
                  type="text"
                  value={formData.unitName || ''}
                  onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="e.g., Villa 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.categoryName || ''}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="e.g., Fondation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (MAD) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">MAD</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    disabled={isLoading}
                    className={`w-full pl-16 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate || ''}
                  min={formatDateForInput(new Date().toISOString())}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dueDate ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                required
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="e.g., Travaux de fondation - Phase 1"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isLoading}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Additional notes..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting || isLoading}
                className={`px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                  isSubmitting || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : (editingPayment ? 'Update Payment' : 'Create Payment')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Payment Details Modal
  const PaymentDetailsModal: React.FC = () => {
    if (!showPaymentModal || !selectedPayment) return null;

    const handleApprovePayment = async () => {
      if (!user?.company_id) return;
      
      try {
        const updatedPayment = await PaymentService.approvePayment(selectedPayment.id, user.company_id);
        setPayments(payments.map(p => p.id === selectedPayment.id ? updatedPayment : p));
        setSelectedPayment(updatedPayment);
      } catch (error) {
        console.error('Error approving payment:', error);
        alert('Failed to approve payment. Please try again.');
      }
    };

    const handleMarkAsPaid = async () => {
      if (!user?.company_id) return;
      
      try {
        const paymentMethod = prompt('Enter payment method (e.g., bank_transfer, check, cash):', 'bank_transfer');
        if (!paymentMethod) return;
        
        const updatedPayment = await PaymentService.markAsPaid(selectedPayment.id, user.company_id, paymentMethod);
        setPayments(payments.map(p => p.id === selectedPayment.id ? updatedPayment : p));
        setSelectedPayment(updatedPayment);
      } catch (error) {
        console.error('Error marking payment as paid:', error);
        alert('Failed to mark payment as paid. Please try again.');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
            <button
              onClick={() => setSelectedPayment(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Payment Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedPayment.invoiceNumber}</h2>
                <p className="text-gray-600">{selectedPayment.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedPayment.amount)}</div>
                {getStatusBadge(selectedPayment.status)}
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Project Information</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-600">Project:</span> <span className="font-medium">{selectedPayment.projectName}</span></div>
                  <div><span className="text-gray-600">Unit:</span> <span className="font-medium">{selectedPayment.unitName}</span></div>
                  <div><span className="text-gray-600">Category:</span> <span className="font-medium">{selectedPayment.categoryName}</span></div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Team:</span>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: selectedPayment.teamColor }}
                      ></div>
                      <span className="font-medium">{selectedPayment.teamName}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-600">Due Date:</span> <span className="font-medium">{formatDate(selectedPayment.dueDate)}</span></div>
                  {selectedPayment.paidDate && (
                    <div><span className="text-gray-600">Paid Date:</span> <span className="font-medium">{formatDate(selectedPayment.paidDate)}</span></div>
                  )}
                  {selectedPayment.paymentMethod && (
                    <div><span className="text-gray-600">Method:</span> <span className="font-medium">{selectedPayment.paymentMethod}</span></div>
                  )}
                  {selectedPayment.status === 'overdue' && (
                    <div><span className="text-gray-600">Days Overdue:</span> <span className="font-medium text-red-600">{getDaysOverdue(selectedPayment.dueDate)} days</span></div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedPayment.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPayment.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              {selectedPayment.status === 'pending' && (
                <button
                  onClick={handleApprovePayment}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Payment
                </button>
              )}
              
              {(selectedPayment.status === 'approved' || selectedPayment.status === 'pending') && (
                <button
                  onClick={handleMarkAsPaid}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Mark as Paid
                </button>
              )}
              
              <button
                onClick={() => {
                  setSelectedPayment(null);
                  handleEditPayment(selectedPayment);
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Payment
              </button>
              
              <button
                onClick={() => {
                  setSelectedPayment(null);
                  handleDeletePayment(selectedPayment.id);
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
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
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage project payments and financial tracking
          </p>
        </div>
        <button
          onClick={handleCreatePayment}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(paymentSummary.totalBudget)}
              </div>
              <div className="text-sm text-gray-600">Total Budget</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(paymentSummary.totalPaid)}
              </div>
              <div className="text-sm text-gray-600">Total Paid</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(paymentSummary.totalPending)}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(paymentSummary.totalOverdue)}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
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
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
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
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice / Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">{payment.projectName}</div>
                      <div className="text-xs text-gray-400">{payment.unitName} • {payment.categoryName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: payment.teamColor }}
                      ></div>
                      <div className="text-sm text-gray-900">{payment.teamName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(payment.dueDate)}</div>
                    {payment.status === 'overdue' && (
                      <div className="text-xs text-red-600">
                        {getDaysOverdue(payment.dueDate)} days overdue
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPayment(payment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditPayment(payment)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterProject !== 'all'
              ? 'Try adjusting your search criteria'
              : 'Get started by creating your first payment'}
          </p>
          {!searchTerm && filterStatus === 'all' && filterProject === 'all' && (
            <button
              onClick={handleCreatePayment}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Payment
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <PaymentModal />
      {selectedPayment && <PaymentDetailsModal />}
    </div>
  );
};

export default Payments;