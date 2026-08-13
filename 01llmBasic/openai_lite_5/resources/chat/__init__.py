from .completions import Completions


class Chat:
    def __init__(self, client) -> None:
        self.completions = Completions(client)
