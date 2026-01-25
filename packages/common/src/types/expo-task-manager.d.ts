declare module 'expo-task-manager' {
  export interface TaskManagerError {
    message: string
  }

  export interface TaskManagerTaskData {
    locations: any[]
  }

  export function defineTask(
    taskName: string,
    task: (data: {
      data: TaskManagerTaskData
      error: TaskManagerError | null
    }) => void | Promise<void>
  ): void
}
