# from langchain_core.prompts import PromptTemplate, FewShotPromptTemplate
# from langchain_core.example_selectors import BaseExampleSelector
# from langchain_openai import ChatOpenAI
import re
import jieba
from smartchain.prompts import PromptTemplate, FewShotPromptTemplate
from smartchain.chat_models import ChatOpenAI
from smartchain.example_selectors import BaseExampleSelector


class KeywordExampleSelector(BaseExampleSelector):
    def __init__(self, examples, k=3, input_key: str = "question", min_keyword_match=1):
        self.examples = examples
        self.k = k
        # 指定比较的字段
        self.input_key = input_key
        self.min_keyword_match = min_keyword_match

    def add_example(self, example: dict[str, str]):
        pass

    def _extract_keywords(self, text):
        keywords = set()
        words = jieba.cut(text)
        for word in words:
            word = word.strip()
            if not word:
                continue
            # 中文关键词，必须全是中文并且长度大于1
            if re.match(r"^[\4e00-\u9fa5]+$", word):
                if len(word) > 1:
                    keywords.add(word)
            # 如果是英文关键词，则转小写后加入
            elif re.match(r"^[a-zA-Z]+$", word):
                keywords.add(word.lower())
        return keywords

    def _calculate_match_score(self, input_text, example_text):
        input_keywords = self._extract_keywords(input_text)
        example_keywords = self._extract_keywords(example_text)
        return len(input_keywords & example_keywords)

    def select_examples(self, input_variables):
        # 获取输入的值 手机没信号怎么办？
        input_text = input_variables.get(self.input_key, "")
        # 如果输入为空，则直接返回前K的示例
        if not input_text:
            return self.examples[: self.k]
        scored_examples = []
        for example in self.examples:
            example_text = example.get(self.input_key, "")  # 今天天气怎么样？
            # 计算匹配的分数
            score = self._calculate_match_score(input_text, example_text)
            # 如果分数满足最小的关键词匹配阈值，收集该示例
            if score >= self.min_keyword_match:
                scored_examples.append((score, example))
        # 列表中的样例按分数倒序排列
        scored_examples.sort(key=lambda x: x[0], reverse=True)
        #  只取前K个分数最高的样例
        selected_examples = [example for _, example in scored_examples[: self.k]]
        #  如果选出来的样例不足K个，则补齐其它的未选中的样例
        if len(selected_examples) < self.k:
            # 获取未选中的样式
            remaining_examples = [
                example for example in self.examples if example not in selected_examples
            ]
            # 向选中的样例中添加样例
            selected_examples.extend(
                remaining_examples[: self.k - len(selected_examples)]
            )
        return selected_examples


# 创建示例列表，每个包含'question'和'answer'
examples = [
    {"question": "今天天气怎么样？", "answer": "今天天气晴朗，适合出门活动。"},
    {
        "question": "怎么做西红柿炒鸡蛋？",
        "answer": "先把西红柿和鸡蛋切好，鸡蛋炒熟后盛出，再炒西红柿，最后把鸡蛋倒回去一起炒匀即可。",
    },
    {
        "question": "如何快速减肥？",
        "answer": "合理饮食结合锻炼，每天保持运动，避免高热量食物。",
    },
    {"question": "手机没电了怎么办？", "answer": "用充电器充电，或者借用移动电源。"},
    {"question": "头疼该怎么办？", "answer": "多休息，如果严重可以适当吃点止痛药。"},
    {"question": "怎样养护盆栽？", "answer": "定期浇水，保持阳光，不要积水。"},
    {
        "question": "想学英语怎么入门？",
        "answer": "可以先从背单词、学基础语法和多听多说开始。",
    },
    {
        "question": "晚上失眠怎么办？",
        "answer": "睡前放松，避免咖啡因，可以听点轻音乐帮助入睡。",
    },
    {
        "question": "烧水壶如何清理水垢？",
        "answer": "可以倒入一点醋和水煮几分钟，再用清水冲洗干净。",
    },
    {
        "question": "手机上怎么截图？",
        "answer": "可以同时按住电源键和音量减键进行截图，不同手机略有区别。",
    },
]

# 创建示例输出格式模板
example_prompt = PromptTemplate.from_template("问题：{question}\n答案：{answer}")

# 创建基于关键词的示例选择器
keyword_selector = KeywordExampleSelector(
    examples=examples,
    k=3,
    input_key="question",
    min_keyword_match=1,
)

# 创建 FewShotPromptTemplate，其中 example_selector 使用自定义的 keyword_selector
few_shot_prompt = FewShotPromptTemplate(
    example_prompt=example_prompt,
    prefix="你是一个乐于助人的生活小助手。以下是一些建议示例：",
    suffix="问题：{question}\n答案：",
    # examples=examples,
    example_selector=keyword_selector,  # 使用自定义选择器
)

# 用户输入的问题
user_question = "手机没信号怎么办？"
# 格式化出带有示例和用户问题的完整提示词 {question：user_question}
formatted = few_shot_prompt.format(question=user_question)
# 打印生成的提示词文本
print(formatted)

# 初始化 ChatOpenAI，指定模型为 gpt-4o
llm = ChatOpenAI(model="gpt-4o")
# 执行 LLM 推理并获得回复
result = llm.invoke(formatted)
# 打印 AI 回复内容
print("AI 回复：")
print(result.content)
