<!-- @/components/submission/JudgeResult.vue -->
<template>
  <div class="judge-result">
    <!-- 判题状态提示 -->
    <el-alert
      v-if="resultStatus === 'AC'"
      title="通过"
      type="success"
      :description="`通过所有测试点 (${passCount}/${totalCount})`"
      show-icon
      :closable="false"
    />
    <el-alert
      v-else-if="resultStatus === 'WA'"
      title="答案错误"
      type="error"
      :description="`通过 ${passCount}/${totalCount} 个测试点`"
      show-icon
      :closable="false"
    />
    <el-alert
      v-else-if="resultStatus === 'CE'"
      title="编译错误"
      type="warning"
      :description="compileError || '编译失败，请检查代码语法'"
      show-icon
      :closable="false"
    />
    <el-alert
      v-else-if="resultStatus === 'pending' || resultStatus === 'judging'"
      title="判题中"
      type="info"
      description="正在判题，请稍候..."
      show-icon
      :closable="false"
    />
    <el-alert
      v-else-if="resultStatus === 'error'"
      title="判题错误"
      type="error"
      :description="errorMessage"
      show-icon
      :closable="false"
    />
    <el-alert
      v-else
      title="未知状态"
      type="warning"
      :description="resultStatus"
      show-icon
      :closable="false"
    />

    <!-- 详细的测试点结果 -->
    <div v-if="showDetailedResults" class="test-points-details">
      <div class="section-header">
        <h3>测试点详情</h3>
        <div class="summary">
          <span class="summary-item">
            <el-icon><CircleCheck /></el-icon>
            通过: {{ passCount }}
          </span>
          <span class="summary-item">
            <el-icon><CloseBold /></el-icon>
            失败: {{ totalCount - passCount }}
          </span>
          <span class="summary-item">
            <el-icon><DataLine /></el-icon>
            总数: {{ totalCount }}
          </span>
          <span v-if="score !== undefined" class="summary-item">
            <el-icon><Star /></el-icon>
            得分: {{ score }}
          </span>
        </div>
      </div>

      <div class="test-points-list">
        <div
          v-for="(test, index) in detailedResults"
          :key="index"
          class="test-point-item"
          :class="getTestPointClass(test)"
        >
          <div class="test-point-header">
            <span class="test-point-index">测试点 {{ index + 1 }}</span>
            <el-tag
              :type="getTagType(test.value)"
              size="small"
              class="status-tag"
            >
              {{ getStatusText(test.value) }}
            </el-tag>
          </div>
          <div v-if="test.message" class="test-point-message">
            {{ test.message }}
          </div>
          <div v-if="test.timeCost !== undefined" class="test-point-metrics">
            <span class="metric">
              <el-icon><Timer /></el-icon>
              时间: {{ test.timeCost }}ms
            </span>
            <span class="metric">
              <el-icon><Cpu /></el-icon>
              内存: {{ test.memoryCost }}KB
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 单个结果的情况 -->
    <div v-if="singleResult && !showDetailedResults" class="single-result">
      <div class="single-result-content">
        <el-tag
          :type="getTagType(singleResult.value)"
          size="medium"
          class="single-result-tag"
        >
          {{ getStatusText(singleResult.value) }}
        </el-tag>
        <div class="single-result-message">
          {{ singleResult.message || singleResult.value }}
        </div>
      </div>
    </div>

    <!-- 简单信息 -->
    <div v-if="showSimpleInfo" class="simple-info">
      <p v-if="result.id">提交ID: {{ result.id }}</p>
      <p v-else>提交ID: (未知)</p>
      <p v-if="result.timeCost !== undefined">耗时: {{ result.timeCost }}ms</p>
      <p v-if="result.memoryCost !== undefined">
        内存: {{ result.memoryCost }}KB
      </p>
      <p v-if="result.createdTime">
        提交时间: {{ formatTime(result.createdTime) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  CircleCheck,
  CloseBold,
  DataLine,
  Star,
  Timer,
  Cpu,
} from "@element-plus/icons-vue";

const props = defineProps({
  result: {
    type: Object,
    default: () => ({}),
  },
});

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return "未知";
  const date = new Date(timestamp);
  return date.toLocaleString("zh-CN");
};

// 获取标签类型
const getTagType = (value) => {
  switch (value) {
    case "AC":
      return "success";
    case "WA":
      return "danger";
    case "TLE":
      return "warning";
    case "MLE":
      return "warning";
    case "RE":
      return "warning";
    case "CE":
      return "warning";
    case "PE":
      return "info";
    default:
      return "info";
  }
};

// 获取状态文本
const getStatusText = (value) => {
  const statusMap = {
    AC: "通过",
    WA: "答案错误",
    TLE: "时间超限",
    MLE: "内存超限",
    RE: "运行错误",
    CE: "编译错误",
    PE: "格式错误",
  };
  return statusMap[value] || value || "未知状态";
};

// 获取测试点CSS类
const getTestPointClass = (test) => {
  return {
    "test-point-pass": test.value === "AC",
    "test-point-fail": test.value !== "AC" && test.value !== undefined,
  };
};

// 判断是否显示详细结果
const showDetailedResults = computed(() => {
  return (
    detailedResults.value &&
    detailedResults.value.length > 0 &&
    (detailedResults.value.length > 1 ||
      detailedResults.value[0].value !== undefined)
  );
});

