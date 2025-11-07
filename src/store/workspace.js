import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWorkspaceStore = defineStore('workspace', () => {
  const issueCount = ref(0)
  const searchIssueNumber = ref('')
  const refreshTrigger = ref(0) // 用于触发列表刷新的计数器

  const setIssueCount = (count) => {
    issueCount.value = count
  }

  const setSearchIssueNumber = (issueNumber) => {
    searchIssueNumber.value = issueNumber
  }

  // 触发刷新事项列表
  const refreshIssueList = () => {
    refreshTrigger.value++
  }

  return {
    issueCount,
    searchIssueNumber,
    refreshTrigger,
    setIssueCount,
    setSearchIssueNumber,
    refreshIssueList
  }
})
