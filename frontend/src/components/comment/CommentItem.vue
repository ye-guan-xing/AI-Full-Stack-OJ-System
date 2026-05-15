<template>
  <div class="comment-item">
    <div class="user-avatar">
      <el-avatar :size="40" :src="comment.userAvatar">{{
        comment.userName?.charAt(0)?.toUpperCase()
      }}</el-avatar>
    </div>
    <div class="comment-content-wrapper">
      <div class="comment-header">
        <span class="username">{{ comment.userName }}</span>
        <span class="time">{{ formatTime(comment.createTime) }}</span>
      </div>
      
      <div class="comment-body markdown-body" v-html="renderedContent"></div>
      
      <div class="comment-actions">
        <span 
          class="action-item" 
          :class="{ active: comment.isLiked }"
          @click="toggleLike"
        >
          <el-icon><Pointer /></el-icon>
          {{ comment.likeCount || 0 }}
        </span>
        <span class="action-item" @click="$emit('reply', comment)">
          <el-icon><ChatLineRound /></el-icon>
          回复
        </span>
        <span 
          v-if="isOwner" 
          class="action-item delete" 
          @click="$emit('delete', comment.id)"
        >
          <el-icon><Delete /></el-icon>
          删除
        </span>
      </div>

      <!-- 子评论渲染 -->
      <div v-if="comment.childComments && comment.childComments.length > 0" class="child-comments">
        <CommentItem 
          v-for="child in comment.childComments" 
          :key="child.id" 
          :comment="child"
          :current-user-id="currentUserId"
          @reply="$emit('reply', $event)"
          @delete="$emit('delete', $event)"
          @like-change="$emit('like-change', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Pointer, ChatLineRound, Delete } from '@element-plus/icons-vue';
import MarkdownIt from 'markdown-it';
// import hljs from 'highlight.js'; // 如果需要代码高亮
// import 'highlight.js/styles/github.css';

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  currentUserId: {
    type: [String, Number],
    default: ''
  }
});

const emit = defineEmits(['reply', 'delete', 'like-change']);

// Markdown 渲染配置
const md = new MarkdownIt({
  html: false, // 禁用HTML标签以防XSS
  linkify: true,
  typographer: true,
  breaks: true
});

const renderedContent = computed(() => {
  return md.render(props.comment.content || '');
});

const isOwner = computed(() => {
  return String(props.comment.userId) === String(props.currentUserId);
});

const formatTime = (time) => {
  if (!time) return '';
  // 简单的时间格式化，可替换为 dayjs
  return new Date(time).toLocaleString();
};

const toggleLike = () => {
  emit('like-change', {
    commentId: props.comment.id,
    isLiked: !props.comment.isLiked
  });
};
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-content-wrapper {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.username {
  font-weight: 600;
  color: #333;
}

.time {
  font-size: 12px;
  color: #999;
}

.comment-body {
  font-size: 14px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 12px;
}

.comment-actions {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #666;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.2s;
}

.action-item:hover {
  color: #409eff;
}

.action-item.active {
  color: #409eff;
}

.action-item.delete:hover {
  color: #f56c6c;
}

.child-comments {
  margin-top: 16px;
  background: #f9f9f9;
  padding: 0 16px;
  border-radius: 4px;
}

/* 递归组件样式调整 */
.child-comments .comment-item {
  border-bottom: 1px solid #e0e0e0;
}
.child-comments .comment-item:last-child {
  border-bottom: none;
}
</style>