// 是否显示简单信息
const showSimpleInfo = computed(() => {
  return props.result && Object.keys(props.result).length > 0;
});

// 单个结果的情况
const singleResult = computed(() => {
  if (
    props.result &&
    props.result.questionResultList &&
    Array.isArray(props.result.questionResultList) &&
    props.result.questionResultList.length === 1
  ) {
    return props.result.questionResultList[0];
  }
  return null;
});

// 编译错误信息
const compileError = computed(() => {
  if (props.result && props.result.compileError) {
    return props.result.compileError;
  }
  if (singleResult.value && singleResult.value.compileError) {
    return singleResult.value.compileError;
  }
  return null;
});

// 错误消息
const errorMessage = computed(() => {
  if (props.result && props.result.message) {
    return props.result.message;
  }
  return "判题过程中发生错误";
});
// 计算通过数量
const passCount = computed(() => {
  if (!props.result) return 0;

  // 处理 questionResultList
  if (
    props.result.questionResultList &&
    Array.isArray(props.result.questionResultList)
  ) {
    return props.result.questionResultList.filter((item) => item.value === "AC")
      .length;
  }

  // 处理 testPoints
  if (props.result.testPoints && Array.isArray(props.result.testPoints)) {
    return props.result.testPoints.filter(
      (test) => test.status === 2 || test.value === "AC"
    ).length;
  }

  return 0;
});

// 计算总数
const totalCount = computed(() => {
  if (!props.result) return 0;

  if (
    props.result.questionResultList &&
    Array.isArray(props.result.questionResultList)
  ) {
    return props.result.questionResultList.length;
  }

  if (props.result.testPoints && Array.isArray(props.result.testPoints)) {
    return props.result.testPoints.length;
  }

  // 单个测试点的情况
  if (singleResult.value) {
    return 1;
  }

  return 0;
});

// 计算得分
const score = computed(() => {
  if (props.result && props.result.score !== undefined) {
    return props.result.score;
  }

  if (totalCount.value > 0) {
    // 计算得分：每个测试点100分
    return Math.round(
      (passCount.value / totalCount.value) * 100 * totalCount.value
    );
  }

  return 0;
});

// 判断整体状态
const resultStatus = computed(() => {
  if (!props.result) return "pending";

  // 如果有状态字段，直接使用
  if (props.result.status) {
    return props.result.status;
  }

  // 如果有 questionResultList
  if (props.result.questionResultList) {
    if (Array.isArray(props.result.questionResultList)) {
      if (props.result.questionResultList.length === 0) {
        return "pending";
      }

      // 检查是否有编译错误
      const hasCompileError = props.result.questionResultList.some(
        (item) => item.value === "CE"
      );
      if (hasCompileError) return "CE";

      // 检查是否全部通过
      const allAC = props.result.questionResultList.every(
        (item) => item.value === "AC"
      );
      return allAC ? "AC" : "WA";
    }
  }

  // 单个结果
  if (singleResult.value) {
    return singleResult.value.value || "pending";
  }

  // 默认状态
  return "pending";
});

// 详细的测试点结果
const detailedResults = computed(() => {
  if (!props.result) return [];

  // 处理 questionResultList
  if (
    props.result.questionResultList &&
    Array.isArray(props.result.questionResultList)
  ) {
    return props.result.questionResultList.map((item, index) => ({
      index: index + 1,
      value: item.value || "未知",
      message: item.message || getStatusText(item.value),
      timeCost: item.timeCost,
      memoryCost: item.memoryCost,
      compileError: item.compileError,
    }));
  }

  // 处理 testPoints
  if (props.result.testPoints && Array.isArray(props.result.testPoints)) {
    return props.result.testPoints.map((test, index) => ({
      index: index + 1,
      value: test.value || (test.status === 2 ? "AC" : "WA"),
      message: test.message || `测试点 ${index + 1}`,
      timeCost: test.timeCost,
      memoryCost: test.memoryCost,
    }));
  }

  return [];
});
</script>

<style scoped>
.judge-result {
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.summary {
  display: flex;
  gap: 16px;
  align-items: center;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.test-points-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.test-point-item {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e6e6e6;
  background: #fff;
  transition: all 0.2s ease;
}

.test-point-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.test-point-pass {
  border-left: 4px solid #52c41a;
  background-color: rgba(82, 196, 26, 0.05);
}

.test-point-fail {
  border-left: 4px solid #f5222d;
  background-color: rgba(245, 34, 45, 0.05);
}

.test-point-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.test-point-index {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.status-tag {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.test-point-message {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.test-point-metrics {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #888;
}

.metric {
  display: flex;
  align-items: center;
  gap: 4px;
}

.single-result {
  margin-top: 20px;
}

.single-result-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e6e6e6;
}

.single-result-tag {
  min-width: 80px;
  justify-content: center;
  font-weight: 600;
}

.single-result-message {
  flex: 1;
  color: #333;
  font-size: 14px;
}

.simple-info {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e6e6e6;
}

.simple-info p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.simple-info p:first-child {
  margin-top: 0;
}

.simple-info p:last-child {
  margin-bottom: 0;
}

.el-alert {
  margin-bottom: 20px;
}
</style>
