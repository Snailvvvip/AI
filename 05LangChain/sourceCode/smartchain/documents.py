from typing import Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class Document:
    page_content: str = ""  # 文档的内容
    metadata: Dict[str, Any] = field(default_factory=dict)
    id: Optional[None] = None
    embedding_value: Optional[None] = None
