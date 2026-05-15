<template>
  <div class="admin-problem-management">
    <h2>题目管理</h2>

    <!-- 搜索+新增按钮 -->
    <div class="header-actions">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索题目名称/标签"
        style="width: 240px"
        @input="handleSearchInput"
        clearable
        @clear="handleSearchClear"
      />
      <el-button type="primary" @click="handleSearch" style="margin-left: 10px">
        搜索
      </el-button>
      <el-button type="success" @click="goToCreate" style="margin-left: 10px">
        新增题目
      </el-button>
    </div>

    <!-- 题目列表表格 -->
    <el-table
      v-loading="loading"
      :data="problemList"
      border
      stripe
      style="width: 100%; margin-top: 15px"
      empty-text="暂无题目数据"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="title" label="题目名称" min-width="200" />
      <el-table-column prop="label" label="标签" min-width="150" />
      <el-table-column
        prop="testPointNum"
        label="测试点数量"
        width="120"
        align="center"
      />
      <el-table-column
        prop="description"
        label="描述"
        min-width="300"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span class="description-text">{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="goToEdit(scope.row)">
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row.id)"
            style="margin-left: 5px"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.pageNum"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      :page-sizes="[5, 10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 15px; text-align: right"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
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
const problemList = ref([]); // 存储当前页显示的数据

// 分页参数
const pagination = reactive({
  pageNum: 1,
  size: 10,
  total: 0,
});

onMounted(() => {
  fetchProblems();
});

const fetchProblems = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pagination.pageNum,
      size: pagination.size,
      keyword: searchKeyword.value.trim(),
    };

    // 并发请求：获取当前页题目列表和总数
    const [listRes, countRes] = await Promise.all([
      problemAdminAPI.getProblemsByPage(params),
      problemAdminAPI.getProblemCount(searchKeyword.value.trim()),
    ]);

    let dataArray = [];

    // 拦截器已解包 data，listRes = { list, total, pageNum, size }
    if (Array.isArray(listRes?.list)) {
      dataArray = listRes.list;
    } else if (Array.isArray(listRes)) {
      dataArray = listRes;
    }

    problemList.value = dataArray;

    // countRes = { count: N }
    pagination.total = countRes?.count ?? dataArray.length;

    if (problemList.value.length === 0) {
      if (searchKeyword.value.trim()) {
        ElMessage.info(`未找到包含"${searchKeyword.value}"的题目`);
      }
    }
  } catch (err) {
    console.error("获取题目列表失败:", err);
    // request.js 已处理错误提示
    problemList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索相关函数
const handleSearchInput = () => {
  pagination.pageNum = 1;
  fetchProblems();
};

const handleSearch = () => {
  pagination.pageNum = 1;
  fetchProblems();
};

const handleSearchClear = () => {
  pagination.pageNum = 1;
  fetchProblems();
};

// 分页相关函数 - 每次翻页都调用后端获取对应页数据
const handleSizeChange = (size) => {
  pagination.size = size;
  pagination.pageNum = 1;
  fetchProblems();
};

const handleCurrentChange = (pageNum) => {
  pagination.pageNum = pageNum;
  fetchProblems();
};

// 跳转到新增题目页
const goToCreate = () => {
  router.push({
    name: "AdminProblemCreate",
  });
};

// 跳转到编辑题目页
const goToEdit = (row) => {
  if (!row.id) {
    ElMessage.warning("题目ID不存在");
    return;
  }
  router.push({
    name: "AdminProblemEdit",
    params: { id: row.id },
  });
};

// 删除题目 - 兼容多种返回格式
const handleDelete = async (id) => {
  if (!id) {
    ElMessage.warning("题目ID不存在");
    return;
  }

  try {
    await ElMessageBox.confirm("确定删除该题目吗？删除后不可恢复。", "提示", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await problemAdminAPI.deleteProblem(id);
    ElMessage.success("删除成功");
    if (problemList.value.length === 1 && pagination.pageNum > 1) {
      pagination.pageNum--;
    }
    fetchProblems();
  } catch (err) {
    if (err !== "cancel") {
      console.error("删除失败:", err);
      ElMessage.error("删除失败：" + (err.message || "接口请求错误"));
    }
  }
};
</script>

<style scoped>
.admin-problem-management {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 60px);
}

.header-actions {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.header-actions .el-input {
  margin-right: 10px;
}

.header-actions .el-button {
  margin-left: 10px;
}
</style>