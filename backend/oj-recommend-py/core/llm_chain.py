
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from config.settings import LLM_CONFIG
from utils.db_connector import redis_conn
from core.session_manager import session_manager
import json
from typing import List, Set, Any, Dict
_llm = None


def _get_llm():
    global _llm
    if _llm is None:
        if not LLM_CONFIG.get("api_key"):
            raise RuntimeError("DASHSCOPE_API_KEY 未配置")
        _llm = ChatOpenAI(**LLM_CONFIG)
    return _llm


prompt = ChatPromptTemplate.from_messages([
    ("system", """你是OJ智能助手，严格遵守以下规则：
1. 领域限制：仅回复计算机领域相关问题，非计算机领域问题直接回复：「我是OJ平台的智能助手，无法为您回答这个问题。」
2. 核心逻辑：
   - 场景1（刷题推荐类需求）：
     已知信息：用户刷过的题目标签为 {user_tags}，平台所有可用标签为 {all_tags}，待推荐题目列表为 {recommend_questions}（每个题目包含标签和难度）；
     第一步：分析用户水平（基础/进阶/高级）：根据用户刷过的标签复杂度、覆盖范围判断；
     第二步：推荐适配标签：结合用户水平和输入需求，给出3-5个最适合的标签；
     第三步：推荐具体题目：从待推荐题目列表中选1-3道，说明推荐理由（难度适配、标签匹配、能力提升）。
   - 场景2（通用计算机领域问题）：
     若用户需求非刷题推荐（如编程语法、算法原理、计算机基础、技术框架等），则直接针对问题给出准确、简洁、易懂的解答，无需执行刷题推荐逻辑。
3. 回复风格：友好、简洁，用中文；
   - 刷题推荐类：分点说明（先分析水平，再推荐标签，最后推荐题目）；
   - 通用计算机问题：直接解答，逻辑清晰，必要时可分点。
4. 特殊情况：若用户无刷题记录（{user_tags} 为空）且需求是刷题推荐，默认按「简单水平」推荐入门标签和题目；若需求是通用计算机问题，无需考虑刷题记录。
5. 多轮对话：根据对话历史上下文理解用户意图，保持对话连贯性（比如用户先问Python语法，再问相关刷题推荐，需衔接上下文）。"""),
    MessagesPlaceholder(variable_name="history", optional=True),
    ("user", "我的需求：{text}")

])
def recommend_questions():

    question_tag_keys = set(redis_conn.keys("question:*:tags"))
#     获取所有标签
    all_questions = []
    for key in question_tag_keys:
        question_id = int(key.split(":")[1])
        tags = list(redis_conn.smembers(key))

        all_questions.append({
            "id": question_id,
            "tags": tags
        })
    return str(all_questions)


def get_all_tags_from_redis() -> list[Any] | set[Any]:
    """
    从Redis获取所有题目标签（严格匹配init_question_tags的存储结构）
    存储结构：tag:{tag}:questions → 所以通过匹配该格式的键提取所有标签
    """
    try:
        # 查询所有标签
        tags = set(redis_conn.keys("tag:*"))
        all_tags = ""
        for tag in tags:
            v = tag.split(":")[1]
            all_tags += v + ", " if v != "" else ""

        return all_tags
    except Exception as e:
        print(f"查询所有标签失败：{e}")
        return set()

def get_llm_reply(text: str, user_tags: List[str], session_id: str = None, user_id: str = None) -> str:
    """
    生成LLM回复（支持多轮对话）
    :param text: 用户输入的话语（如："我想刷数组相关的题"）
    :param user_tags: 用户刷过的题目标签列表（如：["数组", "简单", "循环"]）
    :param session_id: 会话ID（用于多轮对话）
    :param user_id: 用户ID（用于会话管理）
    :return: LLM生成的友好回复
    """
    try:
        if not session_id:
            session_id = session_manager.get_or_create_session(user_id)

        # 根据id获取历史会话
        history_messages = session_manager.get_history(session_id)
        
        langchain_history = []
        for msg in history_messages:
            if msg["role"] == "user":
                langchain_history.append(("user", msg["content"]))
            elif msg["role"] == "assistant":
                langchain_history.append(("assistant", msg["content"]))
        
        all_tags_str = get_all_tags_from_redis()
        user_tags_str = str(user_tags)
        recommend_question = recommend_questions()

        print(f"用户标签: {user_tags}")
        print(f"所有标签: {all_tags_str}")
        print(f"对话历史: {len(langchain_history)} 条")

        prompt_inputs = {
            "text": text,
            "user_tags": user_tags_str,
            "all_tags": all_tags_str,
            "recommend_questions": recommend_question,
            "history": langchain_history
        }

        chain = prompt | _get_llm() | StrOutputParser()
        reply = chain.invoke(prompt_inputs)
        
        session_manager.add_message(session_id, "user", text, user_id)
        session_manager.add_message(session_id, "assistant", reply, user_id)
        
        return reply

    except Exception as e:
        print(f"生成LLM回复失败：{e}")
        return "抱歉，暂时无法为您推荐题目，请稍后重试。"



