import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def test_multi_turn_conversation():
    """测试多轮对话功能"""
    print("\n=== 测试多轮对话 ===")
    
    user_id = "test_user_1"
    
    print(f"\n1. 第一轮对话（用户：{user_id}）")
    response1 = requests.post(f"{BASE_URL}/chat", json={
        "user_id": user_id,
        "text": "我想刷一些数组相关的题目"
    })
    print(f"响应: {response1.json()}")
    session_id_1 = response1.json()["data"]["session_id"]
    print(f"会话ID: {session_id_1}")
    
    time.sleep(1)
    
    print(f"\n2. 第二轮对话（同一用户，同一会话）")
    response2 = requests.post(f"{BASE_URL}/chat", json={
        "user_id": user_id,
        "text": "推荐一道简单的",
        "session_id": session_id_1
    })
    print(f"响应: {response2.json()}")
    
    time.sleep(1)
    
    print(f"\n3. 第三轮对话（同一用户，同一会话）")
    response3 = requests.post(f"{BASE_URL}/chat", json={
        "user_id": user_id,
        "text": "这道题的标签是什么？",
        "session_id": session_id_1
    })
    print(f"响应: {response3.json()}")
    
    print(f"\n4. 查看用户会话列表")
    sessions = requests.get(f"{BASE_URL}/sessions", params={"user_id": user_id})
    print(f"会话列表: {sessions.json()}")
    
    return session_id_1

def test_multi_user_isolation():
    """测试多用户隔离功能"""
    print("\n=== 测试多用户隔离 ===")
    
    user_1 = "test_user_1"
    user_2 = "test_user_2"
    
    print(f"\n1. 用户1对话")
    response1 = requests.post(f"{BASE_URL}/chat", json={
        "user_id": user_1,
        "text": "我想学动态规划"
    })
    print(f"用户1响应: {response1.json()}")
    session_1 = response1.json()["data"]["session_id"]
    
    time.sleep(1)
    
    print(f"\n2. 用户2对话")
    response2 = requests.post(f"{BASE_URL}/chat", json={
        "user_id": user_2,
        "text": "我想学链表"
    })
    print(f"用户2响应: {response2.json()}")
    session_2 = response2.json()["data"]["session_id"]
    
    time.sleep(1)
    
    print(f"\n3. 用户1继续对话（应该记住动态规划）")
    response3 = requests.post(f"{BASE_URL}/chat", json={
        "user_id": user_1,
        "text": "推荐一道入门题",
        "session_id": session_1
    })
    print(f"用户1响应: {response3.json()}")
    
    time.sleep(1)
    
    print(f"\n4. 用户2继续对话（应该记住链表）")
    response4 = requests.post(f"{BASE_URL}/chat", json={
        "user_id": user_2,
        "text": "推荐一道入门题",
        "session_id": session_2
    })
    print(f"用户2响应: {response4.json()}")
    
    print(f"\n5. 验证会话隔离")
    sessions_1 = requests.get(f"{BASE_URL}/sessions", params={"user_id": user_1})
    sessions_2 = requests.get(f"{BASE_URL}/sessions", params={"user_id": user_2})
    print(f"用户1的会话: {sessions_1.json()}")
    print(f"用户2的会话: {sessions_2.json()}")

def test_new_session():
    """测试创建新会话"""
    print("\n=== 测试创建新会话 ===")
    
    user_id = "test_user_3"
    
    print(f"\n1. 创建第一个会话")
    response1 = requests.post(f"{BASE_URL}/chat/new", json={
        "user_id": user_id,
        "text": "我想学字符串"
    })
    print(f"响应: {response1.json()}")
    session_1 = response1.json()["data"]["session_id"]
    
    time.sleep(1)
    
    print(f"\n2. 在第一个会话中继续对话")
    response2 = requests.post(f"{BASE_URL}/chat", json={
        "user_id": user_id,
        "text": "推荐一道题",
        "session_id": session_1
    })
    print(f"响应: {response2.json()}")
    
    time.sleep(1)
    
    print(f"\n3. 创建第二个会话（新话题）")
    response3 = requests.post(f"{BASE_URL}/chat/new", json={
        "user_id": user_id,
        "text": "我想学图论"
    })
    print(f"响应: {response3.json()}")
    session_2 = response3.json()["data"]["session_id"]
    
    time.sleep(1)
    
    print(f"\n4. 在第二个会话中继续对话")
    response4 = requests.post(f"{BASE_URL}/chat", json={
        "user_id": user_id,
        "text": "推荐一道题",
        "session_id": session_2
    })
    print(f"响应: {response4.json()}")
    
    print(f"\n5. 查看用户所有会话")
    sessions = requests.get(f"{BASE_URL}/sessions", params={"user_id": user_id})
    print(f"会话列表: {sessions.json()}")

def test_session_management():
    """测试会话管理功能"""
    print("\n=== 测试会话管理 ===")
    
    user_id = "test_user_4"
    
    print(f"\n1. 创建会话并对话")
    response1 = requests.post(f"{BASE_URL}/chat/new", json={
        "user_id": user_id,
        "text": "我想学递归"
    })
    session_id = response1.json()["data"]["session_id"]
    print(f"会话ID: {session_id}")
    
    time.sleep(1)
    
    print(f"\n2. 继续对话")
    response2 = requests.post(f"{BASE_URL}/chat", json={
        "user_id": user_id,
        "text": "推荐一道题",
        "session_id": session_id
    })
    print(f"响应: {response2.json()}")
    
    time.sleep(1)
    
    print(f"\n3. 清空会话历史")
    response3 = requests.post(f"{BASE_URL}/session/{session_id}/clear", params={"user_id": user_id})
    print(f"响应: {response3.json()}")
    
    time.sleep(1)
    
    print(f"\n4. 清空后继续对话（应该没有历史）")
    response4 = requests.post(f"{BASE_URL}/chat", json={
        "user_id": user_id,
        "text": "推荐一道题",
        "session_id": session_id
    })
    print(f"响应: {response4.json()}")
    
    time.sleep(1)
    
    print(f"\n5. 删除会话")
    response5 = requests.delete(f"{BASE_URL}/session/{session_id}", params={"user_id": user_id})
    print(f"响应: {response5.json()}")
    
    print(f"\n6. 查看会话列表（应该为空）")
    sessions = requests.get(f"{BASE_URL}/sessions", params={"user_id": user_id})
    print(f"会话列表: {sessions.json()}")

if __name__ == "__main__":
    print("开始测试多轮对话和多用户隔离功能...")
    print("请确保服务已启动: python main.py")
    
    try:
        test_multi_turn_conversation()
        test_multi_user_isolation()
        test_new_session()
        test_session_management()
        
        print("\n=== 所有测试完成 ===")
    except Exception as e:
        print(f"\n测试失败: {e}")
        print("请确保服务已启动: python main.py")
