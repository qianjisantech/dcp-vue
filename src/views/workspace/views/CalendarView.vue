<template>
  <div class="calendar-view">
    <div class="view-header">
      <div class="header-left">
        <h3>{{ viewData?.name || '日历视图' }}</h3>
        <div class="date-info">
          <span class="current-month">{{ currentYearMonth }}</span>
        </div>
      </div>
      <div class="view-actions">
        <t-space>
          <t-button
            size="medium"
            :variant="viewMode === 'month' ? 'base' : 'outline'"
            @click="viewMode = 'month'"
          >
            月
          </t-button>
          <t-button
            size="medium"
            :variant="viewMode === 'week' ? 'base' : 'outline'"
            @click="viewMode = 'week'"
          >
            周
          </t-button>
          <t-button
            size="medium"
            :variant="viewMode === 'day' ? 'base' : 'outline'"
            @click="viewMode = 'day'"
          >
            日
          </t-button>
        </t-space>
        <t-button theme="default" size="medium" @click="goToToday">
          今天
        </t-button>
        <t-button theme="default" size="medium" @click="prevPeriod">
          <template #icon><t-icon name="chevron-left" /></template>
        </t-button>
        <t-button theme="default" size="medium" @click="nextPeriod">
          <template #icon><t-icon name="chevron-right" /></template>
        </t-button>
      </div>
    </div>

    <div class="calendar-content">
      <!-- 日历主体 -->
      <div class="calendar-main">
        <!-- 月视图 -->
        <div v-if="viewMode === 'month'" class="month-view">
        <!-- 星期标题 -->
        <div class="week-header">
          <div v-for="day in weekDays" :key="day" class="week-day">
            {{ day }}
          </div>
        </div>

        <!-- 日期网格 -->
        <div class="days-grid-container">
          <div class="days-grid">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="day-cell"
              :class="{
                'other-month': !day.isCurrentMonth,
                'is-today': day.isToday,
                'is-weekend': day.isWeekend
              }"
            >
              <div class="day-number">{{ day.day }}</div>
            </div>
          </div>

          <!-- 连续事件色块层 -->
          <div class="event-bars-layer">
            <div
              v-for="(bar, index) in monthEventBars"
              :key="`bar-${index}`"
              class="event-bar"
              :style="{
                gridColumn: `${(bar.startIndex % 7) + 1} / span ${bar.spanDays}`,
                gridRow: bar.calendarRow + 1,
                top: `${32 + bar.eventRow * 28}px`,
                background: getAssigneeColor(bar.event.assignee),
                borderLeftColor: getAssigneeColor(bar.event.assignee)
              }"
              @click="handleEventClick(bar.event)"
            >
              <span v-if="!bar.event.allDay" class="event-time">{{ bar.event.startTime }}</span>
              <span class="event-title">{{ bar.event.title }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 周视图 -->
      <div v-if="viewMode === 'week'" class="week-view">
        <div class="week-grid">
          <div class="time-column">
            <div class="time-header"></div>
            <div v-for="hour in 24" :key="hour" class="time-slot">
              {{ formatHour(hour - 1) }}
            </div>
          </div>
          <div
            v-for="(day, index) in weekViewDays"
            :key="index"
            class="day-column"
            :class="{ 'is-today': day.isToday }"
          >
            <div class="day-header">
              <div class="day-name">{{ day.dayName }}</div>
              <div class="day-date">{{ day.date }}</div>
            </div>
            <div class="day-schedule">
              <div
                v-for="event in day.events"
                :key="event.id"
                class="schedule-event"
                :style="{
                  ...getEventStyle(event),
                  background: getAssigneeColor(event.assignee),
                  borderLeftColor: getAssigneeColor(event.assignee)
                }"
                @click="handleEventClick(event)"
              >
                <div class="event-title">{{ event.title }}</div>
                <div class="event-time">{{ event.startTime }} - {{ event.endTime }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 日视图 -->
      <div v-if="viewMode === 'day'" class="day-view">
        <div class="day-schedule-container">
          <div class="time-column">
            <div v-for="hour in 24" :key="hour" class="time-slot">
              {{ formatHour(hour - 1) }}
            </div>
          </div>
          <div class="events-column">
            <div
              v-for="event in dayViewEvents"
              :key="event.id"
              class="day-event"
              :style="{
                ...getEventStyle(event),
                background: getAssigneeColor(event.assignee),
                borderLeftColor: getAssigneeColor(event.assignee)
              }"
              @click="handleEventClick(event)"
            >
              <div class="event-title">{{ event.title }}</div>
              <div class="event-time">{{ event.startTime }} - {{ event.endTime }}</div>
              <div v-if="event.location" class="event-location">
                <t-icon name="location" size="12px" />
                {{ event.location }}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- 右侧筛选面板 -->
      <div class="filter-sidebar">
        <div class="filter-section">
          <div class="filter-title">成员筛选</div>
          <div class="filter-options">
            <div
              class="filter-option"
              @click="toggleAllAssignees"
            >
              <div class="checkbox-wrapper">
                <div class="custom-checkbox" :class="{ checked: isAllAssigneesSelected }">
                  <t-icon v-if="isAllAssigneesSelected" name="check" size="12px" />
                </div>
              </div>
              <span>全部成员</span>
              <span class="count">{{ allEventsCount }}</span>
            </div>
            <div
              v-for="assignee in assigneeList"
              :key="assignee.name"
              class="filter-option"
              @click="toggleAssignee(assignee.name)"
            >
              <div class="checkbox-wrapper">
                <div
                  class="custom-checkbox colored"
                  :class="{ checked: isAssigneeSelected(assignee.name) }"
                  :style="{ background: assignee.color }"
                >
                  <t-icon v-if="isAssigneeSelected(assignee.name)" name="check" size="12px" />
                </div>
              </div>
              <span>{{ assignee.name }}</span>
              <span class="count">{{ assignee.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 事项详情弹窗 -->
    <t-dialog
      v-model:visible="eventDetailVisible"
      :header="currentEvent?.title"
      width="500px"
    >
      <template #footer>
        <t-button theme="primary" @click="handleEditEvent">编辑</t-button>
        <t-button theme="default" @click="eventDetailVisible = false">关闭</t-button>
      </template>
      <div v-if="currentEvent" class="event-detail">
        <div class="detail-item">
          <label>时间</label>
          <div class="detail-value">
            <t-icon name="time" size="14px" />
            <span v-if="currentEvent.allDay">全天</span>
            <span v-else>
              {{ currentEvent.startDate }}
              {{ currentEvent.startTime }} - {{ currentEvent.endTime }}
            </span>
          </div>
        </div>

        <div v-if="currentEvent.location" class="detail-item">
          <label>地点</label>
          <div class="detail-value">
            <t-icon name="location" size="14px" />
            {{ currentEvent.location }}
          </div>
        </div>

        <div class="detail-item">
          <label>负责人</label>
          <div class="detail-value">
            <t-avatar size="20px">{{ currentEvent.assignee?.charAt(0) }}</t-avatar>
            {{ currentEvent.assignee }}
          </div>
        </div>

        <div class="detail-item">
          <label>优先级</label>
          <div class="detail-value">
            <t-tag :theme="getPriorityTheme(currentEvent.priority)">
              {{ currentEvent.priority }}
            </t-tag>
          </div>
        </div>

        <div v-if="currentEvent.tags && currentEvent.tags.length" class="detail-item">
          <label>标签</label>
          <div class="detail-value tags">
            <t-tag
              v-for="tag in currentEvent.tags"
              :key="tag"
              size="small"
              variant="outline"
            >
              {{ tag }}
            </t-tag>
          </div>
        </div>

        <div v-if="currentEvent.participants && currentEvent.participants.length" class="detail-item">
          <label>参与人员</label>
          <div class="detail-value participants">
            <t-avatar
              v-for="participant in currentEvent.participants"
              :key="participant"
              size="24px"
            >
              {{ participant.charAt(0) }}
            </t-avatar>
          </div>
        </div>

        <div v-if="currentEvent.description" class="detail-item">
          <label>描述</label>
          <div class="detail-value">{{ currentEvent.description }}</div>
        </div>

        <div class="detail-item">
          <label>状态</label>
          <div class="detail-value">
            <t-tag :theme="getStatusTheme(currentEvent.status)">
              {{ getStatusText(currentEvent.status) }}
            </t-tag>
          </div>
        </div>
      </div>
    </t-dialog>

    <!-- 编辑事项弹窗 -->
    <t-dialog
      v-model:visible="editEventVisible"
      header="编辑事项"
      width="800px"
      @confirm="handleSaveEvent"
    >
      <div v-if="editingEvent" class="edit-event-dialog">
        <!-- 顶部：空间和事项类型 -->
        <div class="event-top-info">
          <t-form-item label="空间">
            <t-select v-model="editingEvent.space" placeholder="请选择空间">
              <t-option value="项目A" label="项目A" />
              <t-option value="项目B" label="项目B" />
              <t-option value="项目C" label="项目C" />
            </t-select>
          </t-form-item>
          <t-form-item label="事项类型">
            <t-select v-model="editingEvent.type" placeholder="请选择事项类型">
              <t-option value="需求" label="需求" />
              <t-option value="任务" label="任务" />
              <t-option value="缺陷" label="缺陷" />
            </t-select>
          </t-form-item>
        </div>

        <!-- Tab 页面 -->
        <t-tabs v-model="activeTab" class="event-tabs">
          <!-- 基本信息 -->
          <t-tab-panel value="basic" label="基本信息">
            <div class="tab-content">
              <t-form-item label="事项标题">
                <t-input v-model="editingEvent.title" placeholder="请输入事项标题" />
              </t-form-item>
              <t-form-item label="优先级">
                <t-select v-model="editingEvent.priority" placeholder="请选择优先级">
                  <t-option value="高" label="高" />
                  <t-option value="中" label="中" />
                  <t-option value="低" label="低" />
                </t-select>
              </t-form-item>
              <t-form-item label="状态">
                <t-select v-model="editingEvent.status" placeholder="请选择状态">
                  <t-option value="pending" label="未开始" />
                  <t-option value="in-progress" label="进行中" />
                  <t-option value="completed" label="已完成" />
                </t-select>
              </t-form-item>
              <t-form-item label="描述">
                <t-textarea v-model="editingEvent.description" placeholder="请输入描述" :autosize="{ minRows: 3, maxRows: 6 }" />
              </t-form-item>
            </div>
          </t-tab-panel>

          <!-- 人员 -->
          <t-tab-panel value="people" label="人员">
            <div class="tab-content">
              <t-form-item label="负责人">
                <t-select v-model="editingEvent.assignee" placeholder="请选择负责人">
                  <t-option value="Admin" label="Admin" />
                  <t-option value="Tester1" label="Tester1" />
                  <t-option value="Tester2" label="Tester2" />
                  <t-option value="Developer1" label="Developer1" />
                  <t-option value="Developer2" label="Developer2" />
                </t-select>
              </t-form-item>
              <t-form-item label="参与人员">
                <t-select v-model="editingEvent.participants" placeholder="请选择参与人员" multiple>
                  <t-option value="Admin" label="Admin" />
                  <t-option value="Tester1" label="Tester1" />
                  <t-option value="Tester2" label="Tester2" />
                  <t-option value="Developer1" label="Developer1" />
                  <t-option value="Developer2" label="Developer2" />
                </t-select>
              </t-form-item>
            </div>
          </t-tab-panel>

          <!-- 日期 -->
          <t-tab-panel value="date" label="日期">
            <div class="tab-content">
              <t-form-item label="开始日期">
                <t-date-picker v-model="editingEvent.startDate" placeholder="请选择开始日期" />
              </t-form-item>
              <t-form-item label="结束日期">
                <t-date-picker v-model="editingEvent.endDate" placeholder="请选择结束日期" />
              </t-form-item>
              <t-form-item label="开始时间">
                <t-time-picker v-model="editingEvent.startTime" placeholder="请选择开始时间" />
              </t-form-item>
              <t-form-item label="结束时间">
                <t-time-picker v-model="editingEvent.endTime" placeholder="请选择结束时间" />
              </t-form-item>
              <t-form-item label="全天">
                <t-switch v-model="editingEvent.allDay" />
              </t-form-item>
            </div>
          </t-tab-panel>

          <!-- 进展 -->
          <t-tab-panel value="progress" label="进展">
            <div class="tab-content">
              <t-form-item label="完成进度">
                <t-slider v-model="editingEvent.progress" :min="0" :max="100" :step="5" />
                <span class="progress-value">{{ editingEvent.progress }}%</span>
              </t-form-item>
              <t-form-item label="工作日志">
                <t-textarea v-model="editingEvent.worklog" placeholder="记录工作进展" :autosize="{ minRows: 4, maxRows: 8 }" />
              </t-form-item>
            </div>
          </t-tab-panel>

          <!-- 排期 -->
          <t-tab-panel value="schedule" label="排期">
            <div class="tab-content">
              <t-form-item label="预计工时（小时）">
                <t-input-number v-model="editingEvent.estimatedHours" :min="0" :step="0.5" placeholder="请输入预计工时" />
              </t-form-item>
              <t-form-item label="实际工时（小时）">
                <t-input-number v-model="editingEvent.actualHours" :min="0" :step="0.5" placeholder="请输入实际工时" />
              </t-form-item>
              <t-form-item label="里程碑">
                <t-select v-model="editingEvent.milestone" placeholder="请选择里程碑">
                  <t-option value="V1.0" label="V1.0" />
                  <t-option value="V1.1" label="V1.1" />
                  <t-option value="V2.0" label="V2.0" />
                </t-select>
              </t-form-item>
              <t-form-item label="迭代">
                <t-select v-model="editingEvent.sprint" placeholder="请选择迭代">
                  <t-option value="Sprint 1" label="Sprint 1" />
                  <t-option value="Sprint 2" label="Sprint 2" />
                  <t-option value="Sprint 3" label="Sprint 3" />
                </t-select>
              </t-form-item>
            </div>
          </t-tab-panel>
        </t-tabs>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, watch } from 'vue'
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

const viewMode = ref('month') // month, week, day
const currentDate = ref(new Date())
const eventDetailVisible = ref(false)
const currentEvent = ref(null)
const editEventVisible = ref(false)
const editingEvent = ref(null)
const activeTab = ref('basic')

// 筛选条件 - 已选中的成员列表
const selectedAssignees = ref([])

// 星期标题
const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 成员颜色配置 - 使用低饱和度颜色
const assigneeColors = {
  'Admin': '#ffb3b3',
  'Tester1': '#a8ddd8',
  'Tester2': '#9bd4e0',
  'Developer1': '#fce89d',
  'Developer2': '#d4cffe',
  'default': '#c5d5db'
}

// 获取成员颜色
const getAssigneeColor = (assignee) => {
  return assigneeColors[assignee] || assigneeColors.default
}

// 从接口获取原始事项数据
const allEvents = computed(() => {
  console.log('CalendarView - viewData:', props.viewData)
  if (props.viewData && props.viewData.data && props.viewData.data.issues) {
    console.log('CalendarView - issues:', props.viewData.data.issues)
    return props.viewData.data.issues
  }
  console.log('CalendarView - 没有找到 issues 数据')
  return []
})

// 筛选后的事项数据
const events = computed(() => {
  let filtered = allEvents.value

  // 按负责人筛选 - 如果有选中的成员，只显示这些成员的事项
  if (selectedAssignees.value.length > 0) {
    filtered = filtered.filter(event => selectedAssignees.value.includes(event.assignee))
  }

  return filtered
})

// 成员列表（从事项中提取）
const assigneeList = computed(() => {
  const assigneeMap = {}
  allEvents.value.forEach(event => {
    if (event.assignee) {
      if (!assigneeMap[event.assignee]) {
        assigneeMap[event.assignee] = {
          name: event.assignee,
          count: 0,
          color: getAssigneeColor(event.assignee)
        }
      }
      assigneeMap[event.assignee].count++
    }
  })
  return Object.values(assigneeMap)
})

// 全部事项数量
const allEventsCount = computed(() => allEvents.value.length)

// 是否所有成员都被选中
const isAllAssigneesSelected = computed(() => {
  return selectedAssignees.value.length === 0 || selectedAssignees.value.length === assigneeList.value.length
})

// 判断成员是否被选中
const isAssigneeSelected = (assigneeName) => {
  return selectedAssignees.value.length === 0 || selectedAssignees.value.includes(assigneeName)
}

// 切换全选/全不选
const toggleAllAssignees = () => {
  if (isAllAssigneesSelected.value) {
    // 如果当前是全选状态，清空选择
    selectedAssignees.value = []
  } else {
    // 如果不是全选状态，选中所有成员
    selectedAssignees.value = assigneeList.value.map(a => a.name)
  }
}

// 切换单个成员选中状态
const toggleAssignee = (assigneeName) => {
  const index = selectedAssignees.value.indexOf(assigneeName)
  if (index > -1) {
    // 如果已选中，取消选中
    selectedAssignees.value.splice(index, 1)
  } else {
    // 如果未选中，添加到选中列表
    selectedAssignees.value.push(assigneeName)
  }
}

// 当前年月显示
const currentYearMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${month}月`
})

// 生成月视图日期
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const prevMonthLastDay = new Date(year, month, 0)

  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 上月补充日期
  const firstDayWeek = firstDay.getDay()
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i)
    days.push({
      date,
      day: date.getDate(),
      isCurrentMonth: false,
      isToday: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      events: getEventsForDate(date)
    })
  }

  // 当月日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    const isToday = date.getTime() === today.getTime()
    days.push({
      date,
      day: i,
      isCurrentMonth: true,
      isToday,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      events: getEventsForDate(date)
    })
  }

  // 下月补充日期
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date,
      day: i,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      events: getEventsForDate(date)
    })
  }

  return days
})

// 生成月视图的连续事件显示数据
const monthEventBars = computed(() => {
  const bars = []
  const processedEvents = new Set()
  // 记录每个日历行每个事件行的占用情况 [calendarRow][eventRow] = 占用到的列位置
  const rowOccupancy = {}

  // 遍历每一天
  calendarDays.value.forEach((day, dayIndex) => {
    day.events.forEach(event => {
      const eventKey = `${event.id}-${formatDate(day.date)}`

      // 如果这个事件在这一天已经处理过，跳过
      if (processedEvents.has(eventKey)) return

      // 计算事件的开始日期在日历中的索引
      const eventStartDate = new Date(event.startDate)
      const eventEndDate = new Date(event.endDate)

      // 找到事件开始的日历格子索引
      let startIndex = -1
      for (let i = 0; i < calendarDays.value.length; i++) {
        const cellDate = formatDate(calendarDays.value[i].date)
        const eventStart = formatDate(eventStartDate)
        if (cellDate === eventStart) {
          startIndex = i
          break
        }
      }

      // 如果事件开始日期不在当前日历视图中，使用当前格子作为起点
      if (startIndex === -1) {
        startIndex = dayIndex
      }

      // 只在事件的第一天创建色块
      if (startIndex !== dayIndex) return

      // 计算跨越的天数
      let spanDays = 1
      let currentIndex = startIndex
      const calendarRow = Math.floor(startIndex / 7)
      const startCol = startIndex % 7

      // 计算这一行内的跨度
      while (currentIndex < calendarDays.value.length - 1) {
        const nextIndex = currentIndex + 1
        const nextDate = calendarDays.value[nextIndex].date
        const nextRow = Math.floor(nextIndex / 7)

        // 如果到了下一行，停止
        if (nextRow !== calendarRow) break

        // 如果下一天还在事件时间范围内，继续
        if (nextDate >= eventStartDate && nextDate <= eventEndDate) {
          spanDays++
          currentIndex++

          // 标记这些天已处理
          const nextEventKey = `${event.id}-${formatDate(nextDate)}`
          processedEvents.add(nextEventKey)
        } else {
          break
        }
      }

      // 初始化该日历行的占用记录
      if (!rowOccupancy[calendarRow]) {
        rowOccupancy[calendarRow] = []
      }

      // 找到第一个可用的事件行
      let eventRow = 0
      let foundRow = false
      while (!foundRow) {
        if (!rowOccupancy[calendarRow][eventRow]) {
          rowOccupancy[calendarRow][eventRow] = []
        }

        // 检查这个事件行在当前列范围是否被占用
        let canPlace = true
        for (let col = startCol; col < startCol + spanDays; col++) {
          if (rowOccupancy[calendarRow][eventRow][col]) {
            canPlace = false
            break
          }
        }

        if (canPlace) {
          foundRow = true
          // 标记占用
          for (let col = startCol; col < startCol + spanDays; col++) {
            rowOccupancy[calendarRow][eventRow][col] = true
          }
        } else {
          eventRow++
        }
      }

      bars.push({
        event,
        startIndex,
        spanDays,
        calendarRow,
        eventRow
      })

      processedEvents.add(eventKey)
    })
  })

  return bars
})

// 生成周视图日期
const weekViewDays = computed(() => {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentDay = currentDate.value.getDay()
  const monday = new Date(currentDate.value)
  monday.setDate(currentDate.value.getDate() - currentDay + 1)

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const isToday = date.getTime() === today.getTime()

    days.push({
      date,
      dayName: weekDays[date.getDay()],
      day: date.getDate(),
      isToday,
      events: getEventsForDate(date).filter(e => !e.allDay)
    })
  }

  return days
})

// 日视图事项
const dayViewEvents = computed(() => {
  return getEventsForDate(currentDate.value).filter(e => !e.allDay)
})

// 获取指定日期的事项
const getEventsForDate = (date) => {
  const dateStr = formatDate(date)
  return events.value.filter(event => {
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    const current = new Date(dateStr)
    return current >= start && current <= end
  })
}

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化小时
const formatHour = (hour) => {
  return `${String(hour).padStart(2, '0')}:00`
}

// 获取事项样式（周视图/日视图）
const getEventStyle = (event) => {
  if (event.allDay) return {}

  const [startHour, startMin] = event.startTime.split(':').map(Number)
  const [endHour, endMin] = event.endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  const duration = endMinutes - startMinutes

  return {
    top: `${(startMinutes / 60) * 60}px`,
    height: `${(duration / 60) * 60}px`
  }
}

// 回到今天
const goToToday = () => {
  currentDate.value = new Date()
  MessagePlugin.success('已回到今天')
}

// 上一个时间段
const prevPeriod = () => {
  const date = new Date(currentDate.value)
  if (viewMode.value === 'month') {
    date.setMonth(date.getMonth() - 1)
  } else if (viewMode.value === 'week') {
    date.setDate(date.getDate() - 7)
  } else {
    date.setDate(date.getDate() - 1)
  }
  currentDate.value = date
}

// 下一个时间段
const nextPeriod = () => {
  const date = new Date(currentDate.value)
  if (viewMode.value === 'month') {
    date.setMonth(date.getMonth() + 1)
  } else if (viewMode.value === 'week') {
    date.setDate(date.getDate() + 7)
  } else {
    date.setDate(date.getDate() + 1)
  }
  currentDate.value = date
}

// 点击事项
const handleEventClick = (event) => {
  currentEvent.value = event
  eventDetailVisible.value = true
}

// 处理编辑事项
const handleEditEvent = () => {
  // 复制当前事项数据到编辑对象
  editingEvent.value = {
    ...currentEvent.value,
    space: currentEvent.value.space || '项目A',
    type: currentEvent.value.type || '任务',
    progress: currentEvent.value.progress || 0,
    worklog: currentEvent.value.worklog || '',
    estimatedHours: currentEvent.value.estimatedHours || 0,
    actualHours: currentEvent.value.actualHours || 0,
    milestone: currentEvent.value.milestone || '',
    sprint: currentEvent.value.sprint || ''
  }
  // 关闭详情弹窗，打开编辑弹窗
  eventDetailVisible.value = false
  editEventVisible.value = true
  activeTab.value = 'basic'
}

// 保存编辑后的事项
const handleSaveEvent = () => {
  // TODO: 调用API保存数据
  MessagePlugin.success('保存成功')
  editEventVisible.value = false
  console.log('保存的事项数据：', editingEvent.value)
}

// 获取优先级主题
const getPriorityTheme = (priority) => {
  const themeMap = {
    '高': 'danger',
    '中': 'warning',
    '低': 'default'
  }
  return themeMap[priority] || 'default'
}

// 获取状态主题
const getStatusTheme = (status) => {
  const themeMap = {
    'completed': 'success',
    'in-progress': 'primary',
    'pending': 'default'
  }
  return themeMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'completed': '已完成',
    'in-progress': '进行中',
    'pending': '待处理'
  }
  return textMap[status] || status
}
</script>

<style scoped lang="scss">
.calendar-view {
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
      gap: 16px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2329;
      }

      .date-info {
        .current-month {
          font-size: 14px;
          font-weight: 500;
          color: #646a73;
        }
      }
    }

    .view-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .calendar-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    gap: 20px;
    padding: 20px 20px 20px 10px;
  }

  // 筛选侧边栏
  .filter-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: #fafafa;
    border-radius: 8px;
    padding: 16px;
    overflow-y: auto;

    .filter-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .filter-title {
        font-size: 13px;
        font-weight: 600;
        color: #1f2329;
        margin-bottom: 12px;
        padding-left: 4px;
      }

      .filter-options {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .filter-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          color: #646a73;

          &:hover {
            background: #e8e8e8;
          }

          .checkbox-wrapper {
            display: flex;
            align-items: center;

            .custom-checkbox {
              width: 16px;
              height: 16px;
              border-radius: 3px;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #ddd;
              background: #fff;
              transition: all 0.2s;

              &.colored {
                border: none;
              }

              &.checked {
                border-color: transparent;
              }

              .t-icon {
                color: #000;
              }
            }
          }

          span {
            flex: 1;
          }

          .count {
            flex: none;
            min-width: 24px;
            height: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #f0f0f0;
            border-radius: 10px;
            font-size: 12px;
            color: #646a73;
            padding: 0 6px;
          }
        }
      }
    }
  }

  // 日历主体
  .calendar-main {
    flex: 1;
    overflow: auto;
  }

  // 月视图
  .month-view {
    .week-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #fff;
      margin-bottom: 0;

      .week-day {
        padding: 12px;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
        color: #646a73;
      }
    }

    .days-grid-container {
      position: relative;
      border-left: 1px solid #e7e7e7;
      border-right: 1px solid #e7e7e7;
      border-bottom: 1px solid #e7e7e7;
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-template-rows: repeat(6, 1fr);
      min-height: 600px;

      .day-cell {
        border-right: 1px solid #e7e7e7;
        border-bottom: 1px solid #e7e7e7;
        padding: 8px;
        min-height: 100px;
        max-height: 120px;
        background: #fff;
        transition: background 0.2s;
        position: relative;
        z-index: 1;
        overflow-y: auto;
        overflow-x: hidden;

        &::-webkit-scrollbar {
          width: 4px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 2px;

          &:hover {
            background: #bbb;
          }
        }

        &:hover {
          background: #f5f7fa;
        }

        &.other-month {
          background: #fafafa;

          .day-number {
            color: #bbb;
          }
        }

        &.is-today {
          background: #e8f4ff;

          .day-number {
            background: #0052d9;
            color: #fff;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        }

        &.is-weekend {
          background: #fafafa;
        }

        .day-number {
          font-size: 14px;
          font-weight: 500;
          color: #1f2329;
          margin-bottom: 4px;
          position: sticky;
          top: 0;
          background: inherit;
          z-index: 1;
        }
      }
    }

    .event-bars-layer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-template-rows: repeat(6, 1fr);
      pointer-events: none;
      z-index: 2;

      .event-bar {
        position: absolute;
        left: 8px;
        right: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: all 0.2s;
        color: #333;
        border-left: 3px solid rgba(0, 0, 0, 0.3);
        pointer-events: auto;
        display: flex;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        align-items: center;
        gap: 4px;
        height: 24px;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          opacity: 0.9;
          z-index: 10;
        }

        .event-time {
          font-size: 11px;
          opacity: 0.8;
          flex-shrink: 0;
        }

        .event-title {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  // 周视图
  .week-view {
    .week-grid {
      display: flex;
      border: 1px solid #e7e7e7;
      min-height: 600px;

      .time-column {
        width: 60px;
        flex-shrink: 0;
        border-right: 1px solid #e7e7e7;

        .time-header {
          height: 60px;
          border-bottom: 1px solid #e7e7e7;
          background: #f5f5f5;
        }

        .time-slot {
          height: 60px;
          border-bottom: 1px solid #e7e7e7;
          padding: 4px 8px;
          font-size: 12px;
          color: #646a73;
          text-align: right;
        }
      }

      .day-column {
        flex: 1;
        border-right: 1px solid #e7e7e7;
        position: relative;

        &:last-child {
          border-right: none;
        }

        &.is-today {
          background: #f5f7fa;

          .day-header {
            background: #e8f4ff;

            .day-date {
              background: #0052d9;
              color: #fff;
            }
          }
        }

        .day-header {
          height: 60px;
          border-bottom: 1px solid #e7e7e7;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;

          .day-name {
            font-size: 12px;
            color: #646a73;
            margin-bottom: 4px;
          }

          .day-date {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            color: #1f2329;
          }
        }

        .day-schedule {
          position: relative;
          height: calc(24 * 60px);

          .schedule-event {
            position: absolute;
            left: 2px;
            right: 2px;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            overflow: hidden;
            border-left: 3px solid rgba(0, 0, 0, 0.3);
            transition: all 0.2s;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

            &:hover {
              transform: translateX(2px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
              opacity: 0.9;
            }

            .event-title {
              font-size: 13px;
              font-weight: 600;
              margin-bottom: 2px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              color: #333;
            }

            .event-time {
              font-size: 11px;
              color: rgba(0, 0, 0, 0.65);
            }
          }
        }
      }
    }
  }

  // 日视图
  .day-view {
    .day-schedule-container {
      display: flex;
      border: 1px solid #e7e7e7;
      min-height: 600px;

      .time-column {
        width: 80px;
        flex-shrink: 0;
        border-right: 1px solid #e7e7e7;

        .time-slot {
          height: 60px;
          border-bottom: 1px solid #e7e7e7;
          padding: 4px 12px;
          font-size: 13px;
          color: #646a73;
          text-align: right;
        }
      }

      .events-column {
        flex: 1;
        position: relative;
        height: calc(24 * 60px);

        .day-event {
          position: absolute;
          left: 8px;
          right: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          border-left: 4px solid rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

          &:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            opacity: 0.9;
          }

          .event-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
            color: #333;
          }

          .event-time {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.65);
            margin-bottom: 4px;
          }

          .event-location {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
          }
        }
      }
    }
  }

  // 事项详情
  .event-detail {
    .detail-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #646a73;
        margin-bottom: 8px;
      }

      .detail-value {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #1f2329;

        &.tags {
          flex-wrap: wrap;
        }

        &.participants {
          gap: 4px;
        }
      }
    }
  }

  // 编辑事项弹窗样式
  .edit-event-dialog {
    .event-top-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e7e7e7;
    }

    .event-tabs {
      .tab-content {
        padding: 16px 0;

        .t-form-item {
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }
        }

        .progress-value {
          margin-left: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #0052d9;
        }
      }
    }
  }
}
</style>
