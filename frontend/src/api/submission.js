import request from "@/utils/request";

export const submissionApi = {
  // 提交代码（严格对齐文档）
  submitCode(data) {
    console.log("=== submissionApi.submitCode 被调用 ===");
    console.log("提交数据:", data);

    return request({
      url: "/user/testQuestion/submitTestQuestion",
      method: "post",
      data,
    });
  },

  // 获取提交结果
  getSubmissionResult(id) {
    return request({
      url: `/submission/result/${id}`,
      method: "get",
    });
  },
};
