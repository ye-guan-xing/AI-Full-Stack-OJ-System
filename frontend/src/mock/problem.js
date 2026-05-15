import { mockStorage } from "../utils/mockData";

export default [
  // 用户端获取题目列表
  {
    url: "/api/user/testQuestion/getTestQuestionByPage",
    method: "get",
    response: ({ query }) => {
      try {
        const { pageNum = 1, size = 10, keyword } = query;
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
          message: "success",
        };
      } catch (error) {
        return {
          code: 0,
          data: { list: [], total: 0 },
          message: "获取题目列表失败",
        };
      }
    },
  },
  // 用户端获取题目详情
  {
    url: "/api/user/testQuestion/getTestQuestionById",
    method: "get",
    response: ({ query }) => {
      try {
        const problem = mockStorage.getProblemById(query.id);
        if (!problem) {
          return { code: 0, message: "题目不存在" };
        }
        return {
          code: 1,
          data: {
            ...problem,
            testPointList: problem.testPointList || [],
            testPointNum: problem.testPointNum || 0,
            label: problem.label || "",
            description: problem.description || "",
          },
          message: "success",
        };
      } catch (error) {
        return { code: 0, message: "获取题目详情失败" };
      }
    },
  },
  // 获取题目标签
  {
    url: "/api/testQuestion/getTags",
    method: "get",
    response: () => {
      const mockTags = [
        "数组", "哈希表", "字符串", "双指针", "简单", "中等", "困难",
      ];
      return {
        code: 1,
        data: mockTags,
        message: "success",
      };
    },
  },
];
