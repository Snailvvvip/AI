from .base import TextSplitter
import re


# 定义递归字符文本分割器
class RecursiveCharacterTextSplitter(TextSplitter):
    """
    递归字符文本分割器：递归地尝试使用不同的分隔符来分割文本。
    它会按照分隔符列表的顺序，尝试使用每个分隔符来分割文本。
    如果某个片段仍然太大，会递归地使用下一个分隔符继续分割。
    """

    # 构造函数，初始化递归字符文本分割器
    def __init__(
        self,
        separators=None,  # 分隔符列表，默认为 ["\n\n", "\n", " ", ""]
        keep_separator=True,  # 是否保留分隔符，默认为 True
        is_separator_regex=False,  # 分隔符是否为正则表达式
        **kwargs,  # 其它参数传递给父类
    ):
        """
        初始化递归字符文本分割器。
        Args:
            separators: 分隔符列表，按优先级排序
            keep_separator: 是否保留分隔符
            is_separator_regex: 分隔符是否为正则表达式
            **kwargs: 传递给父类的其他参数（chunk_size, chunk_overlap 等）
        """
        # 初始化父类参数
        super().__init__(keep_separator=keep_separator, **kwargs)
        # 如果未提供分隔符，使用默认值
        self._separators = (
            separators if separators is not None else ["\n\n", "\n", " ", ""]
        )
        # 保存分隔符是否为正则表达式
        self._is_separator_regex = is_separator_regex

    # 递归分割文本的内部方法
    def _split_text(self, text, separators):
        """
        递归地分割文本。
        Args:
            text: 要分割的文本
            separators: 分隔符列表
        Returns:
            分割后的文本块列表
        """
        # 存储最终结果
        final_chunks = []
        # 确定要使用的分隔符
        # 默认使用最后一个分隔符（通常是空字符串，表示按字符分割）
        separator = separators[-1]
        # 存储后续要使用的分隔符
        new_separators = []
        # 遍历分隔符列表，找到第一个在文本中存在的分隔符
        for i, _s in enumerate(separators):
            # 确定分隔符模式（正则或转义）
            separator_ = _s if self._is_separator_regex else re.escape(_s)
            # 如果分隔符为空字符串，直接使用它
            if not _s:
                separator = _s
                break
            # 如果文本中存在该分隔符
            if re.search(separator_, text):
                separator = _s
                # 保存后续要使用的分隔符
                new_separators = separators[i + 1 :]
                break
        # 确定分隔符模式用于分割
        separator_ = separator if self._is_separator_regex else re.escape(separator)
        # 使用分隔符分割文本，传递 keep_separator 参数
        splits = self._split_text_with_regex(text, separator_, self._keep_separator)
        # 处理分割后的片段
        good_splits = []  # 存储长度合适的片段
        # 确定合并时使用的分隔符
        separator_ = "" if self._keep_separator else separator
        # 遍历每个分割片段
        for s in splits:
            # 如果片段长度小于 chunk_size，加入 good_splits
            if self._length_function(s) < self._chunk_size:
                good_splits.append(s)
            else:
                # 如果片段太大，先处理之前积累的 good_splits
                if good_splits:
                    # 合并 good_splits
                    merged_text = self._merge_splits(good_splits, separator_)
                    final_chunks.extend(merged_text)
                    good_splits = []
                # 如果还有后续分隔符，递归分割当前片段
                if new_separators:
                    other_info = self._split_text(s, new_separators)
                    final_chunks.extend(other_info)
                else:
                    # 如果没有后续分隔符，直接添加当前片段
                    final_chunks.append(s)
        # 处理剩余的 good_splits
        if good_splits:
            merged_text = self._merge_splits(good_splits, separator_)
            final_chunks.extend(merged_text)
        return final_chunks

    # 使用正则表达式分割文本
    def _split_text_with_regex(self, text, separator, keep_separator=False):
        """
        使用正则表达式分割文本。
        Args:
            text: 要分割的文本
            separator: 分隔符（正则表达式）
            keep_separator: 是否保留分隔符
        Returns:
            分割后的文本块列表（过滤掉空字符串）
        """
        # 如果分隔符不为空
        if separator:
            # 如果需要保留分隔符
            if keep_separator:
                # 使用括号捕获分隔符，这样分隔符会保留在结果中
                splits_ = re.split(f"({separator})", text)
                # 将分隔符和文本片段合并
                splits = []
                for i in range(0, len(splits_) - 1, 2):
                    if i + 1 < len(splits_):
                        # 将文本片段和分隔符合并
                        splits.append(splits_[i] + splits_[i + 1])
                # 处理最后一个片段（如果有）
                if len(splits_) % 2 == 1:
                    splits.append(splits_[-1])
            else:
                # 不保留分隔符，直接分割
                splits = re.split(separator, text)
        else:
            # 如果分隔符为空，将文本转换为字符列表
            splits = list(text)
        # 过滤掉空字符串
        return [s for s in splits if s]

    # 分割文本的公共方法
    def split_text(self, text):
        """
        将文本分割成多个块。
        Args:
            text: 要分割的文本
        Returns:
            文本块列表
        """
        # 调用内部递归分割方法
        return self._split_text(text, self._separators)
