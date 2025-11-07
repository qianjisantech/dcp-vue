<template>
  <div class="changelog-detail">
    <div v-if="loading" class="loading-state">
      <t-loading text="加载中..." size="large" />
    </div>

    <div v-else-if="changelogData" class="changelog-content">
      <!-- 头部信息 -->
      <div class="changelog-header">
        <div class="version-badge">{{ changelogData.version }}</div>
        <h1 class="changelog-title">{{ changelogData.title }}</h1>
        <div class="changelog-meta">
          <t-icon name="time" size="16px" />
          <span>发布时间：{{ changelogData.date }}</span>
        </div>
      </div>

      <!-- 更新内容 -->
      <div class="changelog-body">
        <div v-for="(section, index) in changelogData.sections" :key="index" class="changelog-section">
          <h2 class="section-title">
            <t-icon :name="section.icon" size="20px" />
            <span>{{ section.title }}</span>
          </h2>
          <ul class="section-list">
            <li v-for="(item, idx) in section.items" :key="idx" class="section-item">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <t-icon name="file-search" size="48px" />
      <p>未找到该发布日志</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getChangelogById } from '@/api/changelog'

const route = useRoute()
const loading = ref(false)
const changelogData = ref(null)

// 解析 changelog 数据为 sections 格式
const parseChangelogData = (data) => {
  if (!data) return null

  const sections = []

  // 解析 content JSON 字符串
  let contentData = {}
  if (data.content) {
    try {
      contentData = typeof data.content === 'string'
        ? JSON.parse(data.content)
        : data.content
    } catch (error) {
      console.error('解析 changelog content 失败:', error)
      contentData = {}
    }
  }

  // 新增功能
  const features = contentData.features || data.features || []
  if (features.length > 0) {
    sections.push({
      title: '新增功能',
      icon: 'add-circle',
      items: features
    })
  }

  // 优化改进
  const improvements = contentData.improvements || data.improvements || []
  if (improvements.length > 0) {
    sections.push({
      title: '优化改进',
      icon: 'check-circle',
      items: improvements
    })
  }

  // 问题修复
  const bugfixes = contentData.bugfixes || data.bugfixes || []
  if (bugfixes.length > 0) {
    sections.push({
      title: '问题修复',
      icon: 'error-circle',
      items: bugfixes
    })
  }

  return {
    id: data.id,
    version: data.version,
    title: data.title,
    date: data.publishDate || data.createTime,
    sections
  }
}

// 加载发布日志数据
const loadChangelogData = async () => {
  const id = route.query.id
  if (!id) {
    MessagePlugin.error('缺少日志ID')
    return
  }

  loading.value = true

  try {
    const res = await getChangelogById(id)
    if (res.success) {
      changelogData.value = parseChangelogData(res.data)
      if (!changelogData.value) {
        MessagePlugin.error('未找到该发布日志')
      }
    } else {
      MessagePlugin.error(res.message || '获取发布日志失败')
      changelogData.value = null
    }
  } catch (error) {
    console.error('获取发布日志失败:', error)
    MessagePlugin.error('获取发布日志失败')
    changelogData.value = null
  } finally {
    loading.value = false
  }
}

// 监听路由变化
watch(() => route.query.id, () => {
  if (route.query.id) {
    loadChangelogData()
  }
})

onMounted(() => {
  loadChangelogData()
})
</script>

<style scoped lang="scss">
.changelog-detail {
  width: 100%;
  height: 100%;
  background: #fff;
  overflow-y: auto;

  .loading-state,
  .empty-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #646a73;

    .t-icon {
      color: #bbb;
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }

  .changelog-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 24px 40px 40px;

    .changelog-header {
      background: #fff;
      border-radius: 8px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);

      .version-badge {
        display: inline-block;
        padding: 6px 16px;
        background: linear-gradient(135deg, #0052d9 0%, #3e7dff 100%);
        color: #fff;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 16px;
      }

      .changelog-title {
        font-size: 28px;
        font-weight: 600;
        color: #1f2329;
        margin: 0 0 16px 0;
        line-height: 1.4;
      }

      .changelog-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #646a73;
        font-size: 14px;

        .t-icon {
          color: #646a73;
        }
      }
    }

    .changelog-body {
      background: #fff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);

      .changelog-section {
        margin-bottom: 32px;

        &:last-child {
          margin-bottom: 0;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 600;
          color: #1f2329;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #e7e7e7;

          .t-icon {
            color: #0052d9;
          }
        }

        .section-list {
          list-style: none;
          padding: 0;
          margin: 0;

          .section-item {
            position: relative;
            padding-left: 24px;
            margin-bottom: 12px;
            font-size: 15px;
            line-height: 1.6;
            color: #1f2329;

            &::before {
              content: '';
              position: absolute;
              left: 8px;
              top: 10px;
              width: 6px;
              height: 6px;
              background: #0052d9;
              border-radius: 50%;
            }

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
  }
}
</style>
