export default [
  // 提交代码
  {
    url: "/api/user/testQuestion/submitTestQuestion",
    method: "post",
    response: () => {
      // 模拟随机测试点数量 (3-5个)
      const testPointCount = Math.floor(Math.random() * 3) + 3;
      const results = ["AC", "WA", "TLE", "MLE", "RE"];
      
      const questionResultList = Array.from({ length: testPointCount }, (_, index) => {
        const result = results[Math.floor(Math.random() * results.length)];
        return {
            id: index + 1,
            value: result,
            timeCost: Math.floor(Math.random() * 1000), // 模拟耗时 0-1000ms
            memoryCost: Math.floor(Math.random() * 1024 * 1024), // 模拟内存 0-1MB
        };
      });

      return {
        code: 1,
        message: "success",
        data: {
          id: Date.now().toString(),
          questionResultList: questionResultList,
        },
      };
    },
  },
];
