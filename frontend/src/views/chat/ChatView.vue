<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="header-title">
        <el-icon class="ai-icon"><ChatDotRound /></el-icon>
        <h2>AI 助手</h2>
      </div>
      <el-button
        @click="clearChat"
        type="danger"
        plain
        size="small"
        :icon="Delete"
      >
        清空对话
      </el-button>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="welcome-message">
        <el-icon class="welcome-icon"><ChatDotRound /></el-icon>
        <h3>你好，我是 AI 助手</h3>
        <p>我可以帮你推荐题目、解答编程问题，有什么可以帮你的吗？</p>
        <div class="quick-actions">
          <el-button
            v-for="action in quickActions"
            :key="action"
            @click="sendQuickMessage(action)"
            round
            size="small"
          >
            {{ action }}
          </el-button>
        </div>
      </div>

      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.role]"
      >
        <div class="message-avatar">
          <el-avatar
            v-if="message.role === 'user'"
            :size="36"
            class="user-avatar"
          >
            {{ userInitial }}
          </el-avatar>
          <el-avatar v-else :size="36" class="ai-avatar">
            <el-icon><ChatDotRound /></el-icon>
          </el-avatar>
        </div>
        <div class="message-content">
          <div
            class="message-text"
            v-html="formatMessage(message.content)"
          ></div>
        </div>
      </div>

      <div v-if="loading" class="message assistant">
        <div class="message-avatar">
          <el-avatar :size="36" class="ai-avatar">
            <el-icon><ChatDotRound /></el-icon>
          </el-avatar>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="2"
        placeholder="输入你的问题..."
        @keydown.enter.exact.prevent="sendMessage"
        :disabled="loading"
      />
      <el-button
        type="primary"
        @click="sendMessage"
        :loading="loading"
        :disabled="!inputText.trim()"
        class="send-btn"
      >
        <el-icon><Promotion /></el-icon>
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { ChatDotRound, Promotion, Delete } from "@element-plus/icons-vue";
import { chatApi } from "@/api/chat";

const store = useStore();

const messages = ref([]);
const inputText = ref("");
const loading = ref(false);
const sessionId = ref(null);
const messagesContainer = ref(null);

const quickActions = [
  "请帮我推荐一道题",
  "我该如何提高编程能力？",
  "解释一下双指针算法",
];

const currentUserId = computed(() => store.state.user.userInfo?.id || "1");
const userInitial = computed(() => {
  const username = store.state.user.userInfo?.username || "U";
  return username.charAt(0).toUpperCase();
});

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const formatMessage = (content) => {
  if (!content) return "";
  return content
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/### (.*?)(<br>|$)/g, "<h4>$1</h4>")
    .replace(/- (.*?)(<br>|$)/g, "<li>$1</li>");
};

const sendMessage = async () => {
  const text = inputText.value.trim();
  if (!text || loading.value) return;

  messages.value.push({
    role: "user",
    content: text,
  });

  inputText.value = "";
  scrollToBottom();

  loading.value = true;

  try {
    const requestData = {
      user_id: String(currentUserId.value),
      text: text,
    };

    if (sessionId.value) {
      requestData.session_id = sessionId.value;
    }

    const response = await chatApi.sendMessage(requestData);

    if (response.code === 1) {
      sessionId.value = response.data.session_id;
      messages.value.push({
        role: "assistant",
        content: response.data.reply,
      });
    } else {
      ElMessage.error(response.msg || "发送失败");
      messages.value.push({
        role: "assistant",
        content: "抱歉，出现了一些问题，请稍后重试。",
      });
    }
  } catch (error) {
    console.error("Chat error:", error);
    ElMessage.error("网络错误，请稍后重试");
    messages.value.push({
      role: "assistant",
      content: "抱歉，网络连接出现问题，请稍后重试。",
    });
  } finally {
    loading.value = false;
    scrollToBottom();
  }
};

const sendQuickMessage = (text) => {
  inputText.value = text;
  sendMessage();
};

const clearChat = () => {
  messages.value = [];
  sessionId.value = null;
  ElMessage.success("对话已清空");
};

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.ai-icon {
  font-size: 28px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
}

.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #666;
}

.welcome-icon {
  font-size: 64px;
  color: #667eea;
  margin-bottom: 16px;
}

.welcome-message h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.welcome-message p {
  font-size: 14px;
  margin-bottom: 24px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.quick-actions .el-button {
  background: #fff;
  border-color: #667eea;
  color: #667eea;
}

.quick-actions .el-button:hover {
  background: #667eea;
  color: #fff;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.user-avatar {
  background: #667eea;
  color: #fff;
  font-weight: 600;
}

.ai-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.message-content {
  max-width: 70%;
}

.message-text {
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.6;
  font-size: 14px;
}

.message.user .message-text {
  background: #667eea;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-text {
  background: #fff;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-text :deep(h4) {
  margin: 12px 0 8px;
  font-size: 15px;
  color: #333;
}

.message-text :deep(li) {
  margin: 4px 0 4px 20px;
}

.message-text :deep(strong) {
  color: #667eea;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.chat-input-area {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #eee;
}

.chat-input-area :deep(.el-textarea) {
  flex: 1;
}

.chat-input-area :deep(.el-textarea__inner) {
  border-radius: 12px;
  resize: none;
  border-color: #ddd;
}

.chat-input-area :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
}

.send-btn {
  align-self: flex-end;
  height: 54px;
  padding: 0 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.send-btn:hover {
  opacity: 0.9;
}

.send-btn:disabled {
  opacity: 0.6;
}

@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 80px);
    border-radius: 0;
  }

  .message-content {
    max-width: 85%;
  }

  .chat-input-area {
    padding: 12px;
  }
}
</style>
