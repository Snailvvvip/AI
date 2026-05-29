from .recursive import RecursiveCharacterTextSplitter


class MarkdownTextSplitter(RecursiveCharacterTextSplitter):
    """
    Markdown 文本分割器：专门用于分割 Markdown 文档。
    使用 Markdown 特定的分隔符，优先按标题、代码块等结构分割。
    继承自 RecursiveCharacterTextSplitter，使用递归分割策略。
    """

    # 构造函数，初始化 Markdown 文本分割器
    def __init__(self, **kwargs):
        """
        初始化 Markdown 文本分割器。
        Args:
            **kwargs: 传递给父类的参数（chunk_size, chunk_overlap 等）
        """
        # Markdown 特定的分隔符，按优先级排序
        # 优先按标题分割，然后是代码块、水平分割线、段落等
        separators = [
            "\n\n# ",  # 一级标题（前面有两个换行）
            "\n\n## ",  # 二级标题
            "\n\n### ",  # 三级标题
            "\n\n#### ",
            "\n\n##### ",  # 五级标题# 四级标题
            "\n\n###### ",  # 六级标题
            "\n```",  # 代码块开始（前面有一个换行）
            "\n---",  # 水平分割线
            "\n***",  # 水平分割线（另一种格式）
            "\n\n",  # 段落分隔（双换行）
            "\n",  # 换行
            " ",  # 空格
            "",  # 字符级别（最后的分隔符）
        ]
        # 调用父类构造函数，传入 Markdown 特定的分隔符
        super().__init__(
            separators=separators,
            keep_separator=True,  # 保留分隔符以保持 Markdown 结构
            **kwargs
        )
