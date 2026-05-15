// store/modules/problem.js
import { problemApi } from "@/api/problem";
// import { mockStorage } from "@/utils/mockData"; // 导入模拟数据

// 从环境变量读取配置
// const USE_MOCK = false;

const state = {
  problems: [],
  currentProblem: null,
  tags: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  loading: false,
  error: null,
};

const mutations = {
  SET_PROBLEMS(state, problems) {
    state.problems = problems;
  },
  SET_CURRENT_PROBLEM(state, problem) {
    state.currentProblem = problem;
  },
  SET_TAGS(state, tags) {
    state.tags = tags;
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination };
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  ADD_PROBLEM(state, problem) {
    state.problems.unshift(problem);
  },
  UPDATE_PROBLEM(state, updatedProblem) {
    const index = state.problems.findIndex((p) => p.id === updatedProblem.id);
    if (index !== -1) {
      state.problems.splice(index, 1, updatedProblem);
    }
  },
  DELETE_PROBLEM(state, id) {
    state.problems = state.problems.filter((p) => p.id !== id);
  },
};

const actions = {
  async fetchProblems({ commit, state }, params = {}) {
    commit("SET_LOADING", true);
    try {
      /*
      if (USE_MOCK) {
        console.log("使用模拟数据获取题目列表");
        // 使用模拟数据
        const pageData = mockStorage.getProblemsByPage(
          params.page || state.pagination.page,
          params.limit || state.pagination.limit
        );

        commit("SET_PROBLEMS", pageData.records);
        commit("SET_PAGINATION", {
          total: pageData.total,
          page: pageData.pageNum,
          limit: pageData.size,
        });

        return {
          data: {
            list: pageData.records,
            total: pageData.total,
            page: pageData.pageNum,
          },
          code: 1,
          message: "success",
        };
      } else {
      */
        // 使用真实API
        const response = await problemApi.getProblemList({
          page: state.pagination.page,
          limit: state.pagination.limit,
          ...params,
        });
        commit("SET_PROBLEMS", response.data.list);
        commit("SET_PAGINATION", {
          total: response.data.total,
          page: response.data.page,
        });
        return response;
      // }
    } catch (error) {
      commit("SET_ERROR", error.message);
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async fetchProblemDetail({ commit }, id) {
    commit("SET_LOADING", true);
    try {
      /*
      if (USE_MOCK) {
        console.log("使用模拟数据获取题目详情:", id);
        // 使用模拟数据
        const problem = mockStorage.getProblemById(Number(id));
        if (!problem) {
          throw new Error("题目不存在");
        }

        // 转换数据结构以匹配真实API响应
        const mockResponse = {
          code: 1,
          message: "success",
          data: {
            ...problem,
            testPointList: problem.testPointList || [],
            testPointNum: problem.testPointNum || 0,
            label: problem.label || "",
            description: problem.description || "",
          },
        };

        commit("SET_CURRENT_PROBLEM", mockResponse.data);
        return mockResponse;
      } else {
      */
        // 使用真实API
        const response = await problemApi.getProblemDetail(id);
        commit("SET_CURRENT_PROBLEM", response.data);
        return response;
      // }
    } catch (error) {
      commit("SET_ERROR", error.message);
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async fetchTags({ commit }) {
    try {
      /*
      if (USE_MOCK) {
        console.log("使用模拟数据获取标签");
        // 模拟标签数据
        const mockTags = [
          "数组",
          "哈希表",
          "字符串",
          "双指针",
          "简单",
          "中等",
          "困难",
        ];
        commit("SET_TAGS", mockTags);

        return {
          data: mockTags,
          code: 1,
          message: "success",
        };
      } else {
      */
        // 使用真实API
        const response = await problemApi.getTags();
        commit("SET_TAGS", response.data);
        return response;
      // }
    } catch (error) {
      commit("SET_ERROR", error.message);
      throw error;
    }
  },

  async createProblem({ commit }, problemData) {
    try {
      /*
      if (USE_MOCK) {
        console.log("使用模拟数据创建题目");
        // 使用模拟数据
        const newProblem = mockStorage.addProblem(problemData);
        commit("ADD_PROBLEM", newProblem);

        return {
          data: newProblem,
          code: 1,
          message: "success",
        };
      } else {
      */
        // 使用真实API
        const response = await problemApi.createProblem(problemData);
        commit("ADD_PROBLEM", response.data);
        return response;
      // }
    } catch (error) {
      commit("SET_ERROR", error.message);
      throw error;
    }
  },

  async updateProblem({ commit }, { data }) {
    try {
      /*
      if (USE_MOCK) {
        console.log("使用模拟数据更新题目:", data.id);
        // 使用模拟数据
        const success = mockStorage.updateProblem(data);
        if (success) {
          commit("UPDATE_PROBLEM", data);
        }

        return {
          data: success ? data : null,
          code: success ? 1 : 0,
          message: success ? "success" : "更新失败",
        };
      } else {
      */
        // 使用真实API
        const response = await problemApi.updateProblem(data);
        commit("UPDATE_PROBLEM", response.data);
        return response;
      // }
    } catch (error) {
      commit("SET_ERROR", error.message);
      throw error;
    }
  },

  async deleteProblem({ commit }, id) {
    try {
      /*
      if (USE_MOCK) {
        console.log("使用模拟数据删除题目:", id);
        // 使用模拟数据
        mockStorage.deleteProblem(id);
        commit("DELETE_PROBLEM", id);

        return {
          code: 1,
          message: "success",
        };
      } else {
      */
        // 使用真实API
        await problemApi.deleteProblem(id);
        commit("DELETE_PROBLEM", id);
      // }
    } catch (error) {
      commit("SET_ERROR", error.message);
      throw error;
    }
  },
};

const getters = {
  problems: (state) => state.problems,
  currentProblem: (state) => state.currentProblem,
  tags: (state) => state.tags,
  pagination: (state) => state.pagination,
  loading: (state) => state.loading,
  error: (state) => state.error,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
