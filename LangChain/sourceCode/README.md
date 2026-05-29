export OPENAI_API_KEY= ''


# langChain rag ragFlow

## rag
一种业务模式 知识库  加载文档 分片 向量化 入库 检索 生成的过程
## ragFlow
1. 用python实现在这个rag过程 RAG工作流
2. 开源项目https://rag.docs-hub.com/html/ragflow.html，实现RAG工作流
这个开源项目在实现RAG工作流的时候使用到了langChain这个框架

# 消息类型有两套类型
openai的消息，角色
{"role": "system", "content": msg} 系统是你给ai的人设 这是一个解决什么样问题的AI
{"role": "user", "content": msg}
{"role": "assistant", "content": msg}

langchain 消息类型
AIMessage ai
HumanMessage human 
SystemMessage system


AIMessage ai => {"role": "assistant", "content": msg}
HumanMessage human =>{"role": "user", "content": msg}
SystemMessage system=>{"role": "system", "content": msg}

每一次向AI发的都是全量的messages
所以说如果messages太多会有两个问题
1.token消耗过多
2.会导致AI不支持过高的上下文，会忘记前面的内容

所以正是因为AI有这样的缺陷，所以才会有了RAG

AI对上下文开头和结尾内容比较敏感，对中间内容可能会忽略 


type在langchain表示消息的角色

role在调用AI接口的时候表示消息角色




pip install modelscope

modelscope download --model sentence-transformers/all-MiniLM-L6-v2
modelscope download --model sentence-transformers/all-MiniLM-L6-v2  --local_dir ./models/all-MiniLM-L6-v2

余弦相似度：看方向，越大越像（0-1）


L2距离：    看远近，越小越像（0-∞）
余弦距离：   是1减相似度，越小越像



## 总结
- ChromaDB里检索返回的是距离，这个距离是做了归一化的，范围0到1，越小越相似
- langchain里有相关性分数，范围是0到1，越大越相似，0是最不相似，1是最相似


def similarity_search_with_relevance_scores
"""Return docs and relevance scores in the range `[0, 1]`.
 `0` is dissimilar, `1` is most similar.

relevance_score_fn = self._select_relevance_score_fn()
docs_and_scores = self.similarity_search_with_score(query, k, **kwargs)
return [(doc, relevance_score_fn(score)) for doc, score in docs_and_scores]


 if distance == "cosine":
            return self._cosine_relevance_score_fn
 def _cosine_relevance_score_fn(distance: float) -> float:
        """Normalize the distance to a score on a scale [0, 1]."""
        return 1.0 - distance            

flask+mysql rag

