# Prompt Engineering Framework

> **Status**: ✅ Production Ready
> **Last Updated**: 2026-02-09
> **Related Issues**: ROOSE-44

## Overview

Enterprise-grade prompt engineering framework: template library, version control, A/B testing, observability. Van ad-hoc prompts naar systematische optimization met data-driven decision making.

**Core Capabilities**:
- **Template System**: Reusable prompts met variables (Jinja2, Handlebars, LangChain)
- **Version Control**: Git-tracked prompts met semantic versioning + changelog
- **A/B Testing**: Statistical comparison van prompt variants
- **Evaluation Framework**: Automated scoring + human-in-the-loop
- **Observability**: LangSmith/LangFuse integration voor tracing
- **Cost Tracking**: Token usage + latency monitoring per variant

---

## Table of Contents

1. [Prompt Template System](#1-prompt-template-system)
2. [Version Control Strategy](#2-version-control-strategy)
3. [A/B Testing Framework](#3-ab-testing-framework)
4. [Evaluation Metrics](#4-evaluation-metrics)
5. [Observability Setup](#5-observability-setup)
6. [CI/CD Integration](#6-cicd-integration)
7. [Prompt Engineering Best Practices](#7-prompt-engineering-best-practices)
8. [Template Library](#8-template-library)
9. [Cost Optimization](#9-cost-optimization)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prompt Template System

### 1.1 Directory Structure

```
prompts/
├── templates/
│   ├── research/
│   │   ├── web-search.jinja2
│   │   ├── code-analysis.jinja2
│   │   └── document-summarization.jinja2
│   ├── planning/
│   │   ├── task-decomposition.jinja2
│   │   ├── architecture-design.jinja2
│   │   └── risk-assessment.jinja2
│   ├── coding/
│   │   ├── code-generation.jinja2
│   │   ├── bug-fixing.jinja2
│   │   └── refactoring.jinja2
│   └── review/
│       ├── code-review.jinja2
│       ├── documentation-review.jinja2
│       └── security-audit.jinja2
├── variants/
│   └── code-generation/
│       ├── v1-basic.jinja2
│       ├── v2-few-shot.jinja2
│       └── v3-chain-of-thought.jinja2
├── configs/
│   ├── templates.yaml
│   └── metadata.json
└── evals/
    ├── datasets/
    │   └── code-generation-truth.jsonl
    └── metrics/
        └── quality-scores.json
```

### 1.2 Template Engines

#### Option 1: Jinja2 (Recommended)

**Installation**:
```bash
pip install jinja2
```

**Example Template** (`prompts/templates/coding/code-generation.jinja2`):

```jinja2
{# Metadata #}
{# name: Code Generation - TypeScript #}
{# version: 2.1.0 #}
{# model: claude-sonnet-4-5 #}
{# temperature: 0.7 #}

You are an expert TypeScript developer. Generate clean, type-safe code based on the following specification.

## Context

{{ context | default("No additional context provided.") }}

## Requirements

{% for req in requirements %}
- {{ req }}
{% endfor %}

## Constraints

- Use TypeScript strict mode
- Follow ESLint airbnb-typescript rules
- Include JSDoc comments for public APIs
{% if use_testing %}
- Include unit tests using {{ test_framework | default("Jest") }}
{% endif %}

## Input/Output

**Input**: {{ input_description }}
**Output**: {{ output_description }}

## Example Usage

```typescript
{{ usage_example }}
```

Generate the implementation now. Return only the code, no explanations.
```

**Usage**:

```python
from jinja2 import Environment, FileSystemLoader

# Setup Jinja2 environment
env = Environment(loader=FileSystemLoader('prompts/templates'))
template = env.get_template('coding/code-generation.jinja2')

# Render prompt
prompt = template.render(
    context="Building a user authentication system",
    requirements=[
        "JWT token generation",
        "Password hashing with bcrypt",
        "Refresh token rotation"
    ],
    use_testing=True,
    test_framework="Vitest",
    input_description="User credentials (email, password)",
    output_description="JWT access token + refresh token",
    usage_example="const { accessToken, refreshToken } = await authenticate(email, password)"
)

print(prompt)
```

#### Option 2: LangChain PromptTemplate

```python
from langchain.prompts import PromptTemplate, FewShotPromptTemplate
from langchain.prompts.example_selector import SemanticSimilarityExampleSelector
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

# Basic template
template = PromptTemplate(
    input_variables=["task", "context"],
    template="""
You are a helpful AI assistant.

Task: {task}
Context: {context}

Provide a detailed, step-by-step response.
"""
)

# Few-shot template with semantic similarity
examples = [
    {
        "question": "How do I implement JWT authentication?",
        "answer": "1. Install jsonwebtoken library\n2. Create secret key\n3. Generate token on login..."
    },
    {
        "question": "What's the best way to hash passwords?",
        "answer": "Use bcrypt with cost factor 12:\n```js\nconst hash = await bcrypt.hash(password, 12)\n```"
    }
]

example_selector = SemanticSimilarityExampleSelector.from_examples(
    examples,
    OpenAIEmbeddings(),
    FAISS,
    k=2
)

few_shot_template = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=PromptTemplate(
        input_variables=["question", "answer"],
        template="Q: {question}\nA: {answer}"
    ),
    prefix="Answer the following question based on these examples:",
    suffix="Q: {input}\nA: ",
    input_variables=["input"]
)
```

### 1.3 Metadata Schema

**`prompts/configs/metadata.json`**:

```json
{
  "templates": {
    "code-generation": {
      "path": "templates/coding/code-generation.jinja2",
      "version": "2.1.0",
      "model": "claude-sonnet-4-5",
      "temperature": 0.7,
      "max_tokens": 4000,
      "category": "coding",
      "tags": ["typescript", "code-gen", "production"],
      "created_at": "2026-01-15",
      "updated_at": "2026-02-09",
      "author": "engineering-team",
      "success_rate": 0.94,
      "avg_latency_ms": 2400,
      "avg_cost_usd": 0.023
    }
  },
  "variants": {
    "code-generation-v1": {
      "template_id": "code-generation",
      "path": "variants/code-generation/v1-basic.jinja2",
      "description": "Basic zero-shot generation",
      "ab_test_active": false,
      "metrics": {
        "quality_score": 0.82,
        "cost_per_call": 0.018
      }
    },
    "code-generation-v2": {
      "template_id": "code-generation",
      "path": "variants/code-generation/v2-few-shot.jinja2",
      "description": "Few-shot with 3 examples",
      "ab_test_active": true,
      "traffic_weight": 0.5,
      "metrics": {
        "quality_score": 0.94,
        "cost_per_call": 0.023
      }
    }
  }
}
```

---

## 2. Version Control Strategy

### 2.1 Semantic Versioning

Follow SemVer for prompt templates:

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (output format, required variables)
MINOR: New features (optional variables, improved instructions)
PATCH: Bug fixes (typos, clarifications)
```

**Examples**:
- `1.0.0` → Initial release
- `1.1.0` → Added `use_testing` optional variable
- `1.1.1` → Fixed typo in example
- `2.0.0` → Changed output format (breaking change)

### 2.2 Changelog Format

**`prompts/templates/coding/CHANGELOG.md`**:

```markdown
# Changelog: Code Generation Template

All notable changes to this prompt template will be documented in this file.

## [2.1.0] - 2026-02-09

### Added
- Support for Vitest test framework (previously Jest only)
- Optional `context` variable for additional background

### Changed
- Improved TypeScript strict mode instructions
- Updated example usage to show async/await pattern

### Metrics
- Quality score: 0.94 (+0.12 from v2.0.0)
- Avg latency: 2.4s (-0.3s from v2.0.0)
- Success rate: 94% (+8% from v2.0.0)

## [2.0.0] - 2026-01-20

### Changed
- **BREAKING**: Output format now includes JSDoc comments
- **BREAKING**: Removed `simple_mode` variable

### Migration Guide
```python
# Before (v1.x)
template.render(simple_mode=True)

# After (v2.x)
# Use v1.x for simple output, or update consumers to parse JSDoc
```

## [1.1.1] - 2026-01-15

### Fixed
- Fixed typo in ESLint rule name

## [1.1.0] - 2026-01-10

### Added
- Optional `use_testing` variable
- Support for Jest test generation

## [1.0.0] - 2026-01-05

### Added
- Initial release
- TypeScript code generation with strict mode
```

### 2.3 Git Workflow

```bash
# Create feature branch for prompt improvements
git checkout -b prompt/code-generation-few-shot

# Make changes to template
vim prompts/templates/coding/code-generation.jinja2

# Update metadata
vim prompts/configs/metadata.json
# Bump version: 2.0.0 → 2.1.0

# Update changelog
vim prompts/templates/coding/CHANGELOG.md

# Commit with conventional commit format
git add .
git commit -m "feat(prompts): add few-shot examples to code generation

- Added 3 examples for TypeScript authentication patterns
- Improved quality score from 0.82 to 0.94
- Increased avg latency by 200ms (acceptable trade-off)

BREAKING CHANGE: None
Metrics: Quality +0.12, Latency +0.2s"

# Push and create PR
git push origin prompt/code-generation-few-shot
gh pr create --title "Improve code generation with few-shot learning"
```

### 2.4 Review Checklist

Before merging prompt changes:

- [ ] Version bumped correctly (SemVer)
- [ ] Changelog updated with metrics
- [ ] Metadata.json updated
- [ ] A/B test results included (if applicable)
- [ ] Breaking changes documented
- [ ] Migration guide provided (if breaking)
- [ ] Eval scores improved or justified

---

## 3. A/B Testing Framework

### 3.1 Experiment Design

```python
# ab_test_harness.py
import random
import json
from typing import Dict, List, Callable
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Variant:
    id: str
    template_path: str
    weight: float  # 0.0 to 1.0
    total_calls: int = 0
    successful_calls: int = 0
    total_latency_ms: float = 0.0
    total_cost_usd: float = 0.0

class ABTestHarness:
    def __init__(self, experiment_name: str):
        self.experiment_name = experiment_name
        self.variants: List[Variant] = []
        self.results_file = f"prompts/evals/ab-tests/{experiment_name}.jsonl"

    def add_variant(self, variant: Variant):
        """Add a variant to the A/B test."""
        self.variants.append(variant)

    def select_variant(self) -> Variant:
        """Randomly select variant based on weights."""
        weights = [v.weight for v in self.variants]
        return random.choices(self.variants, weights=weights, k=1)[0]

    def record_result(
        self,
        variant: Variant,
        success: bool,
        latency_ms: float,
        cost_usd: float,
        quality_score: float,
        metadata: Dict = None
    ):
        """Record experiment result."""
        variant.total_calls += 1
        if success:
            variant.successful_calls += 1
        variant.total_latency_ms += latency_ms
        variant.total_cost_usd += cost_usd

        # Log result
        result = {
            "timestamp": datetime.now().isoformat(),
            "experiment": self.experiment_name,
            "variant": variant.id,
            "success": success,
            "latency_ms": latency_ms,
            "cost_usd": cost_usd,
            "quality_score": quality_score,
            "metadata": metadata or {}
        }

        with open(self.results_file, 'a') as f:
            f.write(json.dumps(result) + '\n')

    def get_statistics(self) -> Dict:
        """Calculate experiment statistics."""
        stats = {}
        for variant in self.variants:
            if variant.total_calls == 0:
                continue

            stats[variant.id] = {
                "total_calls": variant.total_calls,
                "success_rate": variant.successful_calls / variant.total_calls,
                "avg_latency_ms": variant.total_latency_ms / variant.total_calls,
                "avg_cost_usd": variant.total_cost_usd / variant.total_calls
            }

        return stats

# Usage
harness = ABTestHarness("code-generation-few-shot")

# Add variants
harness.add_variant(Variant(
    id="v1-zero-shot",
    template_path="variants/code-generation/v1-basic.jinja2",
    weight=0.5
))

harness.add_variant(Variant(
    id="v2-few-shot",
    template_path="variants/code-generation/v2-few-shot.jinja2",
    weight=0.5
))

# Select variant for request
variant = harness.select_variant()

# ... execute prompt, measure results ...

# Record result
harness.record_result(
    variant=variant,
    success=True,
    latency_ms=2400,
    cost_usd=0.023,
    quality_score=0.94,
    metadata={"task": "JWT authentication"}
)

# Get stats
print(harness.get_statistics())
```

### 3.2 Statistical Significance

```python
# statistical_analysis.py
from scipy import stats
import numpy as np

def calculate_significance(
    variant_a_scores: List[float],
    variant_b_scores: List[float],
    alpha: float = 0.05
) -> Dict:
    """
    Calculate statistical significance using t-test.

    Returns:
        - p_value: Probability of observing results by chance
        - significant: True if p_value < alpha
        - effect_size: Cohen's d (small: 0.2, medium: 0.5, large: 0.8)
    """
    # Two-sample t-test
    t_statistic, p_value = stats.ttest_ind(variant_a_scores, variant_b_scores)

    # Effect size (Cohen's d)
    pooled_std = np.sqrt((np.var(variant_a_scores) + np.var(variant_b_scores)) / 2)
    effect_size = (np.mean(variant_a_scores) - np.mean(variant_b_scores)) / pooled_std

    return {
        "p_value": p_value,
        "significant": p_value < alpha,
        "effect_size": effect_size,
        "interpretation": (
            "large" if abs(effect_size) >= 0.8 else
            "medium" if abs(effect_size) >= 0.5 else
            "small" if abs(effect_size) >= 0.2 else
            "negligible"
        ),
        "winner": "A" if np.mean(variant_a_scores) > np.mean(variant_b_scores) else "B",
        "confidence": f"{(1 - p_value) * 100:.1f}%"
    }

# Example usage
v1_scores = [0.82, 0.79, 0.85, 0.81, 0.83]  # Zero-shot
v2_scores = [0.94, 0.91, 0.96, 0.93, 0.95]  # Few-shot

result = calculate_significance(v1_scores, v2_scores)
print(f"Winner: Variant {result['winner']}")
print(f"Confidence: {result['confidence']}")
print(f"Effect size: {result['interpretation']}")
# Output:
# Winner: Variant B
# Confidence: 99.8%
# Effect size: large
```

### 3.3 Automated Decision Making

```python
# auto_promote.py
def should_promote_variant(experiment_results: Dict, criteria: Dict) -> bool:
    """
    Automatically promote variant if criteria met.

    Criteria:
        - min_samples: Minimum number of calls
        - min_confidence: Minimum confidence level (e.g., 0.95)
        - min_quality_improvement: Minimum quality score improvement
        - max_cost_increase: Maximum acceptable cost increase (%)
    """
    winner = experiment_results["winner"]
    stats = experiment_results["statistics"][winner]

    checks = {
        "sufficient_samples": stats["total_calls"] >= criteria["min_samples"],
        "high_confidence": experiment_results["p_value"] < (1 - criteria["min_confidence"]),
        "quality_improved": stats["quality_improvement"] >= criteria["min_quality_improvement"],
        "cost_acceptable": stats["cost_increase_pct"] <= criteria["max_cost_increase"]
    }

    return all(checks.values())

# Example
criteria = {
    "min_samples": 100,
    "min_confidence": 0.95,
    "min_quality_improvement": 0.05,
    "max_cost_increase": 10  # 10%
}

if should_promote_variant(results, criteria):
    print("✅ Promoting variant to production")
    # Update metadata.json
    # Deploy new template
else:
    print("⏳ Continue experiment (criteria not met)")
```

---

## 4. Evaluation Metrics

### 4.1 Ground Truth Datasets

**Format** (`prompts/evals/datasets/code-generation-truth.jsonl`):

```jsonl
{"id": "cg-001", "input": {"task": "JWT auth", "language": "typescript"}, "expected_output": "import jwt from 'jsonwebtoken'...", "quality_criteria": ["uses_jwt_library", "includes_error_handling", "type_safe"]}
{"id": "cg-002", "input": {"task": "Password hashing", "language": "typescript"}, "expected_output": "import bcrypt from 'bcrypt'...", "quality_criteria": ["uses_bcrypt", "async_await", "cost_factor_12"]}
```

### 4.2 Automated Scoring

```python
# automated_eval.py
from anthropic import Anthropic
import json

client = Anthropic()

def score_output(generated_output: str, ground_truth: Dict) -> float:
    """
    Use Claude to score generated output against ground truth.

    Returns score 0.0 to 1.0
    """
    eval_prompt = f"""
You are an expert code reviewer. Score the following generated code on a scale of 0.0 to 1.0.

## Ground Truth Criteria
{json.dumps(ground_truth['quality_criteria'], indent=2)}

## Expected Output (Reference)
```typescript
{ground_truth['expected_output']}
```

## Generated Output
```typescript
{generated_output}
```

Provide a JSON response with:
- score: float between 0.0 and 1.0
- reasoning: brief explanation
- criteria_met: list of criteria that were satisfied

Return ONLY the JSON, no other text.
"""

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        temperature=0,
        messages=[{"role": "user", "content": eval_prompt}]
    )

    result = json.loads(response.content[0].text)
    return result["score"]

# Batch evaluation
def run_eval_suite(template_path: str, dataset_path: str) -> Dict:
    """Run evaluation on entire dataset."""
    with open(dataset_path) as f:
        dataset = [json.loads(line) for line in f]

    scores = []
    for example in dataset:
        # Generate output using template
        generated = generate_with_template(template_path, example["input"])

        # Score output
        score = score_output(generated, example)
        scores.append(score)

    return {
        "avg_score": sum(scores) / len(scores),
        "min_score": min(scores),
        "max_score": max(scores),
        "total_examples": len(scores)
    }
```

### 4.3 Human-in-the-Loop Evaluation

```python
# human_eval_ui.py
import streamlit as st
import json

def human_eval_interface():
    """Streamlit UI for human evaluation."""
    st.title("Prompt Output Evaluation")

    # Load eval queue
    with open("prompts/evals/human-queue.jsonl") as f:
        queue = [json.loads(line) for line in f]

    if not queue:
        st.success("✅ All evaluations complete!")
        return

    # Show current example
    example = queue[0]
    st.subheader(f"Example {example['id']}")

    st.text_area("Input", example["input"], height=100, disabled=True)
    st.text_area("Generated Output", example["output"], height=300, disabled=True)

    # Rating
    quality = st.slider("Quality Score", 0.0, 1.0, 0.5, 0.1)
    relevance = st.slider("Relevance", 0.0, 1.0, 0.5, 0.1)
    clarity = st.slider("Clarity", 0.0, 1.0, 0.5, 0.1)

    notes = st.text_area("Notes (optional)")

    if st.button("Submit & Next"):
        # Save evaluation
        result = {
            "example_id": example["id"],
            "quality": quality,
            "relevance": relevance,
            "clarity": clarity,
            "overall": (quality + relevance + clarity) / 3,
            "notes": notes
        }

        with open("prompts/evals/human-results.jsonl", "a") as f:
            f.write(json.dumps(result) + "\n")

        # Remove from queue
        queue.pop(0)
        with open("prompts/evals/human-queue.jsonl", "w") as f:
            for item in queue:
                f.write(json.dumps(item) + "\n")

        st.rerun()

if __name__ == "__main__":
    human_eval_interface()
```

Run with:
```bash
streamlit run prompts/evals/human_eval_ui.py
```

---

## 5. Observability Setup

### 5.1 LangSmith Integration

```python
# langsmith_tracing.py
from langsmith import Client
from langsmith.run_helpers import traceable
import os

# Setup client
client = Client(api_key=os.environ["LANGSMITH_API_KEY"])

@traceable(
    run_type="chain",
    project_name="prompt-engineering",
    tags=["production", "code-generation"]
)
def generate_code(task: str, context: str) -> str:
    """Traced code generation function."""
    # Load template
    template = load_template("code-generation")

    # Render prompt
    prompt = template.render(task=task, context=context)

    # Call LLM (traced automatically)
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}],
        metadata={
            "template_id": "code-generation",
            "template_version": "2.1.0"
        }
    )

    return response.content[0].text

# Usage (automatically traced)
code = generate_code(
    task="Implement JWT authentication",
    context="Express.js API with TypeScript"
)

# View trace at: https://smith.langchain.com/
```

### 5.2 LangFuse Integration

```python
# langfuse_tracing.py
from langfuse import Langfuse
import os

langfuse = Langfuse(
    public_key=os.environ["LANGFUSE_PUBLIC_KEY"],
    secret_key=os.environ["LANGFUSE_SECRET_KEY"],
    host="https://cloud.langfuse.com"
)

def generate_with_tracing(template_id: str, variables: dict) -> str:
    """Generate with Langfuse tracing."""
    # Start trace
    trace = langfuse.trace(
        name="code-generation",
        metadata={
            "template_id": template_id,
            "template_version": "2.1.0"
        }
    )

    # Span for template rendering
    with trace.span(name="template-render") as span:
        template = load_template(template_id)
        prompt = template.render(**variables)
        span.end(output={"prompt_length": len(prompt)})

    # Span for LLM call
    with trace.span(name="llm-call") as span:
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )
        span.end(
            output={"response_length": len(response.content[0].text)},
            metadata={
                "tokens": response.usage.total_tokens,
                "cost_usd": calculate_cost(response.usage)
            }
        )

    # Score generation
    trace.score(
        name="quality",
        value=calculate_quality_score(response.content[0].text)
    )

    trace.update(
        output=response.content[0].text,
        usage={
            "input": response.usage.input_tokens,
            "output": response.usage.output_tokens,
            "total": response.usage.total_tokens
        }
    )

    return response.content[0].text

# View at: https://cloud.langfuse.com/
```

### 5.3 Custom Dashboard

```python
# dashboard_metrics.py
import streamlit as st
import pandas as pd
import plotly.express as px
import json

def load_metrics():
    """Load metrics from experiment logs."""
    data = []
    with open("prompts/evals/ab-tests/code-generation-few-shot.jsonl") as f:
        for line in f:
            data.append(json.loads(line))
    return pd.DataFrame(data)

def render_dashboard():
    st.set_page_config(page_title="Prompt Engineering Dashboard", layout="wide")
    st.title("📊 Prompt Engineering Dashboard")

    # Load data
    df = load_metrics()

    # Metrics row
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Calls", len(df))
    with col2:
        st.metric("Avg Quality", f"{df['quality_score'].mean():.2f}")
    with col3:
        st.metric("Avg Latency", f"{df['latency_ms'].mean():.0f}ms")
    with col4:
        st.metric("Total Cost", f"${df['cost_usd'].sum():.2f}")

    # Quality over time
    st.subheader("Quality Score Over Time")
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    fig = px.line(df, x='timestamp', y='quality_score', color='variant')
    st.plotly_chart(fig, use_container_width=True)

    # Cost vs Quality scatter
    st.subheader("Cost vs Quality Trade-off")
    fig = px.scatter(
        df.groupby('variant').agg({
            'quality_score': 'mean',
            'cost_usd': 'mean'
        }).reset_index(),
        x='cost_usd',
        y='quality_score',
        text='variant',
        size_max=20
    )
    st.plotly_chart(fig, use_container_width=True)

    # Success rate by variant
    st.subheader("Success Rate by Variant")
    success_rates = df.groupby('variant')['success'].mean().reset_index()
    fig = px.bar(success_rates, x='variant', y='success', text_auto='.2%')
    st.plotly_chart(fig, use_container_width=True)

if __name__ == "__main__":
    render_dashboard()
```

Run with:
```bash
streamlit run prompts/dashboard_metrics.py
```

---

## 6. CI/CD Integration

### 6.1 GitHub Actions Workflow

```yaml
# .github/workflows/prompt-ci.yml
name: Prompt Engineering CI

on:
  pull_request:
    paths:
      - 'prompts/**'
  push:
    branches:
      - main

jobs:
  validate:
    name: Validate Templates
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Dependencies
        run: |
          pip install jinja2 pyyaml jsonschema

      - name: Validate Template Syntax
        run: |
          python scripts/validate_templates.py

      - name: Check Metadata
        run: |
          python scripts/validate_metadata.py

  regression-test:
    name: Regression Testing
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Dependencies
        run: |
          pip install -r prompts/requirements.txt

      - name: Run Eval Suite
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          python prompts/evals/run_eval_suite.py --dataset prompts/evals/datasets/code-generation-truth.jsonl

      - name: Check Quality Threshold
        run: |
          python scripts/check_quality_threshold.py --threshold 0.80

  ab-test-report:
    name: A/B Test Report
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4

      - name: Generate Report
        run: |
          python prompts/ab_test_analysis.py > report.md

      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs')
            const report = fs.readFileSync('report.md', 'utf8')
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: report
            })

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: [validate, regression-test]
    steps:
      - uses: actions/checkout@v4

      - name: Upload to S3
        run: |
          aws s3 sync prompts/templates/ s3://prompts-production/templates/ --delete

      - name: Update Metadata
        run: |
          aws s3 cp prompts/configs/metadata.json s3://prompts-production/metadata.json

      - name: Notify Deployment
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text": "✅ Prompts deployed to production"}'
```

### 6.2 Validation Scripts

**`scripts/validate_templates.py`**:

```python
from jinja2 import Environment, FileSystemLoader, TemplateSyntaxError
import sys
from pathlib import Path

def validate_templates():
    """Validate all Jinja2 templates."""
    env = Environment(loader=FileSystemLoader('prompts/templates'))
    errors = []

    for template_file in Path('prompts/templates').rglob('*.jinja2'):
        relative_path = template_file.relative_to('prompts/templates')
        try:
            env.get_template(str(relative_path))
            print(f"✅ {relative_path}")
        except TemplateSyntaxError as e:
            errors.append(f"❌ {relative_path}: {e}")

    if errors:
        print("\n".join(errors))
        sys.exit(1)
    else:
        print(f"\n✅ All {len(list(Path('prompts/templates').rglob('*.jinja2')))} templates valid")

if __name__ == "__main__":
    validate_templates()
```

---

## 7. Prompt Engineering Best Practices

### 7.1 General Principles

| Principle | Description | Example |
|-----------|-------------|---------|
| **Be Specific** | Clear, unambiguous instructions | ❌ "Write code" → ✅ "Write TypeScript function with JSDoc" |
| **Provide Context** | Background information | "You are an expert TypeScript developer" |
| **Use Examples** | Few-shot learning | Show 2-3 examples of desired output |
| **Structure Output** | Define format explicitly | "Return JSON with keys: {name, type, value}" |
| **Chain Prompts** | Break complex tasks | Research → Plan → Implement → Review |

### 7.2 Anti-Patterns to Avoid

❌ **Vague Instructions**:
```
Write some code to handle users.
```

✅ **Specific Instructions**:
```
Write a TypeScript class `UserService` with methods:
- `create(email: string, password: string): Promise<User>`
- `authenticate(email: string, password: string): Promise<string>`

Use bcrypt for password hashing and return JWT tokens.
```

---

❌ **No Output Structure**:
```
Analyze this code and tell me what's wrong.
```

✅ **Structured Output**:
```
Analyze this code and return JSON:
{
  "issues": [
    {"severity": "high|medium|low", "description": "...", "line": 42}
  ],
  "recommendations": ["..."]
}
```

---

❌ **Missing Context**:
```
Fix this bug: {{code}}
```

✅ **Context-Rich**:
```
You are debugging a Node.js Express API.

Bug report: Users getting 500 error on /api/login
Error log: {{error_log}}
Problematic code: {{code}}

Identify root cause and provide fix with explanation.
```

### 7.3 Advanced Techniques

#### Chain-of-Thought (CoT)

```jinja2
Solve this step-by-step:

1. First, identify the requirements
2. Then, design the architecture
3. Next, implement the solution
4. Finally, add error handling

Think through each step before proceeding to the next.

Task: {{ task }}
```

#### Self-Consistency

```python
# Generate multiple completions and vote
def self_consistency_generate(prompt: str, n: int = 5) -> str:
    """Generate n completions and return most common answer."""
    responses = []
    for _ in range(n):
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1000,
            temperature=0.7,  # Higher temp for diversity
            messages=[{"role": "user", "content": prompt}]
        )
        responses.append(response.content[0].text)

    # Vote (simple majority)
    from collections import Counter
    return Counter(responses).most_common(1)[0][0]
```

#### Retrieval-Augmented Generation (RAG)

```python
from anthropic import Anthropic

def rag_prompt(query: str, context_docs: List[str]) -> str:
    """RAG-enhanced prompt with retrieved context."""
    context = "\n\n".join([f"Document {i+1}:\n{doc}" for i, doc in enumerate(context_docs)])

    prompt = f"""
You are a helpful assistant with access to relevant documentation.

## Context Documents
{context}

## User Query
{query}

Answer the query using ONLY information from the context documents above. Cite document numbers when referencing information.
"""
    return prompt

# Usage
relevant_docs = vector_search(query="How to implement JWT?", top_k=3)
prompt = rag_prompt(query, relevant_docs)
```

---

## 8. Template Library

### 8.1 Code Generation Template

**`prompts/templates/coding/code-generation.jinja2`** (already shown in section 1.2)

### 8.2 Code Review Template

```jinja2
{# name: Code Review - Security & Quality #}
{# version: 1.2.0 #}

You are an expert code reviewer specializing in security and code quality.

## Code to Review

```{{ language }}
{{ code }}
```

## Review Criteria

{% for criterion in criteria %}
- {{ criterion }}
{% endfor %}

## Focus Areas

- Security vulnerabilities (SQL injection, XSS, auth bypass)
- Performance issues (N+1 queries, inefficient algorithms)
- Code smells (duplicated code, long functions, deep nesting)
- Best practices violations

## Output Format

Return JSON:
```json
{
  "overall_score": 0-100,
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "category": "security|performance|maintainability|style",
      "line": 42,
      "description": "...",
      "recommendation": "..."
    }
  ],
  "praise": ["..."],  // What's done well
  "summary": "..."
}
```

Be constructive and specific. Provide code examples for fixes.
```

### 8.3 Documentation Generation Template

```jinja2
{# name: Documentation Generator #}
{# version: 1.0.0 #}

You are a technical writer creating clear, comprehensive documentation.

## Code/API to Document

```{{ language }}
{{ code }}
```

## Documentation Style

{{ style | default("Google Developer Documentation Style") }}

## Requirements

- API reference for all public functions/classes
- Usage examples with real-world scenarios
- Parameter descriptions with types
- Return value documentation
- Common pitfalls and troubleshooting

## Output Format

Markdown with:
1. Overview
2. Installation (if applicable)
3. Quick Start
4. API Reference
5. Examples
6. Troubleshooting

Be concise but thorough. Assume reader is an {{ audience | default("intermediate developer") }}.
```

---

## 9. Cost Optimization

### 9.1 Token Usage Tracking

```python
# cost_tracker.py
from anthropic import Anthropic

# Pricing (as of 2026-02)
PRICING = {
    "claude-opus-4": {"input": 0.015, "output": 0.075},    # per 1K tokens
    "claude-sonnet-4-5": {"input": 0.003, "output": 0.015},
    "claude-haiku-4": {"input": 0.00025, "output": 0.00125}
}

def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    """Calculate cost in USD."""
    pricing = PRICING[model]
    input_cost = (input_tokens / 1000) * pricing["input"]
    output_cost = (output_tokens / 1000) * pricing["output"]
    return input_cost + output_cost

# Track per template
def track_template_cost(template_id: str, model: str, usage: dict):
    """Track cost per template invocation."""
    cost = calculate_cost(model, usage["input_tokens"], usage["output_tokens"])

    # Append to log
    with open(f"prompts/costs/{template_id}.jsonl", "a") as f:
        f.write(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "model": model,
            "input_tokens": usage["input_tokens"],
            "output_tokens": usage["output_tokens"],
            "cost_usd": cost
        }) + "\n")

    return cost
```

### 9.2 Model Selection Strategy

| Use Case | Model | Rationale |
|----------|-------|-----------|
| **Code generation** | Sonnet 4.5 | Balance of quality and cost |
| **Simple classification** | Haiku 4 | 10x cheaper, sufficient quality |
| **Complex reasoning** | Opus 4 | Best quality, justify higher cost |
| **Batch processing** | Haiku 4 | Cost-effective at scale |

### 9.3 Cost Alerts

```python
# cost_alerts.py
def check_cost_threshold(template_id: str, threshold_usd: float):
    """Alert if template costs exceed threshold."""
    with open(f"prompts/costs/{template_id}.jsonl") as f:
        costs = [json.loads(line)["cost_usd"] for line in f]

    total_cost = sum(costs)
    if total_cost > threshold_usd:
        send_slack_alert(
            f"⚠️ Template `{template_id}` exceeded cost threshold!\n"
            f"Total: ${total_cost:.2f} (threshold: ${threshold_usd})"
        )

# Run daily via cron
if __name__ == "__main__":
    check_cost_threshold("code-generation", threshold_usd=50.0)
```

---

## 10. Troubleshooting

### Common Issues

#### Low Quality Scores

**Problem**: Template produces inconsistent or low-quality outputs.

**Solutions**:
1. Add few-shot examples (improve by ~15%)
2. Increase specificity in instructions
3. Add output format constraints
4. Use chain-of-thought reasoning

#### High Latency

**Problem**: Template takes >5 seconds to respond.

**Solutions**:
1. Reduce max_tokens (if output is too verbose)
2. Switch to faster model (Sonnet → Haiku)
3. Remove unnecessary context
4. Use prompt caching (Anthropic feature)

#### A/B Test Not Significant

**Problem**: p-value > 0.05, can't determine winner.

**Solutions**:
1. Increase sample size (run longer)
2. Check if variants are too similar
3. Verify ground truth dataset quality

---

## Implementation Roadmap

### Week 1: Template Library

- [ ] Extract existing prompts to templates
- [ ] Organize by category (research, coding, review)
- [ ] Add metadata.json
- [ ] Setup Git versioning

### Week 2-3: Testing Framework

- [ ] Build A/B test harness
- [ ] Create ground truth datasets
- [ ] Implement automated scoring
- [ ] Setup human eval UI

### Week 4: Observability

- [ ] Integrate LangSmith or LangFuse
- [ ] Build custom dashboard
- [ ] Setup cost tracking
- [ ] Add regression detection

---

## Resources

### Tools

- **Jinja2**: https://jinja.palletsprojects.com/
- **LangChain**: https://python.langchain.com/docs/modules/model_io/prompts/
- **LangSmith**: https://smith.langchain.com/
- **LangFuse**: https://langfuse.com/

### Learning

- **Anthropic Prompt Engineering**: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
- **OpenAI Prompt Engineering**: https://platform.openai.com/docs/guides/prompt-engineering
- **Prompt Engineering Guide**: https://www.promptingguide.ai/

---

## Quick Reference

```bash
# Validate templates
python scripts/validate_templates.py

# Run eval suite
python prompts/evals/run_eval_suite.py --dataset code-generation-truth.jsonl

# Start A/B test
python prompts/ab_test_harness.py --experiment code-gen-few-shot

# View dashboard
streamlit run prompts/dashboard_metrics.py

# Check costs
python prompts/cost_tracker.py --threshold 50
```

---

**Ready to formalize your prompts?** Start met [Section 1: Prompt Template System](#1-prompt-template-system) 🚀
