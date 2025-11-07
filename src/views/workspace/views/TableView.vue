<template>
  <div class="table-view">
    <div class="view-header">
      <h3>{{ viewData?.name || '表格视图' }}</h3>
      <div class="view-actions">
        <t-button theme="default" size="medium">
          <template #icon><t-icon name="refresh" /></template>
          刷新
        </t-button>
        <t-button theme="default" size="medium">
          <template #icon><t-icon name="setting" /></template>
          配置
        </t-button>
      </div>
    </div>

    <div class="table-content">
      <div class="table-placeholder">
        <t-icon name="view-list" size="64px" />
        <p>表格视图 - ID: {{ viewId }}</p>
        <p class="hint">这里将显示表格内容</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  viewData: {
    type: Object,
    default: null
  },
  viewId: {
    type: String,
    required: true
  }
})
</script>

<style scoped lang="scss">
.table-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;

  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #e7e7e7;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
    }

    .view-actions {
      display: flex;
      gap: 8px;
    }
  }

  .table-content {
    flex: 1;
    padding: 24px;
    overflow: auto;

    .table-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #646a73;

      .t-icon {
        color: #ff8800;
        margin-bottom: 16px;
      }

      p {
        margin: 4px 0;
        font-size: 14px;

        &.hint {
          color: #bbb;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
