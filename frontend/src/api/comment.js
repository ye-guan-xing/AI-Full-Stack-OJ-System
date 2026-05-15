import request from "@/utils/request";

export const commentApi = {
  // 获取评论列表
  getComments(params) {
    return request({
      url: "/comment/getComments",
      method: "get",
      params,
    });
  },

  // 添加评论
  addComment(data) {
    return request({
      url: "/comment/addComment",
      method: "post",
      data,
    });
  },

  // 删除评论
  deleteComment(id) {
    return request({
      url: "/comment/deleteComment",
      method: "delete",
      params: { id },
    });
  },

  // 点赞评论
  addCommentLike(data) {
    return request({
      url: "/comment/addCommentLike",
      method: "post",
      data,
    });
  },

  // 取消点赞
  cancelCommentLike(data) {
    return request({
      url: "/comment/cancelCommentLike",
      method: "delete",
      data,
    });
  },
};
