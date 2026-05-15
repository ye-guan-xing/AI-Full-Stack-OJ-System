import { problemAdminAPI } from "@/api/admin";
import { submissionApi } from "@/api/submission";
//开关见useMock
// 模拟判题结果生成函数
// const generateMockJudgeResults = (testPointCount) => {
//   const results = ["AC", "WA", "TLE", "MLE", "RE"];
//   return Array.from({ length: testPointCount }, () => ({
//     value: results[Math.floor(Math.random() * results.length)],
//   }));
// };

// 辅助方法：计算得分
const calculateScore = (questionResultList) => {
  if (!questionResultList || !Array.isArray(questionResultList)) return 0;

  const acCount = questionResultList.filter(
    (item) => item.value === "AC"
  ).length;
  const total = questionResultList.length;

  if (total === 0) return 0;

  // 每个测试点100分
  return Math.round((acCount / total) * 100 * total);
};

// 辅助方法：格式化测试点数据
const formatTestPoints = (questionResultList) => {
  if (!questionResultList || !Array.isArray(questionResultList)) return [];

  return questionResultList.map((item, index) => {
    // 将判题结果值转换为状态码
    let statusCode = 0;
    let statusText = "未知";

    switch (item.value) {
      case "AC":
        statusCode = 2;
        statusText = "通过";
        break;
      case "WA":
        statusCode = 7;
        statusText = "答案错误";
        break;
      case "TLE":
        statusCode = 6;
        statusText = "时间超限";
        break;
      case "MLE":
        statusCode = 5;
        statusText = "内存超限";
        break;
      case "RE":
        statusCode = 4;
        statusText = "运行错误";
        break;
      default:
        statusCode = 8;
        statusText = item.value || "系统错误";
    }

    return {
      id: index + 1,
      status: statusCode,
      statusText: statusText,
      value: item.value,
      message: `${index + 1}号测试点：${statusText}`,
      timeCost: item.timeCost || 0,
      memoryCost: item.memoryCost || 0,
    };
  });
};

const state = {
  // 提交状态管理
  submitStatus: {
    loading: false,
    success: false,
    error: null,
  },
  // 当前提交结果
  currentSubmission: null,
  // 模拟数据开关 - 改为 false 使用真实API
  // useMock: true,
};

const mutations = {
  // 更新提交状态
  UPDATE_SUBMIT_STATUS(state, payload) {
    state.submitStatus = { ...state.submitStatus, ...payload };
  },
  // 保存当前提交结果
  SET_CURRENT_SUBMISSION(state, submission) {
    state.currentSubmission = submission;
  },
};

const actions = {
  // 提交代码到判题系统
  async submitCode({ commit, state }, { problemId, userId, language, code }) {
    commit("UPDATE_SUBMIT_STATUS", { loading: true, error: null });

    try {
      /*
      if (state.useMock) {
        // 模拟提交延迟
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 获取题目信息以确定测试点数量
        const problem = await problemAdminAPI.getProblemById(problemId);
        const testPointCount = problem.data?.testPointNum || 3;

        // 生成模拟判题结果
        const mockResult = {
          code: 1,
          message: "success",
          data: {
            id: Date.now().toString(),
            questionResultList: generateMockJudgeResults(testPointCount),
          },
        };

        commit("SET_CURRENT_SUBMISSION", mockResult.data);
        commit("UPDATE_SUBMIT_STATUS", { loading: false, success: true });
        return mockResult;
      } else {
      */
        // 真实接口调用
        console.log("调用真实API提交代码:", {
          id: problemId,
          userId: userId,
          language: language,
          answer: code,
        });

        const res = await submissionApi.submitCode({
          id: problemId,
          userId: userId,
          language: language,
          answer: code,
        });

        console.log("API响应:", res);

        // 根据你提供的响应格式，判断 code === 1 表示成功
        if (res && res.code === 1) {
          // 成功，存储判题结果
          const submissionData = {
            ...res.data,
            // 添加一些元数据，方便前端使用
            submissionId: res.data.id || `sub_${Date.now()}`,
            status: "判题完成",
            score: calculateScore(res.data.questionResultList),
            totalScore: res.data.questionResultList.length * 100,
            testPoints: formatTestPoints(res.data.questionResultList),
          };

          commit("SET_CURRENT_SUBMISSION", submissionData);
          commit("UPDATE_SUBMIT_STATUS", {
            loading: false,
            success: true,
            error: null,
          });

          return res;
        } else {
          // 失败，使用后端返回的错误信息
          const errorMsg = res.message || res.msg || "提交失败";
          console.error("API返回错误:", errorMsg);
          throw new Error(errorMsg);
        }
      // }
    } catch (error) {
      console.error("提交代码错误:", error);

      let errorMessage = error.message;

      // 如果错误有响应数据，尝试从中提取更详细的错误信息
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.msg) {
          errorMessage = errorData.msg;
        }
      }

      commit("UPDATE_SUBMIT_STATUS", {
        loading: false,
        success: false,
        error: errorMessage || "提交过程发生错误",
      });
      throw error;
    }
  },

  // 重置提交状态
  resetSubmissionState({ commit }) {
    commit("UPDATE_SUBMIT_STATUS", {
      loading: false,
      success: false,
      error: null,
    });
    commit("SET_CURRENT_SUBMISSION", null);
  },
};

const getters = {
  // 获取提交状态
  isSubmitting: (state) => state.submitStatus.loading,
  // 获取提交结果
  submissionResult: (state) => state.currentSubmission,
  // 获取提交错误信息
  submitError: (state) => state.submitStatus.error,
  // 判断是否全部通过
  isAllAccepted: (state) => {
    if (!state.currentSubmission?.questionResultList) return false;
    return state.currentSubmission.questionResultList.every(
      (item) => item.value === "AC"
    );
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
