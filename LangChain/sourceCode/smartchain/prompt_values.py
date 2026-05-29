from abc import ABC, abstractmethod


class PromptValue(ABC):
    @abstractmethod
    def to_string():
        pass


class StringPromptValue(PromptValue):
    def __init__(self, text):
        self.text = text

    def to_string(self):
        return self.text
