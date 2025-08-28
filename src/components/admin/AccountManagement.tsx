import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsApi, type CreateAccountData, type UpdateAccountData } from '../../api/accounts'
import type { Account } from '../../api/types'

interface EditAccountModalProps {
  account: Account | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateAccountData | UpdateAccountData) => void
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({ account, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    segment: '',
    region: ''
  })

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        segment: account.segment || '',
        region: account.region || ''
      })
    } else {
      setFormData({ name: '', segment: '', region: '' })
    }
  }, [account])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-w-90vw">
        <h2 className="text-xl font-bold mb-4">
          {account ? 'Edit Account' : 'Create New Account'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Segment
            </label>
            <select
              value={formData.segment}
              onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select Segment</option>
              <option value="SMB">SMB</option>
              <option value="Mid-Market">Mid-Market</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select Region</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia Pacific">Asia Pacific</option>
              <option value="Latin America">Latin America</option>
              <option value="Middle East & Africa">Middle East & Africa</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              {account ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AccountManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch all accounts
  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  })

  // Create account mutation
  const createMutation = useMutation({
    mutationFn: accountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  // Update account mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountData }) => 
      accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: accountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  // Filter accounts based on search
  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (account.segment && account.segment.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (account.region && account.region.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCreateAccount = () => {
    setEditingAccount(null)
    setIsModalOpen(true)
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setIsModalOpen(true)
  }

  const handleSaveAccount = (data: CreateAccountData | UpdateAccountData) => {
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data })
    } else {
      createMutation.mutate(data as CreateAccountData)
    }
  }

  const handleDeleteAccount = (account: Account) => {
    if (window.confirm(`Are you sure you want to delete "${account.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(account.id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading accounts...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <div className="text-red-800">
          Error loading accounts: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Compact Header - UPDATED DESIGN */}
      <div className="flex justify-between items-center mb-4 bg-gray-50 p-4 rounded-lg">
        <h1 className="text-xl font-bold text-teal-700">🏢 Client Accounts</h1>
        <div className="flex items-center space-x-3">
          {/* Compact Search - TINY ICON */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 px-2 py-1 pl-6 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <svg className="absolute left-1.5 top-1.5 h-2.5 w-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={handleCreateAccount}
            className="px-3 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 transition-colors font-medium"
          >
            ➕ Add Account
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Account Name
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Segment
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Region
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Created
              </th>
              <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {searchQuery ? 'No accounts found matching your search.' : 'No accounts created yet.'}
                </td>
              </tr>
            ) : (
              filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{account.name}</div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                      {account.segment || 'Not Set'}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                    {account.region || 'Not Set'}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                    {new Date(account.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleEditAccount(account)}
                      className="text-teal-600 hover:text-teal-800 mr-4 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Account Count */}
      <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
        <span>Showing {filteredAccounts.length} of {accounts.length} accounts</span>
      </div>

      {/* Edit/Create Modal */}
      <EditAccountModal
        account={editingAccount}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAccount}
      />
    </div>
  )
}

export default AccountManagement