import type { Repository } from '~/types'

/**
 * Escape CSV field content
 * - Wrap in quotes if contains comma, quote, or newline
 * - Escape existing quotes by doubling them
 */
function escapeCsvField(field: string): string {
  if (field == null) return ''
  
  const stringValue = String(field)
  
  // Check if field needs escaping
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    // Escape quotes by doubling them
    const escaped = stringValue.replace(/"/g, '""')
    return `"${escaped}"`
  }
  
  return stringValue
}

/**
 * Convert array of repositories to CSV string
 */
function convertToCSV(repositories: Repository[]): string {
  if (!repositories || repositories.length === 0) {
    return ''
  }

  // Define CSV headers
  const headers = ['Name', 'Description', 'URL', 'Language', 'Stars', 'Created At']
  
  // Create header row
  const headerRow = headers.map(header => escapeCsvField(header)).join(',')
  
  // Create data rows
  const dataRows = repositories.map(repo => {
    const row = [
      repo.name,
      repo.description,
      repo.html_url,
      repo.language,
      repo.stargazers_count_formatted,
      repo.created_at
    ]
    return row.map(field => escapeCsvField(field)).join(',')
  })
  
  // Combine header and data rows with CRLF line endings for Windows compatibility
  return [headerRow, ...dataRows].join('\r\n')
}

/**
 * Trigger browser download of CSV file
 */
function downloadCSV(csvContent: string, filename: string = 'starred_repos.csv'): void {
  // Create Blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // Create object URL
  const url = URL.createObjectURL(blob)
  
  // Create temporary link element
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.display = 'none'
  
  // Append to body, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up object URL
  URL.revokeObjectURL(url)
}

/**
 * Composable for CSV export functionality
 */
export function useCsvExport() {
  /**
   * Export repositories to CSV file
   */
  const exportToCSV = (repositories: Repository[], filename?: string): void => {
    if (!repositories || repositories.length === 0) {
      throw new Error('No repositories to export')
    }
    
    const csvContent = convertToCSV(repositories)
    downloadCSV(csvContent, filename)
  }

  return {
    exportToCSV
  }
}
