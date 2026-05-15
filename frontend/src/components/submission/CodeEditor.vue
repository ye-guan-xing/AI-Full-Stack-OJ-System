<!-- @/components/submission/CodeEditor.vue -->
<template>
  <div class="code-editor">
    <!-- 语言选择器 -->
    <div class="language-selector">
      <el-select
        v-model="selectedLanguage"
        placeholder="选择编程语言"
        style="width: 200px; margin-bottom: 10px"
      >
        <el-option
          v-for="lang in languageOptions"
          :key="lang.value"
          :label="lang.label"
          :value="lang.value"
        />
      </el-select>
    </div>

    <!-- Monaco编辑器 -->
    <div ref="editorContainer" class="editor-container"></div>

    <!-- 提交按钮 -->
    <div class="editor-actions">
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="submitting"
        :disabled="!code.trim() || submitting"
      >
        {{ submitting ? "提交中..." : "提交代码" }}
      </el-button>
      <el-button @click="handleReset" :disabled="submitting"> 重置 </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as monaco from "monaco-editor";
import { ElMessage } from "element-plus";
import { submissionApi } from "@/api/submission";

const props = defineProps({
  problemId: {
    type: [String, Number],
    required: true,
  },
  userId: {
    type: [String, Number],
    default: "1",
  },
  initialCode: {
    type: String,
    default: "// 在这里编写你的代码\n",
  },
});

const emit = defineEmits(["submit-success", "submit-fail"]);

// 编辑器实例
const editorContainer = ref(null);
let editor = null;

// 状态
const code = ref(props.initialCode);
const selectedLanguage = ref("python"); // 默认改为python
const submitting = ref(false);

// 语言选项
const languageOptions = [
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "javascript", label: "JavaScript" },
];

// 语言对应的Monaco语言模式
const languageMap = {
  python: "python",
  java: "java",
  cpp: "cpp",
  c: "c",
  javascript: "javascript",
};

// 初始化编辑器
const initEditor = () => {
  if (!editorContainer.value) return;

  // 根据语言设置初始代码模板
  const templates = {
    python: `# 在这里编写Python代码
# 例如：
# import sys
# 
# def main():
#     data = sys.stdin.read().strip().split()
#     if len(data) >= 2:
#         a, b = map(int, data[:2])
#         print(a + b)
# 
# if __name__ == "__main__":
#     main()`,

    java: `// 在这里编写Java代码
// 例如：
// import java.util.Scanner;
// 
// public class Main {
//     public static void main(String[] args) {
//         Scanner scanner = new Scanner(System.in);
//         int a = scanner.nextInt();
//         int b = scanner.nextInt();
//         System.out.println(a + b);
//     }
// }`,

    cpp: `// 在这里编写C++代码
// 例如：
// #include <iostream>
// using namespace std;
// 
// int main() {
//     int a, b;
//     cin >> a >> b;
//     cout << a + b << endl;
//     return 0;
// }`,

    c: `// 在这里编写C代码
// 例如：
// #include <stdio.h>
// 
// int main() {
//     int a, b;
//     scanf("%d %d", &a, &b);
//     printf("%d\\n", a + b);
//     return 0;
// }`,

    javascript: `// 在这里编写JavaScript代码
// 例如：
// const readline = require('readline');
// 
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });
// 
// rl.on('line', (input) => {
//   const [a, b] = input.trim().split(' ').map(Number);
//   console.log(a + b);
//   rl.close();
// });`,
  };

  const initialCode = templates[selectedLanguage.value] || props.initialCode;
  code.value = initialCode;

  editor = monaco.editor.create(editorContainer.value, {
    value: initialCode,
    language: languageMap[selectedLanguage.value],
    theme: "vs-dark",
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
    fontSize: 14,
    lineNumbers: "on",
    scrollBeyondLastLine: false,
    wordWrap: "on",
  });

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    code.value = editor.getValue();
  });
};

// 处理提交
const handleSubmit = async () => {
  if (!code.value.trim()) {
    ElMessage.alert("请输入代码");
    return;
  }

  if (!props.problemId) {
    ElMessage.error("题目ID无效");
    return;
  }

  submitting.value = true;

  try {
    console.log("开始提交代码...");
    console.log("问题ID:", props.problemId);
    console.log("用户ID:", props.userId);
    console.log("语言:", selectedLanguage.value);
    console.log("代码长度:", code.value.length);

    // 准备提交数据 - 确保字段名正确
    const submissionData = {
      id: String(props.problemId), // 关键：使用 id 而不是 questionId
      userId: String(props.userId),
      language: selectedLanguage.value,
      answer: code.value.trim(),
    };

    console.log("提交数据:", submissionData);

    // 调用API
    const result = await submissionApi.submitCode(submissionData);
    console.log("提交API返回结果:", result);

    // 处理结果 - 修复条件判断逻辑
    let processedResult = result;

    // 处理不同的结果格式
    if (result && typeof result === "object") {
      // 如果返回的是 {code: 1, data: {...}}
      if (result.code === 1) {
        // 如果有 data 字段，使用 data
        if (result.data !== undefined) {
          processedResult = result.data;
        }
        // 否则，如果整个对象有 questionResultList，可能是直接的数据对象
        else if (result.questionResultList !== undefined) {
          processedResult = result;
        }
      }
      // 如果返回的是直接的数据对象（没有code字段）
      else if (
        result.id !== undefined ||
        result.questionResultList !== undefined
      ) {
        processedResult = result;
      }
    }

    console.log("处理后的结果:", processedResult);

    // 触发成功事件
    emit("submit-success", processedResult);

    ElMessage.success("代码提交成功！");
  } catch (error) {
    console.error("提交失败:", error);

    // 提供更具体的错误信息
    let errorMessage = "提交失败";
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response && error.response.data) {
      errorMessage = error.response.data.message || "服务器错误";
    }

    emit("submit-fail", errorMessage);
    ElMessage.error(errorMessage);
  } finally {
    submitting.value = false;
  }
};

// 重置编辑器
const handleReset = () => {
  if (editor) {
    const templates = {
      python: `# 在这里编写Python代码`,
      java: `// 在这里编写Java代码`,
      cpp: `// 在这里编写C++代码`,
      c: `// 在这里编写C代码`,
      javascript: `// 在这里编写JavaScript代码`,
    };

    const template = templates[selectedLanguage.value] || props.initialCode;
    editor.setValue(template);
    code.value = template;
  }
};

// 监听语言变化
watch(selectedLanguage, (newLang) => {
  if (editor) {
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, languageMap[newLang]);

      // 更新代码模板
      const templates = {
        python: `# 在这里编写Python代码`,
        java: `// 在这里编写Java代码`,
        cpp: `// 在这里编写C++代码`,
        c: `// 在这里编写C代码`,
        javascript: `// 在这里编写JavaScript代码`,
      };

      const template = templates[newLang] || props.initialCode;
      editor.setValue(template);
      code.value = template;
    }
  }
});

// 生命周期
onMounted(() => {
  initEditor();
});

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
  }
});
</script>

<style scoped>
.code-editor {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.language-selector {
  margin-bottom: 10px;
}

.editor-container {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.editor-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .code-editor {
    height: 400px;
  }

  .editor-actions {
    flex-direction: column;
  }
}
</style>
