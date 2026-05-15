<template>
  <div class="admin-problem-edit">
    <h2>{{ isEdit ? "编辑题目" : "创建题目" }}</h2>
    <ProblemForm
      ref="formRef"
      :initial-data="problemData"
      :is-edit="isEdit"
      @submit-success="handleSubmitSuccess"
    ></ProblemForm>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import ProblemForm from "@/components/admin/ProblemForm.vue";
import { problemAdminAPI } from "@/api/admin";

const router = useRouter();
const route = useRoute();
const formRef = ref(null);
const problemData = ref({});

// 根据路由params判断是否为编辑模式
const isEdit = computed(() => {
  const id = route.params.id;
  return !!id && !isNaN(Number(id));
});

const loadProblemDetail = async () => {
  if (!isEdit.value) return;
  try {
    const problemId = Number(route.params.id);

    if (!problemId) {
      ElMessage.error("无效的题目ID");
      router.push("/admin/problems");
      return;
    }

    // 调用API获取响应
    const res = await problemAdminAPI.getProblemById(problemId);

    // 提取题目数据
    let problem = null;
    if (res && res.code === 1 && res.data) {
      problem = res.data;
    } else if (res && (res.id !== undefined || res.title !== undefined)) {
      problem = res;
    } else if (res && res.data && (res.data.id !== undefined || res.data.title !== undefined)) {
      problem = res.data;
    } else if (!res || Object.keys(res).length === 0) {
      ElMessage.error("题目不存在或已被删除");
      router.push("/admin/problems");
      return;
    } else {
      problem = res;
    }

    // 判断题目数据是否有效
    if (!problem || (problem.id === undefined && problem.title === undefined)) {
      let errorMsg = "获取题目详情失败";
      if (res && (res.message || res.msg || res.error)) {
        errorMsg = res.message || res.msg || res.error;
      }
      ElMessage.error(errorMsg);
      router.push("/admin/problems");
      return;
    }

    try {
      const testPointList = await problemAdminAPI.getTestPointsByQuestionId(problemId);
      if (testPointList) {
        // 检查 testPointList 是否为对象且包含 data 属性
        if (typeof testPointList === 'object' && testPointList !== null && Array.isArray(testPointList.data)) {
          problem.testPointList = testPointList.data;
        } else if (Array.isArray(testPointList)) {
          problem.testPointList = testPointList;
        } else {
          // 如果不是预期格式，使用空数组
          problem.testPointList = [];
        }
      }
      console.log(problem.testPointList);
    } catch (err) {
      ElMessage.error(`获取测试点失败: ${err.message}`);
      problem.testPointList = []; // 出错时使用空数组
    }

    // 数据有效，正常赋值
    problemData.value = {
      ...problem,
      testPointList: Array.isArray(problem.testPointList) 
        ? problem.testPointList.map((item) => ({
            input: item.input || "",
            output: item.output || "",
            isSample: String(item.isSample || "1"),
          }))
        : [], // 如果不是数组，使用空数组
    };

    ElMessage.success("题目数据加载成功");
  } catch (err) {
    ElMessage.error(`网络错误: ${err.message}`);
    console.error("加载题目详情失败:", err);
    router.push("/admin/problems");
  }
};

// 页面挂载时执行加载
onMounted(() => {
  if (isEdit.value) {
    loadProblemDetail();
  }
});

// 监听路由变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadProblemDetail();
    }
  }
);

// 子组件提交成功后的回调
const handleSubmitSuccess = () => {
  ElMessage.success(isEdit.value ? "题目编辑成功" : "题目创建成功");
  router.push("/admin/problems");
};
</script>

<style scoped>
.admin-problem-edit {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 60px);
}

h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}
</style>
