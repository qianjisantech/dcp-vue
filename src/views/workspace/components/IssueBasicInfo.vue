<template>
  <div class="task-fields">
    <div class="field-row">
      <div class="field-item">
        <span class="field-label">事项类型：</span>
        <div class="field-value-with-icon">
          <t-icon :name="getIssueTypeIcon(issue.type)" size="16px" :style="{ color: getIssueTypeColor(issue.type) }" />
          <span class="field-value">{{ issue.type }}</span>
        </div>
      </div>
      <div class="field-item">
        <span class="field-label">优先级：</span>
        <div class="field-value-with-icon">
          <t-icon :name="getPriorityIcon(issue.priority)" size="16px" :style="{ color: getPriorityColor(issue.priority) }" />
          <span class="field-value">{{ issue.priority }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getIssueTypeIcon, getIssueTypeColor, getStatusTheme, getPriorityIcon, getPriorityColor } from '../utils/issueHelpers'

defineProps({
  issue: {
    type: Object,
    required: true
  }
})
</script>

<style scoped lang="scss">
.task-fields {
  margin-bottom: 24px;

  .field-row {
    display: flex;
    gap: 24px;
    align-items: center;

    .field-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .field-label {
        font-size: 14px;
        color: #646a73;
        white-space: nowrap;
      }

      .field-value {
        font-size: 14px;
        color: #1f2329;
        font-weight: 500;
      }

      .field-value-with-icon {
        display: flex;
        align-items: center;
        gap: 6px;

        .field-value {
          font-size: 14px;
          color: #1f2329;
          font-weight: 500;
        }
      }

      .status-tag {
        font-weight: 500;
      }
    }
  }
}
</style>
