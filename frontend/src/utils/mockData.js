class MockStorage {
  constructor() {
    this.storageKey = "oj_mock_data";
    // 内存数据（用于服务端环境或无 localStorage 环境）
    this.memoryData = null;
    this.initData();
  }

  // 判断是否支持 localStorage
  hasLocalStorage() {
    try {
      return typeof localStorage !== "undefined" && localStorage !== null;
    } catch (e) {
      return false;
    }
  }

  // 新增：JSON格式校验
  isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  initData() {
    const initialData = {
      problems: [
        {
          id: 1,
          title: "两数之和",
          label: "数组,哈希表，简单",
          testPointNum: 3,
          description:
            "给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回它们的数组下标。\n\n你可以假设每种输入只会对应一个答案。但是，数组中同一个元素不能使用两遍。",
          testPointList: [
            { input: "3\n2 7 11 15\n9", output: "0 1", isSample: 1 },
            { input: "2\n3 2 4\n6", output: "1 2", isSample: 0 },
            { input: "2\n3 3\n6", output: "0 1", isSample: 0 },
          ],
          createTime: "2024-01-15 10:00:00",
        },
        {
          id: 2,
          title: "验证回文串",
          label: "字符串,双指针,简单",
          testPointNum: 6,
          description:
            "给定一个字符串，验证它是否是回文串，只考虑字母和数字字符，可以忽略字母的大小写。\n\n说明：本题中，我们将空字符串定义为有效的回文串。",
          testPointList: [
            {
              input: '"A man, a plan, a canal: Panama"',
              output: "true",
              isSample: 1,
            },
            { input: '"race a car"', output: "false", isSample: 1 },
            { input: '""', output: "true", isSample: 0 },
          ],
          createTime: "2024-01-16 14:30:00",
        },
      ],
      nextProblemId: 3,
    };

    if (this.hasLocalStorage()) {
      const existingData = localStorage.getItem(this.storageKey);
      if (!existingData || !this.isValidJSON(existingData)) {
        this.saveData(initialData);
      }
    } else {
      // 服务端环境使用内存数据
      if (!this.memoryData) {
        this.memoryData = initialData;
      }
    }
  }

  getData() {
    if (this.hasLocalStorage()) {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } else {
      return this.memoryData || {};
    }
  }

  saveData(data) {
    if (this.hasLocalStorage()) {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } else {
      this.memoryData = data;
    }
  }

  getProblems() {
    return this.getData().problems || [];
  }

  addProblem(problem) {
    const data = this.getData();
    const newProblem = {
      ...problem,
      id: data.nextProblemId++,
      createTime: new Date().toLocaleString("zh-CN"),
    };
    if (!data.problems) data.problems = []; // 兜底
    data.problems.push(newProblem);
    this.saveData(data);
    return newProblem;
  }

  updateProblem(updateProblem) {
    // 修正参数拼写
    const data = this.getData();
    if (!data.problems) return false; // 兜底
    const index = data.problems.findIndex((p) => p.id === updateProblem.id);
    if (index !== -1) {
      data.problems[index] = {
        ...data.problems[index],
        ...updateProblem,
        createTime: data.problems[index].createTime,
      };
      this.saveData(data);
      return true; // 返回true表示成功
    }
    return false; // 返回false表示未找到
  }

  deleteProblem(id) {
    const data = this.getData();
    if (!data.problems) data.problems = []; // 兜底
    data.problems = data.problems.filter((p) => p.id !== id);
    this.saveData(data);
    return true;
  }

  getProblemsByPage(pageNum = 1, size = 10) {
    const problems = this.getProblems();
    const start = (pageNum - 1) * size;
    const end = start + size;
    const pageData = problems.slice(start, end);
    return {
      records: pageData,
      total: problems.length,
      pageNum,
      size,
    };
  }

  getProblemById(id) {
    const data = this.getData();
    // 使用 == 允许字符串和数字 ID 匹配
    return data.problems?.find((p) => p.id == id) || null;
  }
}

export const mockStorage = new MockStorage();
