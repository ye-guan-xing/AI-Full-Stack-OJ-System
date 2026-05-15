<!-- components/problem/ProblemTags.vue -->
<template>
  <div class="problem-tags">
    <div v-if="selectable" class="tags-input">
      <el-tag
        v-for="tag in selectedTags"
        :key="tag"
        closable
        @close="removeTag(tag)"
        size="small"
        class="selected-tag"
      >
        {{ tag }}
      </el-tag>
      <el-input
        v-if="inputVisible"
        ref="inputRef"
        v-model="inputValue"
        size="small"
        style="width: 100px"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm"
      />
      <el-button v-else size="small" @click="showInput" class="add-tag-btn">
        + 添加标签
      </el-button>
    </div>
    <div v-else class="tags-display">
      <el-tag
        v-for="(tag, index) in parsedTags"
        :key="index"
        :type="tagType"
        :size="size"
        class="display-tag"
      >
        {{ tag }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";

const props = defineProps({
  // 标签字符串，用逗号分隔
  label: {
    type: String,
    default: "",
  },
  // 是否可编辑选择
  selectable: {
    type: Boolean,
    default: false,
  },
  // 标签类型（info/success/warning/danger）
  tagType: {
    type: String,
    default: "info",
  },
  // 标签大小
  size: {
    type: String,
    default: "small",
  },
});

const emit = defineEmits(["update:label", "change"]);

const inputVisible = ref(false);
const inputValue = ref("");
const inputRef = ref();

// 解析标签字符串
const parsedTags = computed(() => {
  if (!props.label) return [];
  return props.label
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);
});

// 选中的标签（用于编辑模式）
const selectedTags = computed({
  get: () => parsedTags.value,
  set: (val) => {
    emit("update:label", val.join(","));
    emit("change", val);
  },
});

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    inputRef.value.focus();
  });
};

const handleInputConfirm = () => {
  if (
    inputValue.value &&
    !selectedTags.value.includes(inputValue.value.trim())
  ) {
    selectedTags.value = [...selectedTags.value, inputValue.value.trim()];
  }
  inputVisible.value = false;
  inputValue.value = "";
};

const removeTag = (tag) => {
  selectedTags.value = selectedTags.value.filter((t) => t !== tag);
};
</script>

<style scoped>
.problem-tags {
  display: flex;
  flex-wrap: wrap;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.selected-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.add-tag-btn {
  padding: 5px 10px;
  height: auto;
  border: 1px dashed #dcdfe6;
  color: #666;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.display-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}
</style>
