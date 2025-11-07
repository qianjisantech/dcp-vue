# 系统更新提醒组件使用说明

## 功能介绍

UpdateNotification 组件用于在系统右下角显示更新提醒弹窗，当系统发布新版本时，会自动提醒用户更新。

## 功能特点

1. **自动检测**：系统启动后3秒自动显示更新提醒
2. **版本记录**：使用 localStorage 记录已忽略的版本，避免重复提醒
3. **用户选择**：
   - 立即更新：模拟更新进度，完成后刷新页面
   - 稍后提醒：关闭弹窗，下次启动时继续提醒
   - 关闭按钮：忽略此版本更新，不再提醒
4. **动画效果**：右侧滑入动画，铃铛摇晃效果

## 使用方式

### 1. 自动触发

组件已集成在主布局中（`src/layout/index.vue`），会在页面加载后自动检测并显示。

### 2. 手动触发

如果需要手动触发更新提示，可以通过 ref 调用组件方法：

```vue
<template>
  <UpdateNotification ref="updateNotificationRef" />
</template>

<script setup>
import { ref } from 'vue'
import UpdateNotification from '@/components/UpdateNotification.vue'

const updateNotificationRef = ref(null)

// 显示更新提示
const showUpdateNotification = () => {
  updateNotificationRef.value?.show({
    title: '发现新版本',
    version: 'v2.2.0',
    description: '系统已发布新版本，包含以下更新：',
    features: [
      '新功能1',
      '新功能2',
      '新功能3'
    ]
  })
}

// 隐藏更新提示
const hideUpdateNotification = () => {
  updateNotificationRef.value?.hide()
}
</script>
```

### 3. 通过全局事件总线触发

可以使用全局事件来触发更新提示，适用于从任意组件触发：

```javascript
// 触发显示
window.dispatchEvent(new CustomEvent('show-update-notification', {
  detail: {
    title: '发现新版本',
    version: 'v2.2.0',
    description: '系统已发布新版本',
    features: ['新功能1', '新功能2']
  }
}))
```

## 数据结构

```typescript
interface UpdateInfo {
  title: string           // 标题
  version: string        // 版本号
  description: string    // 描述
  features: string[]     // 功能列表
}
```

## 配置说明

### 修改默认更新信息

编辑 `src/components/UpdateNotification.vue` 中的 `updateInfo` 默认值：

```javascript
const updateInfo = ref({
  title: '发现新版本',
  version: 'v2.1.0',
  description: '我们很高兴地宣布，系统已发布新版本，包含以下更新：',
  features: [
    '新增功能1',
    '新增功能2'
  ]
})
```

### 修改延迟时间

在 `checkUpdate` 函数中修改延迟显示的时间（单位：毫秒）：

```javascript
setTimeout(() => {
  visible.value = true
}, 3000)  // 改为需要的延迟时间
```

### 禁用自动检测

如果不需要自动显示，可以注释掉 `onMounted` 中的 `checkUpdate()` 调用：

```javascript
onMounted(() => {
  // checkUpdate()  // 注释掉自动检测
})
```

## 本地存储

组件使用 localStorage 存储以下数据：

- `dismissedUpdateVersion`：已忽略的版本号

清除本地存储：
```javascript
localStorage.removeItem('dismissedUpdateVersion')
```

## 样式自定义

可以通过修改组件的 SCSS 样式来调整外观：

- 位置：修改 `right` 和 `bottom` 属性
- 宽度：修改 `width` 属性
- 颜色：修改 `background` 和渐变色
- 动画：修改 `@keyframes` 动画效果

## 注意事项

1. 组件已在主布局中引入，无需在其他页面重复引入
2. "立即更新"会刷新整个页面，确保用户数据已保存
3. 版本号应遵循语义化版本规范（如 v1.0.0）
4. 更新信息应简洁明了，突出重点功能
