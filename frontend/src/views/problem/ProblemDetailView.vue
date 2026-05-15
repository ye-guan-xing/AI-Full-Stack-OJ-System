<template>
  <div class="problem-detail-page">
    <div class="page-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 题目详情 -->
      <div v-else class="problem-detail-wrapper">
        <ProblemDetail :problem="problem" :test-points="testPoints" />

        <!-- 代码提交区域 -->
        <div v-if="showCodeEditor && problem.id" class="submission-section">
          <h3 class="section-title">提交解答</h3>
          <CodeEditor
            ref="codeEditor"
            :problem-id="problem.id"
            :user-id="currentUserId"
            @submit-success="handleSubmitSuccess"
            @submit-fail="handleSubmitFail"
            class="code-editor-container"
          />
        </div>

        <!-- 判题结果展示 -->
        <div v-if="submissionResult" class="judge-result-section">
          <h3 class="section-title">判题结果</h3>
          <JudgeResult :result="submissionResult" />
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="default" @click="goBack" :icon="ArrowLeft">
            返回列表
          </el-button>
          <el-button
            type="primary"
            v-if="problem.id && showCodeEditor"
            @click="scrollToEditor"
            :icon="Edit"
          >
            开始答题
          </el-button>
          
          <el-button
            type="success"
            v-if="problem.id"
            @click="goToComments"
            :icon="ChatLineRound"
          >
            查看评论
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft, Edit, ChatLineRound } from "@element-plus/icons-vue";
import { problemApi } from "@/api/problem";
import { useStore } from "vuex";

// 导入组件
import ProblemDetail from "@/components/problem/ProblemDetail.vue";
import CodeEditor from "@/components/submission/CodeEditor.vue";
import JudgeResult from "@/components/submission/JudgeResult.vue";

const store = useStore();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const problem = ref({});
const testPoints = ref([]);
const submissionResult = ref(null);
const codeEditor = ref(null);
const showCodeEditor = ref(true);

// 当前登录用户ID
const currentUserId = computed(() => store.getters["user/userInfo"]?.id || "1");

// 获取题目详情
const fetchProblemDetail = async () => {
  loading.value = true;
  try {
    const problemId = route.params.id;
    if (!problemId) {
      ElMessage.error("无效的题目ID");
      goBack();
      return;
    }

    // 并发获取题目详情和测试点
    const [detailRes, testPointsRes] = await Promise.all([
      problemApi.getProblemDetail(problemId),
      problemApi.getTestPointsByQuestionId(problemId),
    ]);

    // 处理题目基本信息
    if (detailRes?.code === 1 && detailRes.data) {
      problem.value = detailRes.data;
    } else if (detailRes?.code === 1 && !detailRes.data) {
      problem.value = detailRes;
    } else if (detailRes?.id) {
      problem.value = detailRes;
    } else {
      throw new Error("获取题目详情失败");
    }

    // 处理测试点数据
    if (testPointsRes?.code === 1 && Array.isArray(testPointsRes.data)) {
      testPoints.value = testPointsRes.data;
      // 更新测试点数量
      if (!problem.value.testPointNum) {
        problem.value.testPointNum = testPointsRes.data.length;
      }
    }

    // 确保题目ID存在
    if (!problem.value.id) {
      problem.value.id = problemId;
    }
  } catch (error) {
    console.error("获取题目详情错误:", error);
    // request.js 已处理错误提示，此处只处理未被拦截的错误
    if (!error.message?.includes("题目不存在")) {
       // 如果是其他未知错误，可以考虑提示，但通常request.js已覆盖
    }
    goBack();
  } finally {
    loading.value = false;
  }
};

const handleSubmitSuccess = (result) => {
  // 处理不同的结果格式
  let data = result;
  if (result && typeof result === "object") {
    if (result.code === 1 && result.data) {
      data = result.data;
    } else if (result.id !== undefined || result.questionResultList !== undefined) {
      data = result;
    }
  }
  
  submissionResult.value = data;

  // 确保数据结构正确
  if (submissionResult.value) {
    // 确保有 id
    if (!submissionResult.value.id) {
      submissionResult.value.id = `temp_${Date.now()}`;
    }
    
    // 标准化 questionResultList
    if (!Array.isArray(submissionResult.value.questionResultList)) {
        if (submissionResult.value.questionResultList) {
            submissionResult.value.questionResultList = [submissionResult.value.questionResultList];
        } else if (submissionResult.value.testPoints) {
            // 尝试从 testPoints 转换
            submissionResult.value.questionResultList = submissionResult.value.testPoints.map((test) => ({
                value: test.status === 2 ? "AC" : "WA",
                message: test.message,
            }));
        } else {
            submissionResult.value.questionResultList = [];
        }
    }
  }
  
  // 显示消息
  if (submissionResult.value?.questionResultList) {
    const totalCount = submissionResult.value.questionResultList.length;
    const passCount = submissionResult.value.questionResultList.filter(
      (item) => item.value === "AC"
    ).length;
    
    if (totalCount === 0) {
      ElMessage.warning("暂无判题结果");
    } else if (passCount === totalCount) {
      ElMessage.success(`恭喜！通过所有 ${totalCount} 个测试点`);
    } else if (passCount === 0) {
      ElMessage.error(`未通过任何测试点 (0/${totalCount})`);
    } else {
      ElMessage.warning(`通过 ${passCount}/${totalCount} 个测试点`);
    }
  } else {
    ElMessage.success("代码提交成功！");
  }
};

// 处理提交失败
const handleSubmitFail = (message) => {
  console.error("提交失败:", message);
  ElMessage.error(message);
};

// 返回题目列表
const goBack = () => {
  router.push("/problems");
};

// 滚动到代码编辑器
const scrollToEditor = () => {
  const editorElement = document.querySelector(".submission-section");
  if (editorElement) {
    editorElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

// 跳转到评论页面
const goToComments = () => {
  router.push(`/problems/${problem.value.id}/comments`);
};

// 页面加载时获取题目详情
onMounted(() => {
  fetchProblemDetail();
});

// 监控路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchProblemDetail();
      submissionResult.value = null; // 清空之前的判题结果
    }
  }
);
</script>

<style scoped>
.problem-detail-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
}

.problem-detail-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.submission-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.judge-result-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  border-left: 4px solid #165dff;
  padding-left: 12px;
}

.code-editor-container {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
}

.action-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eaeaea;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .problem-detail-page {
    padding: 16px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>