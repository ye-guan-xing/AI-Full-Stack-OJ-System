import Mock from "mockjs";

// 内存中存储评论数据
let comments = [];

// 初始化一些模拟数据
const initComments = () => {
  if (comments.length === 0) {
    comments = [
      {
        id: 1,
        userId: 2,
        userName: "user",
        content: "这道题很有意思，通过了！",
        parentCommentId: null,
        questionId: 1,
        likeCount: 5,
        isLiked: false,
        createTime: "2023-10-01 12:00:00",
        childComments: [
          {
            id: 2,
            userId: 1,
            userName: "admin",
            content: "确实不错，考察了动态规划。",
            parentCommentId: 1,
            questionId: 1,
            likeCount: 2,
            isLiked: true,
            createTime: "2023-10-01 12:30:00",
            childComments: null,
          },
        ],
      },
      {
        id: 3,
        userId: 1,
        userName: "admin",
        content: "注意边界条件处理。",
        parentCommentId: null,
        questionId: 1,
        likeCount: 10,
        isLiked: true,
        createTime: "2023-10-02 09:00:00",
        childComments: [],
      },
    ];
  }
};

initComments();

export default [
  // 添加评论
  {
    url: "/api/comment/addComment",
    method: "post",
    response: ({ body }) => {
      const { userId, content, questionId, parentCommentId } = body;
      
      const newComment = {
        id: Mock.mock("@integer(100, 10000)"),
        userId: userId,
        userName: userId === 1 ? "admin" : "user", // 简化处理
        content: content,
        parentCommentId: parentCommentId,
        questionId: questionId,
        likeCount: 0,
        isLiked: false,
        createTime: Mock.mock("@now('yyyy-MM-dd HH:mm:ss')"),
        childComments: [],
      };

      if (parentCommentId) {
        // 回复评论：找到父评论并添加
        const parent = comments.find((c) => c.id === parentCommentId);
        if (parent) {
          if (!parent.childComments) parent.childComments = [];
          parent.childComments.push(newComment);
        }
      } else {
        // 主评论：直接添加到列表头部
        comments.unshift(newComment);
      }

      return {
        code: 1,
        message: "success",
        data: null,
      };
    },
  },

  // 点赞
  {
    url: "/api/comment/addCommentLike",
    method: "post",
    response: ({ body }) => {
      const { commentId } = body;
      
      // 递归查找并更新
      const findAndUpdate = (list) => {
        for (let item of list) {
          if (item.id === commentId) {
            item.likeCount++;
            item.isLiked = true;
            return true;
          }
          if (item.childComments && item.childComments.length > 0) {
            if (findAndUpdate(item.childComments)) return true;
          }
        }
        return false;
      };

      findAndUpdate(comments);

      return {
        code: 1,
        message: "success",
        data: null,
      };
    },
  },

  // 取消点赞
  {
    url: "/api/comment/cancelCommentLike",
    method: "delete",
    response: ({ body }) => {
      const { commentId } = body;

       // 递归查找并更新
       const findAndUpdate = (list) => {
        for (let item of list) {
          if (item.id === commentId) {
            if (item.likeCount > 0) item.likeCount--;
            item.isLiked = false;
            return true;
          }
          if (item.childComments && item.childComments.length > 0) {
            if (findAndUpdate(item.childComments)) return true;
          }
        }
        return false;
      };

      findAndUpdate(comments);

      return {
        code: 1,
        message: "success",
        data: null,
      };
    },
  },

  // 查询单条评论
  {
    url: "/api/comment/getComment",
    method: "get",
    response: ({ query }) => {
      const { commentId } = query;
      let target = null;

      const find = (list) => {
        for (let item of list) {
          if (item.id == commentId) { // == 兼容 string/number
            target = item;
            return true;
          }
          if (item.childComments && item.childComments.length > 0) {
            if (find(item.childComments)) return true;
          }
        }
        return false;
      };

      find(comments);

      if (target) {
        return {
          code: 1,
          message: "success",
          data: target,
        };
      } else {
        return {
          code: 0,
          message: "评论不存在",
          data: null,
        };
      }
    },
  },

  // 分页查询评论
  {
    url: "/api/comment/getComments",
    method: "get",
    response: ({ query }) => {
      const { questionId, pageNum = 1, pageSize = 10 } = query;
      
      // 筛选该题目的主评论（后端逻辑通常只返回主评论，子评论嵌套在其中）
      const questionComments = comments.filter(
        (c) => c.questionId == questionId && !c.parentCommentId
      );

      // 分页
      const start = (Number(pageNum) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      const list = questionComments.slice(start, end);

      return {
        code: 1,
        message: "success",
        data: {
          list,
          total: questionComments.length,
          pageNum: Number(pageNum),
          pageSize: Number(pageSize),
        },
      };
    },
  },

  // 删除评论
  {
    url: "/api/comment/deleteComment",
    method: "delete",
    response: ({ query }) => {
      const { id } = query;
      
      // 1. 尝试从顶层删除
      const initialLength = comments.length;
      comments = comments.filter(c => c.id != id);
      if (comments.length < initialLength) {
         return { code: 1, message: "success", data: null };
      }

      // 2. 尝试从子评论删除
      let deleted = false;
      const deleteRecursive = (list) => {
          for (let item of list) {
              if (item.childComments && item.childComments.length > 0) {
                  const beforeLen = item.childComments.length;
                  item.childComments = item.childComments.filter(child => child.id != id);
                  if (item.childComments.length < beforeLen) {
                      deleted = true;
                      return;
                  }
                  deleteRecursive(item.childComments);
              }
          }
      };
      
      deleteRecursive(comments);

      return {
        code: 1,
        message: "success",
        data: null,
      };
    },
  },
];
