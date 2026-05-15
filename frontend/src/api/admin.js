import request from "@/utils/request";
import { mockStorage } from "@/utils/mockData";

// 是否强制使用 Mock 数据
const FORCE_MOCK = false;

// 模拟延迟
const mockDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const problemAdminAPI = {
  // 添加题目
  addProblem: async function (data) {
    try {
      if (FORCE_MOCK) throw new Error("Force Mock");
      return await request({
        url: "/testQuestion/addTestQuestion",
        method: "POST",
        data,
      });
    } catch (error) {
      console.warn("添加题目失败，使用Mock:", error);
      await mockDelay();
      const result = mockStorage.addProblem(data);
      return {
        code: 1,
        data: result,
        message: "添加成功(Mock)",
      };
    }
  },

  // 删除题目
  deleteProblem: async (id) => {
    try {
      if (FORCE_MOCK) throw new Error("Force Mock");
      return await request({
        url: "/testQuestion/deleteTestQuestionById",
        method: "DELETE",
        params: { id: id.toString() },
      });
    } catch (error) {
      console.warn("删除题目失败，使用Mock:", error);
      await mockDelay();
      const success = mockStorage.deleteProblem(id);
      return success
        ? { code: 1, data: null, message: "删除成功(Mock)" }
        : { code: 0, message: "删除失败，题目不存在(Mock)" };
    }
  },

  // 更新题目
  updateProblem: async (data) => {
    try {
      if (FORCE_MOCK) throw new Error("Force Mock");
      return await request({
        url: "/testQuestion/updateTestQuestion",
        method: "POST",
        data: data,
      });
    } catch (error) {
      console.warn("更新题目失败，使用Mock:", error);
      await mockDelay();
      const success = mockStorage.updateProblem(data);
      return success
        ? { code: 1, data: null, message: "更新成功(Mock)" }
        : { code: 0, message: "更新失败，题目不存在(Mock)" };
    }
  },

  // 题目分页查询
  getProblemsByPage: async (params) => {
    try {
      if (FORCE_MOCK) throw new Error("Force Mock");
      return await request({
        url: "/testQuestion/getTestQuestionByPage",
        method: "GET",
        params: {
          pageNum: params.pageNum,
          size: params.size,
          keyword: params.keyword || "",
        },
      });
    } catch (error) {
      console.warn("获取题目列表失败，使用Mock:", error);
      await mockDelay();
      const { pageNum = 1, size = 10, keyword } = params;

      // 从 mockStorage 获取所有题目
      let problems = mockStorage.getProblems();

      // 关键词过滤
      if (keyword && keyword.trim()) {
        const keywordLower = keyword.toLowerCase();
        problems = problems.filter(
          (p) =>
            p.title?.toLowerCase().includes(keywordLower) ||
            p.label?.toLowerCase().includes(keywordLower),
        );
      }

      // 手动分页
      const start = (pageNum - 1) * size;
      const end = start + size;
      const pageData = problems.slice(start, end);

      return {
        code: 1,
        data: {
          list: pageData,
          total: problems.length,
          pageNum: Number(pageNum),
          size: Number(size),
        },
        message: "查询成功(Mock)",
      };
    }
  },

  // 根据ID查询题目
  getProblemById: async (id) => {
    try {
      if (FORCE_MOCK) throw new Error("Force Mock");
      const response = await request({
        url: "/testQuestion/getTestQuestionById",
        method: "GET",
        params: { id },
      });
      return response;
    } catch (error) {
      console.warn(`获取题目详情失败(ID:${id})，使用Mock`);
      await mockDelay();
      const problem = mockStorage.getProblemById(id);
      return problem
        ? { code: 1, data: problem, message: "查询成功(Mock)" }
        : { code: 0, message: "题目不存在(Mock)" };
    }
  },

  // 根据ID查询测试点
  getTestPointsByQuestionId: async (id) => {
    try {
      if (FORCE_MOCK) throw new Error("Force Mock");
      const response = await request({
        url: "/testQuestion/getTestPointsListByQuestionId",
        method: "GET",
        params: { id: id },
      });
      return response;
    } catch (error) {
      await mockDelay();
      const problem = mockStorage.getProblemById(id);
      if (problem && problem.testPointList) {
        return {
          code: 1,
          data: problem.testPointList,
          message: "查询成功(Mock)",
        };
      }
      return { code: 1, data: [], message: "无测试点(Mock)" };
    }
  },

  // 获取题目总数
  getProblemCount: async (keyword = "") => {
    try {
      if (FORCE_MOCK) throw new Error("Force Mock");
      const response = await request({
        url: "/testQuestion/getTestQuestionCount",
        method: "GET",
        params: { keyword },
      });
      return response;
    } catch (error) {
      const problems = mockStorage.getProblems();
      return {
        code: 1,
        data: problems.length,
        message: "查询成功(Mock)",
      };
    }
  },
};
