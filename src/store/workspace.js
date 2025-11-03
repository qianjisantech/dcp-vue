import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWorkspaceStore = defineStore('workspace', () => {
  const taskCount = ref(0)
  const searchTaskNumber = ref('')

  const setTaskCount = (count) => {
    taskCount.value = count
  }

  const setSearchTaskNumber = (taskNumber) => {
    searchTaskNumber.value = taskNumber
  }

  return {
    taskCount,
    searchTaskNumber,
    setTaskCount,
    setSearchTaskNumber
  }
})
