<template>
  <div class="detail-header">
    <div class="header-left">
      <t-breadcrumb>
        <t-breadcrumb-item>{{ issue.space }}</t-breadcrumb-item>
        <t-breadcrumb-item>{{ issue.issue_no }}</t-breadcrumb-item>
      </t-breadcrumb>
    </div>
  </div>
</template>

<script setup>
defineProps({
  issue: {
    type: Object,
    required: true
  }
})
</script>

<style scoped lang="scss">
.detail-header {
  padding: 12px 24px;
  border-bottom: 1px solid #e7e7e7;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-left {
    :deep(.t-breadcrumb) {
      font-size: 14px;
    }
  }
}
</style>
