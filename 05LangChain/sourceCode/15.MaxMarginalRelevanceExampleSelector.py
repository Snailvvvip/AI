# from langchain_core.prompts import PromptTemplate, FewShotPromptTemplate
# from langchain_core.example_selectors import MaxMarginalRelevanceExampleSelector
# from langchain_openai import ChatOpenAI, OpenAIEmbeddings
# from langchain_community.vectorstores import FAISS

from smartchain.prompts import PromptTemplate, FewShotPromptTemplate
from smartchain.chat_models import ChatOpenAI
from smartchain.example_selectors import MaxMarginalRelevanceExampleSelector
from smartchain.embeddings import SentenceTransformerEmbeddings
from smartchain.vectorstores import FAISS

examples = [
    {
        "question": "如何挑选新鲜的水果？",
        "answer": "观察外皮是否光滑、色泽是否自然，还可以闻闻香味，挑选表皮无破损的新鲜水果。",
    },
    {
        "question": "西瓜挑选时要注意什么？",
        "answer": "应选择西瓜纹路清晰、瓜皮发亮，敲打有清脆声音，瓜蒂卷曲、瓜底发黄的通常比较甜。",
    },
    {
        "question": "西瓜怎么挑才甜？",
        "answer": "用手轻轻拍打西瓜，发出清脆、沉闷有弹性之音的西瓜比较甜",
    },
    {
        "question": "买水果有哪些小窍门？",
        "answer": "挑选时需观察颜色、闻气味、用手掂分量。对于瓜类可以敲一敲听声音来判断成熟度。",
    },
    {
        "question": "怎样判断水果是否熟透？",
        "answer": "可以轻捏表皮，成熟的水果通常较软，闻一闻是否有浓郁的水果香味，也可以看颜色是否均匀。",
    },
    {
        "question": "西瓜的黄底有什么意义？",
        "answer": "西瓜底部颜色越黄，通常说明在田里成熟时间长，甜度更高。",
    },
    {
        "question": "挑西瓜时候能用手敲吗？",
        "answer": "可以，声音清脆表示瓜比较熟，声音沉闷的可能不太熟。",
    },
    {
        "question": "吃西瓜对健康有哪些好处？",
        "answer": "西瓜含有丰富水分和多种维生素，夏季吃可补水解暑，有利于身体健康。",
    },
    {
        "question": "水果要怎么保存更久？",
        "answer": "可存放于阴凉处，易腐水果置于冰箱冷藏，有些水果如西瓜最好切块密封保存。",
    },
    {
        "question": "哪些水果适合夏天吃？",
        "answer": "西瓜、哈密瓜、桃子、李子等含水分高的水果特别适合夏天食用。",
    },
]

# 创建格式化示例的模板（把每个示例按“问题+答案”格式化为字符串）
example_prompt = PromptTemplate.from_template("问题：{question}\n答案：{answer}")
# 创建嵌入模型，它能将文本转成向量
embeddings = SentenceTransformerEmbeddings()
# 最大边际相关性示例选择器
maxMarginalRelevanceExampleSelector = MaxMarginalRelevanceExampleSelector.from_examples(
    examples=examples,  # 全部样例列表
    embeddings=embeddings,  # 使用OpenAIEmbeddings向量化
    vectorstore_cls=FAISS,  # 使用FAISS作为向量检索数据库，类似于milvus chromadb
    k=3,  # 最终动态挑出来3个最相关的样例
    fetch_k=5,  # 初步检索5个候选，再用MMR算法找出最有代表性的K个
)

fewShotPromptTemplate = FewShotPromptTemplate(
    example_prompt=example_prompt,
    example_selector=maxMarginalRelevanceExampleSelector,
    prefix="你是一个乐于助人的生活小助手，以下是一些建议示例:",
    suffix="问题：{question}\n回答:",
)
question = "怎样挑西瓜比较甜？"
formatted_prompt = fewShotPromptTemplate.format(question=question)
print(formatted_prompt)
llm = ChatOpenAI()
result = llm.invoke(formatted_prompt)
print(result.content)
