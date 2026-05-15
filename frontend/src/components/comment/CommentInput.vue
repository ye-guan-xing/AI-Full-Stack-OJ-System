<template>
  <div class="comment-input-area">
    <div class="input-header">
      <span v-if="replyTo">回复 @{{ replyTo.userName }}</span>
      <span v-else>发表评论</span>
      <span class="cancel-reply" v-if="replyTo" @click="$emit('cancel-reply')">取消</span>
    </div>
    
    <div class="editor-wrapper">
      <el-input
        v-model="content"
        type="textarea"
        :rows="4"
        placeholder="写下你的想法，支持 Markdown..."
        :maxlength="1000"
        show-word-limit
        @keydown.ctrl.enter="handleSubmit"
      />
      <div class="editor-actions">
        <el-button 
          type="primary" 
          :loading="submitting" 
          :disabled="!content.trim()"
          @click="handleSubmit"
        >
          发布
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  replyTo: {
    type: Object,
    default: null
  },
  submitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel-reply']);

const content = ref('');

const handleSubmit = () => {
  if (!content.value.trim()) return;
  emit('submit', content.value);
  content.value = '';
};
</script>

<style scoped>
.comment-input-area {
  padding: 16px;
  background: #fff;
  border-top: 1px solid #eee;
}

.input-header {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  display: flex;
  justify-content: space-between;
}

.cancel-reply {
  color: #409eff;
  cursor: pointer;
}

.editor-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
