<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* 全局设置弹窗蒙层样式 - 统一设置为浅灰色半透明 */
.t-drawer__mask,
.t-dialog__mask,
.t-popup__mask,
.t-modal__mask {
  background-color: rgba(0, 0, 0, 0.3) !important;
}
</style>
