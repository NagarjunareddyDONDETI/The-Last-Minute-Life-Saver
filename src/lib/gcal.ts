import type { Task } from '../types'

export function generateGoogleCalendarUrl(task: Task): string {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  const title = encodeURIComponent(task.title)
  
  // Format dates to YYYYMMDDTHHmmssZ
  const endDate = new Date(task.deadline)
  // Assume a 1 hour block for the deadline if not specified
  const startDate = new Date(task.deadline - 60 * 60 * 1000)
  
  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '')
  }
  
  const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`
  const details = encodeURIComponent(
    (task.notes ? task.notes + '\n\n' : '') + 
    '---\nAdded via RESCUE - The Last-Minute Life Saver'
  )
  
  return `${baseUrl}&text=${title}&dates=${dates}&details=${details}`
}
