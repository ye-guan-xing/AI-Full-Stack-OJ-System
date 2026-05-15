<template>
  <div class="comment-list-container">
    <div v-if="loading" class="loading-wrapper">
      <el-skeleton :rows="3" animated />
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="!comments.length" class="empty-wrapper">
      <el-empty description="暂无评论，快来抢沙发！" />
    </div>

    <div v-else class="comment-items">
      <CommentItem
        v-for="item in comments"
        :key="item.id"
        :comment="item"
        :current-user-id="currentUserId"
        @reply="handleReply"
        @delete="handleDelete"
        @like-change="handleLikeChange"
      />
    </div>

    <div v-if="hasMore" class="load-more" @click="$emit('load-more')">
      <span v-if="loadingMore">加载中...</span>
      <span v-else>加载更多</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import CommentItem from './CommentItem.vue';
import { ElSkeleton, ElEmpty } from 'element-plus';

const props = defineProps({
  comments: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingMore: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: false
  },
  currentUserId: {
    type: [String, Number],
    default: ''
  }
});

const emit = defineEmits(['reply', 'delete', 'like-change', 'load-more']);

const handleReply = (comment) => emit('reply', comment);
const handleDelete = (commentId) => emit('delete', commentId);
const handleLikeChange = (data) => emit('like-change', data);
</script>

<style scoped>
.comment-list-container {
  padding: 16px;
  min-height: 200px;
}

.loading-wrapper {
  padding: 20px 0;
}

.empty-wrapper {
  padding: 40px 0;
  text-align: center;
}

.load-more {
  text-align: center;
  padding: 16px;
  color: #409eff;
  cursor: pointer;
  transition: color 0.2s;
}

.load-more:hover {
  color: #66b1ff;
}
</style>
