<template>
  <div class="login-container">
    <!-- 主内容区 -->
    <div class="login-wrapper">
      <!-- 左侧海报区 -->
      <div class="login-banner">
        <div class="banner-content">
          <!-- 背景装饰 -->
          <div class="banner-bg">
            <div class="grid-lines"></div>
            <div class="floating-dots">
              <div class="dot dot-1"></div>
              <div class="dot dot-2"></div>
              <div class="dot dot-3"></div>
              <div class="dot dot-4"></div>
              <div class="dot dot-5"></div>
              <div class="dot dot-6"></div>
            </div>
            <div class="geometric-shapes">
              <div class="shape shape-circle"></div>
              <div class="shape shape-square"></div>
              <div class="shape shape-triangle"></div>
            </div>
          </div>

          <!-- 主要内容 -->
          <div class="banner-main">
            <!-- 顶部Logo区 -->
            <div class="logo-area">
              <div class="logo-wrapper">
                <div class="logo-bg"></div>
                <t-icon name="folder" size="40px" class="logo-icon" />
              </div>
              <div class="logo-text">
                <h1>需求管理平台</h1>
              </div>
            </div>

            <!-- 中间主视觉 -->
            <div class="main-visual">
              <div class="visual-cards-row">
                <div class="visual-card card-small">
                  <t-icon name="folder-open" size="24px" />
                  <div class="card-text">
                    <div class="card-title">数据管理</div>
                    <div class="card-desc">高效管理数据全生命周期</div>
                  </div>
                </div>
                <div class="visual-card card-small">
                  <t-icon name="usergroup-add" size="24px" />
                  <div class="card-text">
                    <div class="card-title">团队协作</div>
                    <div class="card-desc">实时沟通无缝对接</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 底部特性标签 -->
            <div class="feature-tags">
              <div class="feature-tag">
                <span class="tag-dot"></span>
                数据采集
              </div>
              <div class="feature-tag">
                <span class="tag-dot"></span>
                实时监控
              </div>
              <div class="feature-tag">
                <span class="tag-dot"></span>
                智能分析
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录区 -->
      <div class="login-panel">
        <div class="login-card">
        <!-- Tab切换 -->
        <t-tabs v-model="activeTab" class="login-tabs">
          <t-tab-panel value="account" label="账号登录">
            <t-form
              ref="loginFormRef"
              :data="loginForm"
              :rules="loginRules"
              class="login-form"
              label-width="0"
            >
              <t-form-item name="username">
                <t-input
                  v-model="loginForm.username"
                  placeholder="手机号 / 邮箱 / 用户名"
                  size="large"
                >
                  <template #prefix-icon>
                    <t-icon name="user" />
                  </template>
                </t-input>
              </t-form-item>

              <t-form-item name="password">
                <t-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  @keyup.enter="handleLogin"
                >
                  <template #prefix-icon>
                    <t-icon name="lock-on" />
                  </template>
                </t-input>
              </t-form-item>

              <div class="form-options">
                <t-checkbox v-model="loginForm.remember">7天内自动登录</t-checkbox>
                <t-link theme="primary" hover="color" size="small">忘记密码</t-link>
              </div>

              <t-button
                theme="primary"
                size="large"
                :loading="loading"
                block
                @click="handleLogin"
                class="login-btn"
              >
                登录
              </t-button>

              <div class="quick-register">
                没有账号？<t-link theme="primary" hover="color" @click="goToRegister">免费注册</t-link>
              </div>
            </t-form>
          </t-tab-panel>

          <t-tab-panel value="qrcode" label="扫码登录">
            <div class="qrcode-panel">
              <div class="qrcode-wrapper">
                <div class="qrcode-placeholder">
                  <t-icon name="qrcode" size="120px" />
                </div>
                <p class="qrcode-tip">请使用 <strong>微信扫一扫</strong> 登录</p>
                <p class="qrcode-desc">扫码后点击"确认"，即可完成登录</p>
              </div>
              <div class="qrcode-actions">
                <t-button theme="default" variant="text" size="small">
                  <t-icon name="refresh" />
                  刷新二维码
                </t-button>
              </div>
            </div>
          </t-tab-panel>

          <t-tab-panel value="sms" label="短信登录">
            <t-form
              ref="smsFormRef"
              :data="smsForm"
              class="login-form"
              label-width="0"
            >
              <t-form-item name="phone">
                <t-input
                  v-model="smsForm.phone"
                  placeholder="请输入手机号"
                  size="large"
                >
                  <template #prefix-icon>
                    <t-icon name="mobile" />
                  </template>
                </t-input>
              </t-form-item>

              <t-form-item name="code">
                <t-input
                  v-model="smsForm.code"
                  placeholder="请输入验证码"
                  size="large"
                >
                  <template #prefix-icon>
                    <t-icon name="mail" />
                  </template>
                  <template #suffix>
                    <t-button
                      theme="primary"
                      variant="text"
                      size="small"
                      :disabled="countdown > 0"
                      @click="sendSmsCode"
                    >
                      {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                    </t-button>
                  </template>
                </t-input>
              </t-form-item>

              <t-button
                theme="primary"
                size="large"
                block
                class="login-btn"
                @click="handleSmsLogin"
              >
                登录
              </t-button>
            </t-form>
          </t-tab-panel>
        </t-tabs>

        <!-- 底部链接 -->
        <div class="login-footer">
          <t-link theme="default" hover="color" size="small">帮助中心</t-link>
          <span class="separator">·</span>
          <t-link theme="default" hover="color" size="small">隐私政策</t-link>
          <span class="separator">·</span>
          <t-link theme="default" hover="color" size="small">用户协议</t-link>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useUserStore } from '@/store/user'

