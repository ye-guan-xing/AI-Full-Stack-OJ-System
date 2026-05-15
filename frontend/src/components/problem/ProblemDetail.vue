<!-- components/problem/ProblemDetail.vue -->
<template>
  <div class="problem-detail">
    <!-- 题目头部信息 -->
    <div class="problem-header">
      <h2 class="problem-title">{{ problem.title }}</h2>
      <div class="problem-meta">
        <span class="problem-id">ID: {{ problem.id }}</span>
        <ProblemTags :label="problem.label" :size="'small'" />
        <span class="test-point-count">
          <el-icon><DataLine /></el-icon>
          测试点数量: {{ problem.testPointNum }}
        </span>
      </div>
    </div>

    <!-- 题目详情内容 -->
    <div class="problem-content">
      <!-- 题目描述 -->
      <div class="section">
        <h3 class="section-title">题目描述</h3>
        <div class="description-box">
          <div v-html="formattedDescription" class="description-content"></div>
        </div>
      </div>

      <!-- 样例输入输出 -->
      <div class="section" v-if="sampleTestPoints.length > 0">
        <h3 class="section-title">样例输入输出</h3>
        <div class="sample-container">
          <div
            class="sample-item"
            v-for="(test, index) in sampleTestPoints"
            :key="index"
          >
            <div class="sample-block">
              <div class="sample-label">输入样例 {{ index + 1 }}:</div>
              <pre class="sample-code">{{ test.input }}</pre>
            </div>
            <div class="sample-block">
              <div class="sample-label">输出样例 {{ index + 1 }}:</div>
              <pre class="sample-code">{{ test.output }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义插槽（用于插入代码编辑器等） -->
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { DataLine } from "@element-plus/icons-vue";
import ProblemTags from "./ProblemTags.vue";

const props = defineProps({
  problem: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  testPoints: {
    type: Array,
    default: () => [],
  },
});

// 格式化题目描述
const formattedDescription = computed(() => {
  const desc = props.problem.description || "";
  return desc.replace(/\n/g, "<br>");
});

// 筛选样例测试点
const sampleTestPoints = computed(() => {
  return props.testPoints.filter((item) => item.isSample === 1);
});
</script>

<style scoped>
.problem-detail {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.problem-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 24px;
}

.problem-title {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.problem-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 14px;
  color: #666;
  flex-wrap: wrap;
}

.problem-id {
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.test-point-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.section {
  margin: 30px 0;
}

.section-title {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  border-left: 4px solid #165dff;
  padding-left: 12px;
}

.description-box {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eaeaea;
  line-height: 1.8;
}

.description-content {
  font-size: 15px;
  color: #333;
}

.sample-container {
  margin-top: 10px;
}

.sample-item {
  margin-bottom: 25px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eaeaea;
}

.sample-block {
  margin-bottom: 16px;
}

.sample-block:last-child {
  margin-bottom: 0;
}

.sample-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 15px;
}

.sample-code {
  margin: 0;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

@media (max-width: 768px) {
  .problem-detail {
    padding: 16px;
  }

  .problem-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .section {
    margin: 24px 0;
  }

  .description-box {
    padding: 16px;
  }
}
</style>
