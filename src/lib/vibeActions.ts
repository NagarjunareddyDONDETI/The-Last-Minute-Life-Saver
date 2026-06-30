import { VibeAction } from './gemini'
import { useStore } from '../store/useStore'
import { HOUR, now } from './time'

export async function executeVibeActions(actions: VibeAction[]): Promise<boolean> {
  const store = useStore.getState()
  let shouldStop = false
  
  for (const action of actions) {
    console.log('[VibeAI] Executing action:', action)
    switch (action.type) {
      case 'ADD_TASK': {
        const title = action.payload?.title || 'New Task'
        const estMinutes = action.payload?.estMinutes || 30
        const deadlineOffsetHours = action.payload?.deadlineOffsetHours || 24
        
        await store.addTask({
          title,
          estMinutes,
          deadline: now() + (deadlineOffsetHours * HOUR),
          importance: 'medium',
          tags: ['vibeai']
        })
        break
      }
      
      case 'MARK_COMPLETE': {
        if (!action.payload?.taskId) continue
        store.toggleTask(action.payload.taskId)
        break
      }

      case 'OPEN_CALENDAR': {
        // Since we don't have OAuth, we'll open Google Calendar in a new tab
        window.open('https://calendar.google.com/calendar/r', '_blank')
        break
      }
      
      case 'SET_REMINDER': {
        // Setting a reminder can just be adding a task with high importance
        if (!action.payload?.title) continue
        const deadlineOffsetHours = action.payload.deadlineOffsetHours || 1
        
        await store.addTask({
          title: 'Reminder: ' + action.payload.title,
          estMinutes: 5,
          deadline: now() + (deadlineOffsetHours * HOUR),
          importance: 'high',
          tags: ['reminder', 'vibeai']
        })
        break
      }
      
      case 'STOP_CONVERSATION': {
        shouldStop = true
        break
      }
    }
  }
  
  return shouldStop
}
