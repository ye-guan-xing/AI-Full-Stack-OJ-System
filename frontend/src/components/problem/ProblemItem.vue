<!-- components/problem/ProblemItem.vue -->
<template>
  <div class="problem-item" @click="handleClick">
    <div class="problem-content">
      <div class="problem-header">
        <span class="problem-id">#{{ problem.id }}</span>
        <span class="problem-title">{{ problem.title }}</span>
      </div>
      <div class="problem-body">
        <div class="problem-description">
          {{ truncatedDescription }}
        </div>
        <div class="problem-footer">
          <div class="tags-container">
            <el-tag
              v-for="(tag, index) in parsedTags"
              :key="index"
              size="small"
              class="problem-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="problem-meta">
            <span class="test-points">
              <el-icon><DataLine /></el-icon>
              {{ problem.testPointNum }} 个测试点
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { DataLine } from "@element-plus/icons-vue";

const props = defineProps({
  problem: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

const emit = defineEmits(["click"]);

// 解析标签字符串
const parsedTags = computed(() => {
  if (!props.problem.label) return [];
  return props.problem.label
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);
});

// 截断描述文本
const truncatedDescription = computed(() => {
  const desc = props.problem.description || "";
  return desc.length > 120 ? desc.substring(0, 120) + "..." : desc;
});

const handleClick = () => {
  emit("click", props.problem);
};
</script>

<style scoped>
.problem-item {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.problem-item:hover {
  border-color: #165dff;
  box-shadow: 0 2px 12px rgba(22, 93, 255, 0.1);
  transform: translateY(-2px);
}

.problem-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.problem-id {
  color: #999;
  font-size: 14px;
  margin-right: 12px;
}

.problem-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.problem-body {
  display: flex;
  flex-direction: column;
}

.problem-description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
  min-height: 44px;
}

.problem-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.problem-tag {
  border-radius: 4px;
}

.test-points {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 13px;
}

.test-points .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .problem-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .problem-title {
    font-size: 16px;
  }
}
</style>
