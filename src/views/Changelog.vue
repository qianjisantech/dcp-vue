<template>
  <div class="changelog-page">
    <!-- 顶部操作栏 -->
    <div class="changelog-header">
      <div class="header-left">
        <h2 class="page-title">
          <t-icon name="file-paste" size="24px" />
          发布日志
        </h2>
        <p class="page-description">查看系统的版本更新记录和功能变更</p>
      </div>
      <div class="header-right">
        <t-input
          v-model="searchKeyword"
          placeholder="搜索版本或内容..."
          clearable
          style="width: 280px"
        >
          <template #prefix-icon>
            <t-icon name="search" />
          </template>
        </t-input>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <t-loading text="加载中..." size="large" />
    </div>

    <!-- 发布日志列表 -->
    <div v-else class="changelog-list">
      <div
        v-for="changelog in filteredChangelogList"
        :key="changelog.id"
        class="changelog-card"
        @click="viewDetail(changelog.id)"
      >
        <div class="card-header">
          <div class="version-info">
            <span class="version-badge">{{ changelog.version }}</span>
            <span class="type-badge" :class="changelog.type">
              {{ getTypeLabel(changelog.type) }}
            </span>
          </div>
          <div class="date-info">
            <t-icon name="time" size="14px" />
            <span>{{ formatDate(changelog.publishDate) }}</span>
          </div>
        </div>

        <h3 class="card-title">{{ changelog.title }}</h3>

        <div class="card-summary">
          {{ getContentSummary(changelog.content) }}
        </div>

        <div class="card-footer">
          <span class="publisher-info">
            <t-icon name="user" size="14px" />
            {{ changelog.createdBy || '系统管理员' }}
          </span>
          <t-button theme="primary" variant="text" size="small">
            查看详情
            <t-icon name="chevron-right" size="14px" />
          </t-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredChangelogList.length === 0" class="empty-state">
        <t-icon name="inbox" size="48px" />
        <p>暂无发布日志</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getChangelogList } from '@/api/changelog'

const router = useRouter()
const loading = ref(false)
const searchKeyword = ref('')
const changelogList = ref([])

// 加载发布日志列表
const loadChangelogList = async () => {
  try {
    loading.value = true
    const res = await getChangelogList()
    if (res.success) {
      changelogList.value = res.data || []
      // 按发布日期降序排序
      changelogList.value.sort((a, b) => {
        return new Date(b.publishDate || b.createTime) - new Date(a.publishDate || a.createTime)
      })
    } else {
      MessagePlugin.error(res.message || '获取发布日志列表失败')
    }
  } catch (error) {
    console.error('获取发布日志列表失败:', error)
    MessagePlugin.error('获取发布日志列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选后的列表
const filteredChangelogList = computed(() => {
  if (!searchKeyword.value) {
    return changelogList.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return changelogList.value.filter(changelog => {
    return (
      changelog.version?.toLowerCase().includes(keyword) ||
      changelog.title?.toLowerCase().includes(keyword) ||
      changelog.content?.toLowerCase().includes(keyword)
    )
  })
})

// 获取类型标签
const getTypeLabel = (type) => {
  const labels = {
    feature: '新功能',
    bugfix: '修复',
    improvement: '改进'
  }
  return labels[type] || type
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取内容摘要
const getContentSummary = (content) => {
  if (!content) return '暂无描述'

  try {
    // 尝试解析 JSON 格式的 content
    const contentData = typeof content === 'string' ? JSON.parse(content) : content
    const allItems = [
      ...(contentData.features || []),
      ...(contentData.improvements || []),
      ...(contentData.bugfixes || [])
    ]
    if (allItems.length > 0) {
      const summary = allItems.slice(0, 2).join('; ')
      return allItems.length > 2 ? summary + '...' : summary
    }
  } catch (error) {
    // 如果不是 JSON，直接截取文本
    const text = String(content).substring(0, 100)
    return text.length < content.length ? text + '...' : text
  }

  return '暂无描述'
}

// 查看详情
const viewDetail = (id) => {
  router.push({
    path: '/changelog/detail',
    query: { id }
  })
}

onMounted(() => {
  loadChangelogList()
})
</script>

<style scoped lang="scss">
.changelog-page {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .changelog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32px 40px 24px;
    background: #fff;
    border-bottom: 1px solid #e7e7e7;

    .header-left {
      flex: 1;

      .page-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 24px;
        font-weight: 600;
        color: #1f2329;
        margin: 0 0 8px 0;

        .t-icon {
          color: #0052d9;
        }
      }

      .page-description {
        font-size: 14px;
        color: #646a73;
        margin: 0;
      }
    }

    .header-right {
      margin-left: 24px;
    }
  }

  .loading-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
  }

  .changelog-list {
    flex: 1;
    overflow-y: auto;
    padding: 24px 40px;

    .changelog-card {
      background: #fff;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      &:last-child {
        margin-bottom: 0;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .version-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .version-badge {
            padding: 4px 12px;
            background: linear-gradient(135deg, #0052d9 0%, #3e7dff 100%);
            color: #fff;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
          }

          .type-badge {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;

            &.feature {
              background: #e8f4ff;
              color: #0052d9;
            }

            &.bugfix {
              background: #ffe8e8;
              color: #d54941;
            }

            &.improvement {
              background: #fff4e8;
              color: #e37318;
            }
          }
        }

        .date-info {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #8a8e99;

          .t-icon {
            color: #8a8e99;
          }
        }
      }

      .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #1f2329;
        margin: 0 0 12px 0;
        line-height: 1.4;
      }

      .card-summary {
        font-size: 14px;
        color: #646a73;
        line-height: 1.6;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;

        .publisher-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #646a73;

          .t-icon {
            color: #646a73;
          }
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #bbb;
      background: #fff;
      border-radius: 8px;

      .t-icon {
        color: #ddd;
        margin-bottom: 16px;
      }

      p {
        font-size: 14px;
        margin: 0;
      }
    }
  }
}
</style>
