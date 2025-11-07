<template>
  <div class="gantt-view">
    <div class="view-header">
      <div class="header-left">
        <h3>{{ viewData?.name || '甘特图视图' }}</h3>
        <!-- 图例 -->
        <div class="legend">
          <div class="legend-item">
            <div class="legend-bar status-completed"></div>
            <span>已完成</span>
          </div>
          <div class="legend-item">
            <div class="legend-bar status-in-progress"></div>
            <span>进行中</span>
          </div>
          <div class="legend-item">
            <div class="legend-bar status-pending"></div>
            <span>未开始</span>
          </div>
        </div>
      </div>
      <div class="view-actions">
        <t-space>
          <t-button
            size="medium"
            :variant="timeScale === 'day' ? 'base' : 'outline'"
            @click="timeScale = 'day'"
          >
            日
          </t-button>
          <t-button
            size="medium"
            :variant="timeScale === 'week' ? 'base' : 'outline'"
            @click="timeScale = 'week'"
          >
            周
          </t-button>
          <t-button
            size="medium"
            :variant="timeScale === 'month' ? 'base' : 'outline'"
            @click="timeScale = 'month'"
          >
            月
          </t-button>
        </t-space>
        <t-button theme="default" size="medium" @click="handleToday">
          今天
        </t-button>
      </div>
    </div>

    <div class="gantt-content">
      <div class="gantt-container">
        <!-- 左侧任务列表 -->
        <div class="task-list">
          <div class="task-list-header">
            <div class="column task-name">任务名称</div>
            <div class="column assignee">负责人</div>
            <div class="column duration">工期</div>
          </div>
          <div class="task-list-body">
            <div
              v-for="task in ganttTasks"
              :key="task.id"
              class="task-row"
              :style="{ paddingLeft: task.level * 20 + 'px' }"
            >
              <div class="column task-name">
                <t-icon
                  v-if="task.children"
                  :name="task.expanded ? 'chevron-down' : 'chevron-right'"
                  size="14px"
                  class="expand-icon"
                  @click="toggleTask(task)"
                />
                <span>{{ task.name }}</span>
              </div>
              <div class="column assignee">
                <t-avatar v-if="task.assignee" size="24px">
                  {{ task.assignee.charAt(0) }}
                </t-avatar>
              </div>
              <div class="column duration">{{ task.duration }}天</div>
            </div>
          </div>
        </div>

        <!-- 右侧时间轴和甘特图 -->
        <div class="gantt-chart">
          <div class="timeline-header">
            <div
              v-for="date in timelineDates"
              :key="date.key"
              class="timeline-cell"
              :class="{ today: date.isToday }"
            >
              <div class="date-label">{{ date.label }}</div>
              <div class="day-label">{{ date.day }}</div>
            </div>
          </div>
          <div class="gantt-bars">
            <div v-for="task in ganttTasks" :key="task.id" class="bar-row">
              <div
                v-if="!task.children"
                class="gantt-bar"
                :style="getBarStyle(task)"
              >
                <div class="bar-content" :class="`status-${task.status}`">
                  <span class="bar-text">{{ task.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'

const props = defineProps({
  viewData: {
    type: Object,
    default: null
  },
  viewId: {
    type: String,
    required: true
  }
})

const timeScale = ref('day')

// 甘特图任务数据
const ganttTasks = ref([
  {
    id: 1,
    name: '项目启动阶段',
    level: 0,
    expanded: true,
    children: true,
    startDate: '2024-12-10',
    endDate: '2024-12-15',
    duration: 5,
    assignee: 'Admin',
    progress: 100,
    status: 'completed'
  },
  {
    id: 2,
    name: '需求分析',
    level: 1,
    startDate: '2024-12-10',
    endDate: '2024-12-12',
    duration: 2,
    assignee: 'Tester1',
    progress: 100,
    status: 'completed'
  },
  {
    id: 3,
    name: '技术方案设计',
    level: 1,
    startDate: '2024-12-13',
    endDate: '2024-12-15',
    duration: 3,
    assignee: 'Admin',
    progress: 100,
    status: 'completed'
  },
  {
    id: 4,
    name: '开发阶段',
    level: 0,
    expanded: true,
    children: true,
    startDate: '2024-12-16',
    endDate: '2024-12-25',
    duration: 10,
    assignee: 'Tester2',
    progress: 60,
    status: 'in-progress'
  },
  {
    id: 5,
    name: '前端开发',
    level: 1,
    startDate: '2024-12-16',
    endDate: '2024-12-22',
    duration: 7,
    assignee: 'Tester1',
    progress: 70,
    status: 'in-progress'
  },
  {
    id: 6,
    name: '后端开发',
    level: 1,
    startDate: '2024-12-16',
    endDate: '2024-12-25',
    duration: 10,
    assignee: 'Admin',
    progress: 50,
    status: 'in-progress'
  },
  {
    id: 7,
    name: '测试阶段',
    level: 0,
    startDate: '2024-12-26',
    endDate: '2024-12-30',
    duration: 5,
    assignee: 'Tester2',
    progress: 0,
    status: 'pending'
  }
])

// 生成时间轴日期
const timelineDates = computed(() => {
  const dates = []
  const today = new Date()
  const startDate = new Date('2024-12-10')

  for (let i = 0; i < 25; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)

    const isToday = currentDate.toDateString() === today.toDateString()

    dates.push({
      key: currentDate.toISOString(),
      label: `${currentDate.getMonth() + 1}月`,
      day: currentDate.getDate(),
      isToday
    })
  }

  return dates
})

// 计算甘特条的样式
const getBarStyle = (task) => {
  const startDate = new Date('2024-12-10')
  const taskStart = new Date(task.startDate)
  const taskEnd = new Date(task.endDate)

  const dayWidth = 60 // 每天的宽度
  const startOffset = Math.floor((taskStart - startDate) / (1000 * 60 * 60 * 24))
  const duration = Math.floor((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1

  return {
    left: `${startOffset * dayWidth}px`,
    width: `${duration * dayWidth - 4}px`
  }
}

const toggleTask = (task) => {
  task.expanded = !task.expanded
  MessagePlugin.info(`${task.expanded ? '展开' : '收起'}: ${task.name}`)
}

const handleToday = () => {
  MessagePlugin.success('跳转到今天')
}

const handleAddTask = () => {
  MessagePlugin.info('添加任务')
}
</script>

<style scoped lang="scss">
.gantt-view {
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

    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2329;
      }

      .legend {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 16px;
        background: #f5f5f5;
        border-radius: 6px;

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #646a73;

          .legend-bar {
            width: 32px;
            height: 14px;
            border-radius: 3px;

            &.status-completed {
              background: linear-gradient(135deg, #00a870 0%, #00c48c 100%);
            }

            &.status-in-progress {
              background: linear-gradient(135deg, #0052d9 0%, #3e7dff 100%);
            }

            &.status-pending {
              background: linear-gradient(135deg, #bbb 0%, #ddd 100%);
            }
          }
        }
      }
    }

    .view-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .gantt-content {
    flex: 1;
    overflow: hidden;
    display: flex;

    .gantt-container {
      display: flex;
      width: 100%;
      height: 100%;

      // 左侧任务列表
      .task-list {
        flex-shrink: 0;
        width: 400px;
        border-right: 1px solid #e7e7e7;
        display: flex;
        flex-direction: column;
        background: #fafafa;

        .task-list-header {
          display: flex;
          align-items: center;
          height: 60px;
          border-bottom: 2px solid #e7e7e7;
          background: #f5f5f5;
          font-weight: 600;
          font-size: 13px;
          color: #646a73;

          .column {
            padding: 0 12px;

            &.task-name {
              flex: 1;
            }

            &.assignee {
              width: 80px;
              text-align: center;
            }

            &.duration {
              width: 80px;
              text-align: center;
            }
          }
        }

        .task-list-body {
          flex: 1;
          overflow-y: auto;

          .task-row {
            display: flex;
            align-items: center;
            height: 50px;
            border-bottom: 1px solid #e7e7e7;
            background: #fff;
            transition: background 0.2s;

            &:hover {
              background: #f5f7fa;
            }

            .column {
              padding: 0 12px;
              display: flex;
              align-items: center;

              &.task-name {
                flex: 1;
                gap: 8px;
                font-size: 14px;
                color: #1f2329;

                .expand-icon {
                  cursor: pointer;
                  color: #646a73;
                  flex-shrink: 0;

                  &:hover {
                    color: #0052d9;
                  }
                }
              }

              &.assignee {
                width: 80px;
                justify-content: center;
              }

              &.duration {
                width: 80px;
                justify-content: center;
                font-size: 13px;
                color: #646a73;
              }
            }
          }
        }
      }

      // 右侧甘特图
      .gantt-chart {
        flex: 1;
        overflow-x: auto;
        overflow-y: auto;
        position: relative;

        .timeline-header {
          display: flex;
          height: 60px;
          border-bottom: 2px solid #e7e7e7;
          background: #f5f5f5;
          position: sticky;
          top: 0;
          z-index: 10;

          .timeline-cell {
            flex-shrink: 0;
            width: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-right: 1px solid #e7e7e7;
            font-size: 12px;
            color: #646a73;

            &.today {
              background: #e8f4ff;
              color: #0052d9;
              font-weight: 600;
            }

            .date-label {
              font-size: 11px;
              margin-bottom: 4px;
            }

            .day-label {
              font-size: 14px;
              font-weight: 600;
            }
          }
        }

        .gantt-bars {
          position: relative;
          min-height: 100%;

          .bar-row {
            height: 50px;
            border-bottom: 1px solid #e7e7e7;
            position: relative;

            &::before {
              content: '';
              position: absolute;
              left: 0;
              right: 0;
              top: 0;
              bottom: 0;
              background: repeating-linear-gradient(
                to right,
                transparent,
                transparent 59px,
                #e7e7e7 59px,
                #e7e7e7 60px
              );
              pointer-events: none;
            }

            .gantt-bar {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              height: 28px;
              cursor: pointer;
              z-index: 1;

              .bar-content {
                height: 100%;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

                &:hover {
                  transform: scale(1.02);
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                }

                &.status-completed {
                  background: linear-gradient(135deg, #00a870 0%, #00c48c 100%);
                }

                &.status-in-progress {
                  background: linear-gradient(135deg, #0052d9 0%, #3e7dff 100%);
                }

                &.status-pending {
                  background: linear-gradient(135deg, #bbb 0%, #ddd 100%);
                }

                .bar-text {
                  font-size: 12px;
                  color: #fff;
                  font-weight: 500;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
