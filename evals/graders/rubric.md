# Walkthrough Quality Rubric

Grade each dimension on a 1–5 scale.

## Readability

| Score | Criteria |
|-------|----------|
| 5 | TL;DR is clear and under 3 sentences. Node labels are plain English. Descriptions are concise (1-2 sentences). A new developer could understand the system in under 2 minutes. |
| 3 | Most labels are clear. Some descriptions run long or are vague. |
| 1 | Labels use raw function names or file paths. Descriptions are code dumps or incomprehensible. |

## Node Descriptions

| Score | Criteria |
|-------|----------|
| 5 | Every description answers "what is this?" and "why does it exist?" in plain language. No jargon without context. |
| 3 | Most descriptions are useful. A few are too vague or too technical. |
| 1 | Descriptions are missing, copy-pasted code comments, or meaningless. |

## Code Snippets

| Score | Criteria |
|-------|----------|
| 5 | Every node has a relevant, real code snippet (1-5 lines) that serves as a concrete anchor. Snippets are the "most useful" line, not random. |
| 3 | Most nodes have snippets. Some are too long or not clearly relevant. |
| 1 | Snippets are missing, fabricated, or walls of code. |

## Diagram Accuracy

| Score | Criteria |
|-------|----------|
| 5 | Nodes represent real concepts in the codebase. Edges accurately reflect data/control flow. Groupings make intuitive sense. |
| 3 | Mostly accurate. One or two edges may be misleading. |
| 1 | Major inaccuracies. Fabricated connections. Missing key concepts. |

## Pass Criteria

- Overall score >= 3
- No individual dimension below 2
