import request from "@/utils/request";
import { mockStorage } from "@/utils/mockData";

// 是否强制使用 Mock 数据（开发调试用）
const FORCE_MOCK = false;

// 模拟延迟
const mockDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const problemApi = {
  // 获取题目列表（分页查询）- 用户端
  async getProblemList(params) {
    try {
      if (FORCE_MOCK) throw new Error("Force Mock");
      return await request({
        url: "/testQuestion/getTestQuestionByPage",
        method: "get",
        params,
      });
    } catch (error) {
      console.warn("API请求失败，尝试使用Mock数据:", error);
      await mockDelay();
      const { pageNum = 1, size = 10, keyword } = params;
      const result = mockStorage.getProblemsByPage(pageNum, size);

      // 模拟后端返回结构
      return {
        code: 1,
        message: "查询成功(Mock)",
        data: {
          list: result.records,
          total: result.total,
          pageNum: result.pageNum,
          pageSize: result.size,
        },
      };
    }
  },

  // 获取题目总数 - 用户端
  async getProblemCount(keyword = "") {
    try {
      if (FORCE_MOCK) throw new Error("Force Mock");
      return await request({
        url: "/testQuestion/getTestQuestionCount",
        method: "get",
        params: { keyword },
      });
    } catch (error) {
      // Mock数据总数
      const problems = mockStorage.getProblems();
      return {
        code: 1,
        data: problems.length,
        message: "查询成功(Mock)",
      };
    }
  },

  // 获取题目详情（根据ID查询）- 用户端
  async getProblemDetail(id) {
    try {
      if (FORCE_MOCK) throw new Error("Force Mock");
      return await request({
        url: "/user/testQuestion/getTestQuestionById",
        method: "get",
        params: { id },
      });
    } catch (error) {
      console.warn(`获取题目详情失败(ID:${id})，尝试Mock数据`);
      await mockDelay();
      const problem = mockStorage.getProblemById(id);
      if (problem) {
        return {
          code: 1,
          data: problem,
          message: "查询成功(Mock)",
        };
      }
      throw error; // 如果Mock也没找到，继续抛出错误
    }
  },

  // 获取题目的测试点列表 - 用户端
  async getTestPointsByQuestionId(id) {
    try {
      if (FORCE_MOCK) throw new Error("Force Mock");
      return await request({
        url: "/user/testQuestion/getTestPointsListByQuestionId",
        method: "get",
        params: { id },
      });
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

  // 提交代码 - 用户端
  async submitSolution(data) {
    try {
      if (FORCE_MOCK) throw new Error("Force Mock");
      return await request({
        url: "/user/testQuestion/submitTestQuestion",
        method: "post",
        data,
      });
    } catch (error) {
      await mockDelay(1000);
      // 模拟判题结果
      return {
        code: 1,
        data: {
          id: Date.now(),
          status: 2, // 假设通过
          message: "Accepted",
          questionResultList: [
            { value: "AC", message: "测试点1通过" },
            { value: "AC", message: "测试点2通过" },
          ],
        },
        message: "提交成功(Mock)",
      };
    }
  },
};
