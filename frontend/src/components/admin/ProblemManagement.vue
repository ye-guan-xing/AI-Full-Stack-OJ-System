<template>
  <div class="problem-management">
    <!-- 顶部操作栏 -->
    <div class="header">
      <el-input
        v-model="searchKeyword"
        placeholder="输入题目名称/标签搜索"
        style="width: 300px"
        @keyup.enter="fetchProblems"
        clearable
      />
      <el-button type="primary" @click="fetchProblems" style="margin-left: 10px"
        >搜索</el-button
      >
      <el-button type="success" @click="goToAdd" style="margin-left: 10px"
        >新增题目</el-button
      >
    </div>

    <!-- 题目列表 -->
    <el-table
      v-loading="loading"
      :data="problemList"
      border
      stripe
      style="width: 100%; margin-top: 20px"
      @row-click="(row) => goToEdit(row)"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="title" label="题目名称" min-width="200" />
      <el-table-column prop="label" label="标签" min-width="180" />
      <el-table-column
        prop="testPointNum"
        label="测试点数量"
        width="120"
        align="center"
      />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click.stop="goToEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click.stop="handleDelete(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.pageNum"
      v-model:page-size="pagination.size"
      :page-sizes="[5, 10, 20]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; text-align: right"
      @size-change="fetchProblems"
      @current-change="fetchProblems"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { problemAdminAPI } from "@/api/admin";

const router = useRouter();
const loading = ref(false);
const searchKeyword = ref("");
const problemList = ref([]);

const pagination = reactive({
  pageNum: 1,
  size: 10,
  total: 0,
});

// 获取题目列表 - 适配后端标准分页格式
const fetchProblems = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pagination.pageNum,
      size: pagination.size,
      keyword: searchKeyword.value.trim(),
    };

    const res = await problemAdminAPI.getProblemsByPage(params);

    // 标准后端返回格式：{code:1, data: {list: [], total: 0}}
    if (res.code === 1 && res.data) {
      problemList.value = res.data.list || [];
      pagination.total = res.data.total || 0;
    } else {
      problemList.value = [];
      pagination.total = 0;
      ElMessage.warning("暂无题目数据");
    }
  } catch (err) {
    console.error("获取题目列表失败:", err);
    ElMessage.error(err.message || "获取题目列表失败");
    problemList.value = [];
  } finally {
    loading.value = false;
  }
};

// 新增题目
const goToAdd = () => {
  router.push({
    name: "ProblemForm",
    query: { mode: "add" },
  });
};

// 编辑题目 - 传递id到表单页
const goToEdit = (row) => {
  if (!row.id) return ElMessage.warning("题目ID不存在");
  router.push({
    name: "ProblemForm",
    query: {
      mode: "edit",
      id: row.id,
    },
  });
};

// 删除题目 - 简化响应处理
const handleDelete = async (id) => {
  if (!id) return ElMessage.warning("题目ID不存在");

  try {
    await ElMessageBox.confirm("确定删除该题目？删除后不可恢复！", "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      dangerMode: true,
    });

    const res = await problemAdminAPI.deleteProblem(id);
    if (res.code === 1) {
      ElMessage.success("删除成功");
      fetchProblems(); // 刷新列表
    } else {
      ElMessage.error(res.message || "删除失败");
    }
  } catch (err) {
    if (err !== "cancel") {
      // 排除取消操作的错误
      console.error("删除失败:", err);
      ElMessage.error("删除失败，请重试");
    }
  }
};

// 初始化加载列表
onMounted(() => {
  fetchProblems();
});
</script>

<style scoped>
.problem-management {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 60px);
}
.header {
  display: flex;
  align-items: center;
}
</style>
