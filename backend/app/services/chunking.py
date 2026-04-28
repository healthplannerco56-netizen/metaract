import tiktoken
from typing import List

CHUNK_SIZE = 2000      # tokens
OVERLAP_RATIO = 0.10   # 10% overlap


def count_tokens(text: str, model: str = "cl100k_base") -> int:
    enc = tiktoken.get_encoding(model)
    return len(enc.encode(text))


def tokenize(text: str, model: str = "cl100k_base") -> List[int]:
    enc = tiktoken.get_encoding(model)
    return enc.encode(text)


def decode_tokens(tokens: List[int], model: str = "cl100k_base") -> str:
    enc = tiktoken.get_encoding(model)
    return enc.decode(tokens)


def chunk_text(text: str) -> List[dict]:
    """
    Split text into overlapping chunks of ~2000 tokens with 10% overlap.
    Returns list of dicts with 'content' and 'token_count'.
    """
    tokens = tokenize(text)
    total = len(tokens)

    if total == 0:
        return []

    overlap = int(CHUNK_SIZE * OVERLAP_RATIO)
    step = CHUNK_SIZE - overlap

    chunks = []
    start = 0
    index = 0

    while start < total:
        end = min(start + CHUNK_SIZE, total)
        chunk_tokens = tokens[start:end]
        content = decode_tokens(chunk_tokens)
        chunks.append({
            "chunk_index": index,
            "content": content,
            "token_count": len(chunk_tokens),
        })
        if end == total:
            break
        start += step
        index += 1

    return chunks