const router = useRouter()
const authStore = useUserStore()

const activeTab = ref('account')
const loginFormRef = ref(null)
const smsFormRef = ref(null)
const loading = ref(false)
const countdown = ref(0)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const smsForm = reactive({
  phone: '',
  code: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
      remember: loginForm.remember
    })

    MessagePlugin.success('登录成功')
    router.push('/workspace/todo')
  } catch (error) {
    MessagePlugin.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const handleSmsLogin = async () => {
  MessagePlugin.info('短信登录功能开发中')
}

const sendSmsCode = () => {
  if (!smsForm.phone) {
    MessagePlugin.warning('请输入手机号')
    return
  }

  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)

  MessagePlugin.success('验证码已发送')
}

const goToRegister = () => {
  MessagePlugin.info('注册功能开发中')
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  background: #f5f5f5;

  .login-wrapper {
    display: flex;
    width: 100%;
    height: 100vh;

    // 左侧海报区
    .login-banner {
      flex: 1;
      background: linear-gradient(135deg, #e8f4ff 0%, #d6ebff 50%, #c4e2ff 100%);
      position: relative;
      overflow: hidden;

      .banner-content {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 60px;

        .banner-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;

          // 网格线
          .grid-lines {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image:
              linear-gradient(rgba(0, 82, 217, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 82, 217, 0.08) 1px, transparent 1px);
            background-size: 40px 40px;
          }

          // 浮动点
          .floating-dots {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;

            .dot {
              position: absolute;
              width: 8px;
              height: 8px;
              background: rgba(0, 82, 217, 0.3);
              border-radius: 50%;
              animation: floatDot 4s ease-in-out infinite;

              &.dot-1 { top: 20%; left: 15%; animation-delay: 0s; }
              &.dot-2 { top: 45%; left: 25%; animation-delay: 0.5s; }
              &.dot-3 { top: 60%; left: 10%; animation-delay: 1s; }
              &.dot-4 { top: 30%; right: 20%; animation-delay: 1.5s; }
              &.dot-5 { top: 70%; right: 15%; animation-delay: 2s; }
              &.dot-6 { top: 85%; left: 45%; animation-delay: 2.5s; }
            }
          }

          // 几何形状
          .geometric-shapes {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;

            .shape {
              position: absolute;
              opacity: 0.15;

              &.shape-circle {
                width: 300px;
                height: 300px;
                border: 2px solid rgba(0, 82, 217, 0.3);
                border-radius: 50%;
                top: -100px;
                right: -100px;
                animation: rotate 30s linear infinite;
              }

              &.shape-square {
                width: 200px;
                height: 200px;
                border: 2px solid rgba(0, 82, 217, 0.3);
                bottom: 50px;
                left: -50px;
                transform: rotate(45deg);
                animation: rotate 25s linear infinite reverse;
              }

              &.shape-triangle {
                width: 0;
                height: 0;
                border-left: 80px solid transparent;
                border-right: 80px solid transparent;
                border-bottom: 140px solid rgba(0, 82, 217, 0.2);
                top: 40%;
                right: 10%;
                animation: float 20s ease-in-out infinite;
              }
            }
          }
        }

        .banner-main {
          position: relative;
          z-index: 1;
          max-width: 600px;
          margin: 0 auto;

          // Logo区域
          .logo-area {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 50px;

            .logo-wrapper {
              position: relative;
              width: 70px;
              height: 70px;
              display: flex;
              align-items: center;
              justify-content: center;

              .logo-bg {
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(0, 82, 217, 0.15);
                border-radius: 16px;
                backdrop-filter: blur(10px);
                transform: rotate(45deg);
                border: 1px solid rgba(0, 82, 217, 0.3);
              }

              .logo-icon {
                position: relative;
                color: #0052d9;
                z-index: 1;
              }
            }

            .logo-text {
              color: #0052d9;

              h1 {
                font-size: 28px;
                font-weight: 600;
                margin: 0 0 4px 0;
                letter-spacing: 1px;
              }

              p {
                font-size: 13px;
                opacity: 0.7;
                margin: 0;
                letter-spacing: 2px;
              }
            }
          }

          // 主视觉区域
          .main-visual {
            margin-bottom: 40px;

            .visual-card {
              background: rgba(255, 255, 255, 0.7);
              backdrop-filter: blur(20px);
              border-radius: 16px;
              border: 1px solid rgba(0, 82, 217, 0.2);
              color: #0052d9;
              transition: all 0.3s ease;

              &:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 40px rgba(0, 82, 217, 0.2);
                background: rgba(255, 255, 255, 0.85);
              }

              &.card-small {
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 16px;

                .t-icon {
                  flex-shrink: 0;
                  color: #0052d9;
                }

                .card-text {
                  .card-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: #0052d9;
                  }

                  .card-desc {
                    font-size: 13px;
                    opacity: 0.7;
                    color: #0052d9;
                  }
                }
              }
            }

            .visual-cards-row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
          }

          // 特性标签
          .feature-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;

            .feature-tag {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 16px;
              background: rgba(255, 255, 255, 0.7);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              border: 1px solid rgba(0, 82, 217, 0.2);
              color: #0052d9;
              font-size: 13px;
              transition: all 0.3s ease;

              &:hover {
                background: rgba(255, 255, 255, 0.85);
              }

              .tag-dot {
                width: 6px;
                height: 6px;
                background: #0052d9;
                border-radius: 50%;
                animation: pulse 2s ease-in-out infinite;
              }
            }
          }
        }
      }
    }

    // 右侧登录面板
    .login-panel {
      width: 520px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);

      .login-card {
        width: 100%;
        max-width: 400px;

      .login-tabs {
        :deep(.t-tabs__nav) {
          margin-bottom: 32px;
        }

        :deep(.t-tab-panel) {
          padding: 0;
        }
      }

        .login-form {
          :deep(.t-form__item) {
            margin-bottom: 20px;
          }

          :deep(.t-input) {
            border-radius: 4px;
            transition: all 0.3s ease;

            &:hover {
              border-color: #0052d9;
            }

            &.t-is-focused {
              border-color: #0052d9;
              box-shadow: 0 0 0 2px rgba(0, 82, 217, 0.1);
            }
          }

          .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          .login-btn {
            margin-bottom: 16px;
            font-weight: 500;
            height: 44px;
            background: #0052d9;
            border: none;
            transition: all 0.3s ease;

            &:hover {
              background: #0066ff;
              box-shadow: 0 4px 12px rgba(0, 82, 217, 0.3);
            }
          }

          .quick-register {
            text-align: center;
            font-size: 14px;
            color: #646a73;
          }
        }

        // 扫码登录面板
        .qrcode-panel {
          padding: 20px 0;

          .qrcode-wrapper {
            text-align: center;

            .qrcode-placeholder {
              width: 200px;
              height: 200px;
              margin: 0 auto 20px;
              background: #f5f7fa;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #bbb;
            }

            .qrcode-tip {
              font-size: 16px;
              color: #1f2329;
              margin-bottom: 8px;

              strong {
                color: #0052d9;
              }
            }

            .qrcode-desc {
              font-size: 13px;
              color: #8f959e;
              margin-bottom: 20px;
            }
          }

          .qrcode-actions {
            text-align: center;
          }
        }

        // 底部链接
        .login-footer {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e7e7e7;
          text-align: center;
          font-size: 13px;
          color: #666;

          .separator {
            margin: 0 8px;
            color: #d9d9d9;
          }

          :deep(.t-link) {
            color: #666;

            &:hover {
              color: #0052d9;
            }
          }
        }
      }
    }
  }

  // 响应式适配
  @media (max-width: 1024px) {
    .login-wrapper {
      flex-direction: column-reverse;

      .login-banner {
        height: 40vh;
        min-height: 300px;

        .banner-content {
          padding: 40px;

          .banner-main {
            .logo-area {
              margin-bottom: 30px;

              .logo-wrapper {
                width: 60px;
                height: 60px;
              }

              .logo-text h1 {
                font-size: 24px;
              }
            }

            .main-visual {
              margin-bottom: 20px;

              .visual-cards-row {
                grid-template-columns: 1fr;
                gap: 16px;
              }
            }

            .feature-tags {
              display: none;
            }
          }
        }
      }

      .login-panel {
        width: 100%;
        height: 60vh;
      }
    }
  }

  @media (max-width: 768px) {
    .login-wrapper {
      .login-banner {
        .banner-content {
          padding: 20px;

          .banner-main {
            .logo-area {
              .logo-text h1 {
                font-size: 20px;
              }

              .logo-text p {
                font-size: 11px;
              }
            }

            .main-visual {
              .visual-cards-row {
                grid-template-columns: 1fr;
                gap: 12px;
              }
            }
          }
        }
      }

      .login-panel {
        padding: 20px;
      }
    }
  }
}

// 动画定义
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@keyframes floatDot {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-20px);
    opacity: 0.8;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}
</style>
