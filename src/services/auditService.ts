export interface AuditLog {
  id: string
  timestamp: string
  user_id: string
  user_name: string
  action: string
  resource_type: 'user' | 'user_role' | 'system'
  resource_id?: string
  details: string
  changes?: {
    field: string
    old_value: any
    new_value: any
  }[]
  ip_address?: string
  user_agent?: string
}

export interface AuditLogFilter {
  start_date?: string
  end_date?: string
  user_id?: string
  action?: string
  resource_type?: string
}

class AuditService {
  private storageKey = 'kanban_audit_logs'

  private getStoredLogs(): AuditLog[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading audit logs:', error)
      return []
    }
  }

  private saveLogsToStorage(logs: AuditLog[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(logs))
    } catch (error) {
      console.error('Error saving audit logs:', error)
    }
  }

  async logAction(
    userId: string,
    userName: string,
    action: string,
    resourceType: 'user' | 'user_role' | 'system',
    details: string,
    resourceId?: string,
    changes?: AuditLog['changes']
  ): Promise<void> {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user_id: userId,
      user_name: userName,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      changes,
      ip_address: 'localhost', // In real app, get from request
      user_agent: navigator.userAgent
    }

    const logs = this.getStoredLogs()
    logs.unshift(log) // Add to beginning for most recent first

    // Keep only last 10,000 logs to prevent storage bloat
    if (logs.length > 10000) {
      logs.splice(10000)
    }

    this.saveLogsToStorage(logs)
  }

  async getAuditLogs(filter?: AuditLogFilter): Promise<AuditLog[]> {
    let logs = this.getStoredLogs()

    if (filter) {
      if (filter.start_date) {
        const startDate = new Date(filter.start_date)
        logs = logs.filter(log => new Date(log.timestamp) >= startDate)
      }

      if (filter.end_date) {
        const endDate = new Date(filter.end_date)
        endDate.setHours(23, 59, 59, 999) // End of day
        logs = logs.filter(log => new Date(log.timestamp) <= endDate)
      }

      if (filter.user_id) {
        logs = logs.filter(log => log.user_id === filter.user_id)
      }

      if (filter.action) {
        logs = logs.filter(log => log.action.toLowerCase().includes(filter.action.toLowerCase()))
      }

      if (filter.resource_type) {
        logs = logs.filter(log => log.resource_type === filter.resource_type)
      }
    }

    return logs
  }

  async getLogsFromLast24Hours(): Promise<AuditLog[]> {
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)
    
    return this.getAuditLogs({
      start_date: yesterday.toISOString()
    })
  }

  generateCSV(logs: AuditLog[]): string {
    const headers = [
      'Timestamp',
      'User Name',
      'Action',
      'Resource Type',
      'Resource ID',
      'Details',
      'Changes',
      'IP Address'
    ]

    const csvRows = [headers.join(',')]

    logs.forEach(log => {
      const changes = log.changes 
        ? log.changes.map(c => `${c.field}: ${c.old_value} → ${c.new_value}`).join('; ')
        : ''
      
      const row = [
        log.timestamp,
        `"${log.user_name}"`,
        `"${log.action}"`,
        log.resource_type,
        log.resource_id || '',
        `"${log.details}"`,
        `"${changes}"`,
        log.ip_address || ''
      ]
      
      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  }

  downloadCSV(logs: AuditLog[], filename?: string): void {
    const csv = this.generateCSV(logs)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename || `audit_logs_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Helper method to compare objects and generate change details
  generateChanges(oldObj: any, newObj: any, ignoredFields: string[] = ['updated_at']): AuditLog['changes'] {
    const changes: AuditLog['changes'] = []
    
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])
    
    for (const key of allKeys) {
      if (ignoredFields.includes(key)) continue
      
      const oldValue = oldObj?.[key]
      const newValue = newObj?.[key]
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          old_value: oldValue,
          new_value: newValue
        })
      }
    }
    
    return changes
  }
}

export const auditService = new AuditService()