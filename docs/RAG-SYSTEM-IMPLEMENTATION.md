# RAG System Implementation Guide

> **Status**: ✅ Production Ready
> **Last Updated**: 2026-02-09
> **Related Issues**: ROOSE-45

## Overview

Enterprise RAG (Retrieval-Augmented Generation) system: unified knowledge base (codebase + docs + NotebookLM), hybrid search (BM25 + vector), re-ranking, en production deployment.

**Architecture**:
- **Knowledge Sources**: GitHub repos, Markdown docs, NotebookLM, Obsidian vaults
- **Vector Database**: Qdrant (self-hosted), Pinecone, Weaviate
- **Embeddings**: OpenAI text-embedding-3, Cohere embed-v3, local (sentence-transformers)
- **Hybrid Search**: BM25 (keyword) + cosine similarity (semantic)
- **Re-ranking**: Cohere Rerank, cross-encoder models
- **Evaluation**: NDCG@k, MRR, retrieval accuracy

---

## Table of Contents

1. [RAG Architecture Patterns](#1-rag-architecture-patterns)
2. [Vector Database Setup](#2-vector-database-setup)
3. [Embedding Strategies](#3-embedding-strategies)
4. [Knowledge Base Ingestion](#4-knowledge-base-ingestion)
5. [Hybrid Search Implementation](#5-hybrid-search-implementation)
6. [Re-ranking Models](#6-re-ranking-models)
7. [Evaluation Metrics](#7-evaluation-metrics)
8. [Production Deployment](#8-production-deployment)
9. [Cost Optimization](#9-cost-optimization)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. RAG Architecture Patterns

### 1.1 Basic RAG Flow

```
User Query
    ↓
Query Embedding
    ↓
Vector Search (top-k)
    ↓
Context Retrieval
    ↓
Prompt + Context → LLM
    ↓
Response
```

### 1.2 Advanced RAG (Hybrid + Re-ranking)

```
User Query
    ↓
    ├─ BM25 Search (keyword) ──→ Results A
    └─ Vector Search (semantic) → Results B
            ↓
    Merge + Deduplicate (RRF)
            ↓
    Re-ranking Model
            ↓
    Top-k Results
            ↓
    Context Injection → LLM
            ↓
    Response + Citations
```

### 1.3 Component Stack

| Component | Options | Recommendation |
|-----------|---------|----------------|
| **Vector DB** | Qdrant, Pinecone, Weaviate, ChromaDB | Qdrant (self-hosted, open source) |
| **Embeddings** | OpenAI, Cohere, Sentence-Transformers | OpenAI text-embedding-3-small (cost/quality) |
| **BM25** | Whoosh, rank-bm25, Lucene | rank-bm25 (Python, simple) |
| **Re-ranker** | Cohere Rerank, cross-encoder | Cohere Rerank v3 (best quality) |
| **Chunking** | LangChain, LlamaIndex, custom | LangChain RecursiveCharacterTextSplitter |

---

## 2. Vector Database Setup

### 2.1 Qdrant (Self-Hosted)

**Docker Compose** (`docker-compose.qdrant.yml`):

```yaml
version: '3.9'

services:
  qdrant:
    image: qdrant/qdrant:v1.7.4
    container_name: qdrant
    restart: unless-stopped

    ports:
      - "6333:6333"  # HTTP API
      - "6334:6334"  # gRPC API

    volumes:
      - qdrant-storage:/qdrant/storage

    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2'
        reservations:
          memory: 2G
          cpus: '1'

volumes:
  qdrant-storage:
    driver: local
```

**Start Qdrant**:
```bash
docker compose -f docker-compose.qdrant.yml up -d
```

**Python Client**:

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# Connect
client = QdrantClient(host="localhost", port=6333)

# Create collection
client.create_collection(
    collection_name="knowledge_base",
    vectors_config=VectorParams(
        size=1536,  # OpenAI text-embedding-3-small dimension
        distance=Distance.COSINE
    )
)

# Insert vectors
points = [
    PointStruct(
        id=1,
        vector=[0.1, 0.2, ...],  # 1536 dimensions
        payload={
            "text": "Content chunk",
            "source": "docs/README.md",
            "metadata": {"type": "markdown", "section": "Installation"}
        }
    )
]

client.upsert(
    collection_name="knowledge_base",
    points=points
)

# Search
results = client.search(
    collection_name="knowledge_base",
    query_vector=[0.1, 0.2, ...],
    limit=10
)
```

### 2.2 Pinecone (Managed)

```python
from pinecone import Pinecone, ServerlessSpec

# Initialize
pc = Pinecone(api_key="YOUR_API_KEY")

# Create index
pc.create_index(
    name="knowledge-base",
    dimension=1536,
    metric="cosine",
    spec=ServerlessSpec(
        cloud="aws",
        region="us-east-1"
    )
)

# Connect to index
index = pc.Index("knowledge-base")

# Upsert vectors
index.upsert(
    vectors=[
        {
            "id": "doc1",
            "values": [0.1, 0.2, ...],
            "metadata": {"text": "Content", "source": "docs/README.md"}
        }
    ]
)

# Query
results = index.query(
    vector=[0.1, 0.2, ...],
    top_k=10,
    include_metadata=True
)
```

---

## 3. Embedding Strategies

### 3.1 OpenAI Embeddings (Recommended)

```python
from openai import OpenAI
import os

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def get_embeddings(texts: list[str], model: str = "text-embedding-3-small") -> list[list[float]]:
    """Generate embeddings for multiple texts."""
    response = client.embeddings.create(
        model=model,
        input=texts
    )
    return [item.embedding for item in response.data]

# Batch processing (max 2048 texts per request)
chunks = ["chunk 1", "chunk 2", ...]
embeddings = get_embeddings(chunks)

# Cost: $0.00002 per 1K tokens (text-embedding-3-small)
```

**Model Comparison**:

| Model | Dimensions | Cost (per 1M tokens) | Performance |
|-------|------------|----------------------|-------------|
| text-embedding-3-small | 1536 | $0.02 | ⭐⭐⭐⭐ Good |
| text-embedding-3-large | 3072 | $0.13 | ⭐⭐⭐⭐⭐ Best |
| text-embedding-ada-002 | 1536 | $0.10 | ⭐⭐⭐ Legacy |

### 3.2 Cohere Embeddings

```python
import cohere

co = cohere.Client(api_key="YOUR_API_KEY")

def get_cohere_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings with Cohere embed-v3."""
    response = co.embed(
        texts=texts,
        model="embed-english-v3.0",
        input_type="search_document"  # or "search_query"
    )
    return response.embeddings

# For queries, use input_type="search_query"
query_embedding = get_cohere_embeddings(["user query"], input_type="search_query")[0]
```

### 3.3 Local Embeddings (sentence-transformers)

```python
from sentence_transformers import SentenceTransformer

# Load model (downloads ~420MB first time)
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_local_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings locally (no API cost)."""
    embeddings = model.encode(texts, convert_to_numpy=True)
    return embeddings.tolist()

# Dimension: 384 (smaller than OpenAI)
# Speed: ~500 texts/second on CPU
# Cost: $0 (runs locally)
```

---

## 4. Knowledge Base Ingestion

### 4.1 Chunking Strategy

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """Split text into overlapping chunks."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    return splitter.split_text(text)

# Example
document = "Long document text..."
chunks = chunk_text(document, chunk_size=1000, chunk_overlap=200)
```

**Chunk Size Guidelines**:

| Content Type | Chunk Size | Overlap | Rationale |
|--------------|------------|---------|-----------|
| **Code** | 500-800 | 100 | Functions/classes should fit |
| **Documentation** | 1000-1500 | 200 | Complete paragraphs |
| **Long-form** | 1500-2000 | 300 | Context preservation |
| **Chat logs** | 300-500 | 50 | Message boundaries |

### 4.2 Codebase Ingestion

```python
import os
from pathlib import Path

def ingest_codebase(repo_path: str, extensions: list[str] = [".py", ".js", ".ts", ".md"]):
    """Ingest code files from repository."""
    documents = []

    for ext in extensions:
        for file_path in Path(repo_path).rglob(f"*{ext}"):
            # Skip common directories
            if any(skip in str(file_path) for skip in ["node_modules", ".git", "dist", "build"]):
                continue

            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            # Chunk code
            chunks = chunk_text(content, chunk_size=800, chunk_overlap=100)

            for i, chunk in enumerate(chunks):
                documents.append({
                    "text": chunk,
                    "source": str(file_path),
                    "chunk_id": i,
                    "type": "code",
                    "language": ext[1:]  # Remove dot
                })

    return documents

# Usage
docs = ingest_codebase("~/Development/products/vino12")
print(f"Ingested {len(docs)} code chunks")
```

### 4.3 Markdown Ingestion

```python
def ingest_markdown(docs_dir: str):
    """Ingest markdown documentation."""
    documents = []

    for md_file in Path(docs_dir).rglob("*.md"):
        with open(md_file, "r") as f:
            content = f.read()

        # Extract headers for metadata
        lines = content.split("\n")
        current_section = "Introduction"
        for line in lines:
            if line.startswith("# "):
                current_section = line[2:].strip()

        chunks = chunk_text(content, chunk_size=1500, chunk_overlap=300)

        for i, chunk in enumerate(chunks):
            documents.append({
                "text": chunk,
                "source": str(md_file),
                "chunk_id": i,
                "type": "markdown",
                "section": current_section
            })

    return documents
```

### 4.4 Batch Embedding + Indexing

```python
from tqdm import tqdm

def build_index(documents: list[dict], collection_name: str = "knowledge_base"):
    """Build vector index from documents."""
    # Generate embeddings in batches
    batch_size = 100
    all_embeddings = []

    for i in tqdm(range(0, len(documents), batch_size), desc="Generating embeddings"):
        batch = documents[i:i+batch_size]
        texts = [doc["text"] for doc in batch]
        embeddings = get_embeddings(texts)
        all_embeddings.extend(embeddings)

    # Insert into Qdrant
    points = []
    for idx, (doc, embedding) in enumerate(zip(documents, all_embeddings)):
        points.append(PointStruct(
            id=idx,
            vector=embedding,
            payload=doc
        ))

    # Batch upsert
    client.upsert(
        collection_name=collection_name,
        points=points,
        wait=True
    )

    print(f"✅ Indexed {len(documents)} documents")

# Usage
all_docs = ingest_codebase("~/repo") + ingest_markdown("~/repo/docs")
build_index(all_docs)
```

---

## 5. Hybrid Search Implementation

### 5.1 BM25 Keyword Search

```python
from rank_bm25 import BM25Okapi
import numpy as np

class HybridSearch:
    def __init__(self, documents: list[dict]):
        self.documents = documents

        # Build BM25 index
        tokenized_corpus = [doc["text"].lower().split() for doc in documents]
        self.bm25 = BM25Okapi(tokenized_corpus)

    def bm25_search(self, query: str, top_k: int = 20) -> list[tuple[int, float]]:
        """Keyword search using BM25."""
        tokenized_query = query.lower().split()
        scores = self.bm25.get_scores(tokenized_query)

        # Get top-k indices
        top_indices = np.argsort(scores)[::-1][:top_k]
        results = [(idx, scores[idx]) for idx in top_indices]

        return results

    def vector_search(self, query: str, top_k: int = 20) -> list[tuple[int, float]]:
        """Semantic search using vector similarity."""
        # Get query embedding
        query_embedding = get_embeddings([query])[0]

        # Search Qdrant
        results = client.search(
            collection_name="knowledge_base",
            query_vector=query_embedding,
            limit=top_k
        )

        # Return (index, score) tuples
        return [(r.id, r.score) for r in results]

    def hybrid_search(
        self,
        query: str,
        top_k: int = 10,
        alpha: float = 0.5  # Weight: 0=BM25 only, 1=vector only
    ) -> list[dict]:
        """Combine BM25 and vector search using RRF (Reciprocal Rank Fusion)."""
        # Get results from both methods
        bm25_results = self.bm25_search(query, top_k=50)
        vector_results = self.vector_search(query, top_k=50)

        # Reciprocal Rank Fusion
        rrf_scores = {}
        k = 60  # RRF constant

        for rank, (idx, score) in enumerate(bm25_results, start=1):
            rrf_scores[idx] = rrf_scores.get(idx, 0) + (1 - alpha) / (k + rank)

        for rank, (idx, score) in enumerate(vector_results, start=1):
            rrf_scores[idx] = rrf_scores.get(idx, 0) + alpha / (k + rank)

        # Sort by RRF score
        sorted_indices = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]

        # Return documents with scores
        results = []
        for idx, score in sorted_indices:
            doc = self.documents[idx].copy()
            doc["score"] = score
            results.append(doc)

        return results

# Usage
searcher = HybridSearch(all_docs)
results = searcher.hybrid_search("How do I implement JWT authentication?", top_k=5)

for r in results:
    print(f"[{r['score']:.3f}] {r['source']}: {r['text'][:100]}...")
```

---

## 6. Re-ranking Models

### 6.1 Cohere Rerank (Recommended)

```python
import cohere

co = cohere.Client(api_key="YOUR_API_KEY")

def rerank_results(query: str, results: list[dict], top_k: int = 5) -> list[dict]:
    """Re-rank search results using Cohere Rerank v3."""
    # Extract texts
    documents = [r["text"] for r in results]

    # Rerank
    reranked = co.rerank(
        model="rerank-english-v3.0",
        query=query,
        documents=documents,
        top_n=top_k
    )

    # Map back to original documents
    reranked_results = []
    for item in reranked.results:
        doc = results[item.index].copy()
        doc["rerank_score"] = item.relevance_score
        reranked_results.append(doc)

    return reranked_results

# Usage
hybrid_results = searcher.hybrid_search("JWT authentication", top_k=20)
final_results = rerank_results("JWT authentication", hybrid_results, top_k=5)
```

**Cost**: $1.00 per 1M searches (very affordable)

### 6.2 Cross-Encoder (Local)

```python
from sentence_transformers import CrossEncoder

# Load model
cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def rerank_local(query: str, results: list[dict], top_k: int = 5) -> list[dict]:
    """Re-rank using local cross-encoder."""
    # Create query-document pairs
    pairs = [(query, r["text"]) for r in results]

    # Score all pairs
    scores = cross_encoder.predict(pairs)

    # Sort by score
    ranked_indices = np.argsort(scores)[::-1][:top_k]

    reranked_results = []
    for idx in ranked_indices:
        doc = results[idx].copy()
        doc["rerank_score"] = float(scores[idx])
        reranked_results.append(doc)

    return reranked_results
```

---

## 7. Evaluation Metrics

### 7.1 Retrieval Accuracy

```python
def calculate_retrieval_metrics(
    retrieved: list[str],
    relevant: list[str],
    k: int = 5
) -> dict:
    """Calculate precision@k, recall@k, NDCG@k, MRR."""
    retrieved_set = set(retrieved[:k])
    relevant_set = set(relevant)

    # Precision@k
    precision = len(retrieved_set & relevant_set) / k

    # Recall@k
    recall = len(retrieved_set & relevant_set) / len(relevant_set) if relevant_set else 0

    # NDCG@k (Normalized Discounted Cumulative Gain)
    dcg = 0
    for i, doc_id in enumerate(retrieved[:k], start=1):
        if doc_id in relevant_set:
            dcg += 1 / np.log2(i + 1)

    # Ideal DCG (all relevant docs at top)
    ideal_dcg = sum(1 / np.log2(i + 2) for i in range(min(len(relevant_set), k)))
    ndcg = dcg / ideal_dcg if ideal_dcg > 0 else 0

    # MRR (Mean Reciprocal Rank)
    mrr = 0
    for i, doc_id in enumerate(retrieved[:k], start=1):
        if doc_id in relevant_set:
            mrr = 1 / i
            break

    return {
        "precision@k": precision,
        "recall@k": recall,
        "ndcg@k": ndcg,
        "mrr": mrr
    }

# Example
retrieved_docs = ["doc1", "doc5", "doc2", "doc8", "doc3"]
relevant_docs = ["doc2", "doc3", "doc7"]

metrics = calculate_retrieval_metrics(retrieved_docs, relevant_docs, k=5)
print(f"Precision@5: {metrics['precision@k']:.2f}")
print(f"NDCG@5: {metrics['ndcg@k']:.2f}")
```

### 7.2 Evaluation Dataset

```jsonl
{"query": "How do I implement JWT authentication?", "relevant_docs": ["docs/auth.md#jwt", "src/auth/jwt.ts"]}
{"query": "What's the database schema for users?", "relevant_docs": ["docs/database.md#users", "src/models/user.ts"]}
```

---

## 8. Production Deployment

### 8.1 Complete RAG API

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="RAG API")

class Query(BaseModel):
    query: str
    top_k: int = 5
    use_rerank: bool = True

class RAGResponse(BaseModel):
    answer: str
    sources: list[dict]
    latency_ms: float

@app.post("/search", response_model=RAGResponse)
async def search(request: Query):
    """RAG search endpoint."""
    import time
    start = time.time()

    # 1. Hybrid search
    results = searcher.hybrid_search(request.query, top_k=20)

    # 2. Re-rank (optional)
    if request.use_rerank:
        results = rerank_results(request.query, results, top_k=request.top_k)
    else:
        results = results[:request.top_k]

    # 3. Generate answer with LLM
    context = "\n\n".join([f"Source: {r['source']}\n{r['text']}" for r in results])

    prompt = f"""Answer the question using ONLY the context below. Cite sources.

Context:
{context}

Question: {request.query}

Answer:"""

    # Call LLM (Anthropic Claude)
    from anthropic import Anthropic
    client = Anthropic()

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )

    answer = response.content[0].text
    latency = (time.time() - start) * 1000

    return RAGResponse(
        answer=answer,
        sources=[{"source": r["source"], "score": r.get("rerank_score", r["score"])} for r in results],
        latency_ms=latency
    )

# Run: uvicorn rag_api:app --host 0.0.0.0 --port 8000
```

### 8.2 Docker Deployment

```yaml
# docker-compose.yml
version: '3.9'

services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant-data:/qdrant/storage

  rag-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - COHERE_API_KEY=${COHERE_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - QDRANT_HOST=qdrant
      - QDRANT_PORT=6333
    depends_on:
      - qdrant

volumes:
  qdrant-data:
```

---

## 9. Cost Optimization

### 9.1 Embedding Cost Comparison

**1M documents, 1K tokens/doc, re-indexed monthly**:

| Provider | Model | Cost/Month |
|----------|-------|------------|
| OpenAI | text-embedding-3-small | $20 |
| OpenAI | text-embedding-3-large | $130 |
| Cohere | embed-english-v3.0 | $100 |
| Local | sentence-transformers | $0 (GPU: ~$50) |

**Recommendation**: OpenAI text-embedding-3-small (best cost/quality)

### 9.2 Re-ranking Cost

**100K queries/month, top-20 results each**:

| Provider | Cost/Month |
|----------|------------|
| Cohere Rerank v3 | $2 |
| Local cross-encoder | $0 (CPU sufficient) |

**Recommendation**: Cohere Rerank v3 (negligible cost, best quality)

---

## 10. Troubleshooting

### Common Issues

#### Low Retrieval Accuracy

**Solutions**:
1. Improve chunking (smaller chunks for code, larger for docs)
2. Add metadata filtering (source type, language)
3. Tune hybrid search alpha (try 0.3-0.7)
4. Enable re-ranking

#### Slow Query Latency

**Solutions**:
1. Reduce top_k in hybrid search (20 → 10)
2. Cache embeddings for common queries
3. Use faster embedding model (small vs large)
4. Enable Qdrant quantization

---

## Implementation Roadmap

### Week 1-2: Index Creation

- [ ] Setup Qdrant (Docker)
- [ ] Ingest codebase (GitHub repos)
- [ ] Ingest documentation (Markdown)
- [ ] Generate embeddings (batch)
- [ ] Build vector index

### Week 3: Search Implementation

- [ ] Implement BM25 keyword search
- [ ] Implement vector semantic search
- [ ] Build hybrid search (RRF)
- [ ] Add Cohere re-ranking

### Week 4: Integration & Evaluation

- [ ] Build FastAPI endpoint
- [ ] Create evaluation dataset
- [ ] Measure retrieval metrics
- [ ] Deploy to production

---

## Resources

- **RAG Papers**: https://arxiv.org/abs/2005.11401
- **Qdrant Docs**: https://qdrant.tech/documentation/
- **LangChain RAG**: https://python.langchain.com/docs/use_cases/question_answering/
- **Cohere Rerank**: https://docs.cohere.com/reference/rerank

---

## Quick Reference

```bash
# Start Qdrant
docker compose -f docker-compose.qdrant.yml up -d

# Build index
python scripts/build_index.py --source ~/repo

# Run API
uvicorn rag_api:app --reload

# Test search
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "How to implement JWT?", "top_k": 5}'
```

---

**Ready to build RAG?** Start bij [Section 2: Vector Database Setup](#2-vector-database-setup) 🚀
