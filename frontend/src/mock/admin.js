import { mockStorage } from "../utils/mockData";

export default [
  // 添加题目
  {
    url: "/api/testQuestion/addTestQuestion",
    method: "post",
    response: ({ body }) => {
      try {
        const result = mockStorage.addProblem(body);
        return {
          code: 1,
          data: result,
          message: "添加成功",
        };
      } catch (error) {
        return {
          code: 0,
          message: "添加失败: " + error.message,
        };
      }
    },
  },
  // 删除题目
  {
    url: "/api/testQuestion/deleteTestQuestionById",
    method: "delete",
    response: ({ query }) => {
      try {
        const success = mockStorage.deleteProblem(query.id);
        return success
          ? { code: 1, data: null, message: "删除成功" }
          : { code: 0, message: "删除失败，题目不存在" };
      } catch (error) {
        return { code: 0, message: "删除失败" };
      }
    },
  },
  // 更新题目
  {
    url: "/api/testQuestion/updateTestQuestion",
    method: "post",
    response: ({ body }) => {
      try {
        const success = mockStorage.updateProblem(body);
        return success
          ? { code: 1, data: null, message: "更新成功" }
          : { code: 0, message: "更新失败，题目不存在" };
      } catch (error) {
        return { code: 0, message: "更新失败" };
      }
    },
  },
  // 题目分页查询
  {
    url: "/api/testQuestion/getTestQuestionByPage",
    method: "get",
    response: ({ query }) => {
      try {
        const { pageNum = 1, size = 10, keyword } = query;
        // 获取所有题目
        let problems = mockStorage.getProblems();
        // 关键词过滤
        if (keyword && keyword.trim()) {
          const keywordLower = keyword.toLowerCase();
          problems = problems.filter(
            (p) =>
              p.title?.toLowerCase().includes(keywordLower) ||
              p.label?.toLowerCase().includes(keywordLower)
          );
        }
        // 手动分页
        const start = (Number(pageNum) - 1) * Number(size);
        const end = start + Number(size);
        const pageData = problems.slice(start, end);

        return {
          code: 1,
          data: {
            list: pageData,
            total: problems.length,
            pageNum: Number(pageNum),
            size: Number(size),
          },
          message: "查询成功",
        };
      } catch (error) {
        return {
          code: 0,
          data: { list: [], total: 0 },
          message: "查询失败",
        };
      }
    },
  },
  // 根据ID查询题目
  {
    url: "/api/testQuestion/getTestQuestionById",
    method: "get",
    response: ({ query }) => {
      try {
        const problem = mockStorage.getProblemById(query.id);
        return problem
          ? { code: 1, data: problem, message: "查询成功" }
          : { code: 0, message: "题目不存在" };
      } catch (error) {
        return { code: 0, message: "查询失败" };
      }
    },
  },
  // 获取题目总数
  {
    url: "/api/testQuestion/getTestQuestionCount",
    method: "get",
    response: ({ query }) => {
        let problems = mockStorage.getProblems();
        if (query.keyword && query.keyword.trim()) {
            const keywordLower = query.keyword.toLowerCase();
            problems = problems.filter(
              (p) =>
                p.title?.toLowerCase().includes(keywordLower) ||
                p.label?.toLowerCase().includes(keywordLower)
            );
        }
        return {
            code: 1,
            data: problems.length,
            message: "查询成功"
        }
    }
  }
];
