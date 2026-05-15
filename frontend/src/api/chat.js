import axios from 'axios';
import { ElMessage } from 'element-plus';

const chatRequest = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

chatRequest.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 1) {
      return res;
    } else {
      ElMessage.error(res.msg || '');
      return Promise.reject(new Error(res.msg || '请求失败'));
    }
  },
  (error) => {
    const { status, data } = error.response || {};
    switch (status) {
      case 404:
        ElMessage.error('智能体服务未找到');
        break;
      case 500:
        ElMessage.error('智能体服务内部错误');
        break;
      default:
        ElMessage.error(data?.msg || '网络错误');
    }
    return Promise.reject(error);
  }
);

export const chatApi = {
  sendMessage(data) {
    return chatRequest({
      url: '/chat',
      method: 'post',
      data: {
        user_id: data.user_id,
        text: data.text,
        session_id: data.session_id
      }
    });
  }
};
