export class CsvService {
  static downloadCSV<T>(data: T[], filename: string, columnMapping?: Record<string, string>): void {
    if (!data.length) {
      alert('No data to export')
      return
    }

    const headers = Object.keys(data[0] as object)
    const csvHeaders = headers.map(header => columnMapping?.[header] || header)
    
    const csvContent = [
      csvHeaders.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = (row as any)[header]
          if (value === null || value === undefined) return ''
          
          const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
          
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  static parseCSV<T>(csvText: string, columnMapping?: Record<string, string>): T[] {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const mappedHeaders = headers.map(header => {
      if (columnMapping) {
        const mappedKey = Object.entries(columnMapping).find(([_, value]) => value === header)?.[0]
        return mappedKey || header
      }
      return header
    })

    return lines.slice(1).map(line => {
      const values = this.parseCSVLine(line)
      const row: any = {}
      
      mappedHeaders.forEach((header, index) => {
        const value = values[index]?.trim() || ''
        
        if (value === '') {
          row[header] = null
        } else if (!isNaN(Number(value)) && value !== '') {
          row[header] = Number(value)
        } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
          row[header] = value.toLowerCase() === 'true'
        } else if (value.startsWith('{') || value.startsWith('[')) {
          try {
            row[header] = JSON.parse(value)
          } catch {
            row[header] = value
          }
        } else {
          row[header] = value
        }
      })
      
      return row as T
    })
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }

  static createUploadHandler<T>(
    onDataParsed: (data: T[]) => void,
    columnMapping?: Record<string, string>,
    validateData?: (data: T[]) => { valid: boolean; errors: string[] }
  ) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (!file.name.endsWith('.csv')) {
        alert('Please select a CSV file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string
          const parsedData = this.parseCSV<T>(csvText, columnMapping)
          
          if (validateData) {
            const validation = validateData(parsedData)
            if (!validation.valid) {
              alert(`Invalid data:\n${validation.errors.join('\n')}`)
              return
            }
          }
          
          onDataParsed(parsedData)
        } catch (error) {
          console.error('CSV parsing error:', error)
          alert('Error parsing CSV file. Please check the format.')
        }
      }
      
      reader.readAsText(file)
      event.target.value = ''
    }
  }
}