---
title: Visualising Architecture with Mermaid Diagrams
date: 2025-01-10
description: How to use Mermaid.js to create clear, maintainable architecture diagrams directly in your markdown documentation.
image: /assets/images/og-default.svg
draft: false
tags:
  - post
  - architecture
  - developer-experience
---

Good documentationlives close to the code. Mermaid diagrams let you define architecture visuals using plain text that you can commit alongside your code and render in any markdown-capable environment.

## Why Mermaid?

Unlike static images, Mermaid diagrams are:
- **Version-controlled** — you can diff and review changes to diagrams
- **Portable** — renders in GitHub, GitLab, Notion, and now this blog
- **Maintainable** — update text, not pixels

## A Simple Microservices Architecture

Here's a typical event-driven microservices architecture:

```mermaid
graph TB
    Client([Browser / Mobile]) --> Gateway[API Gateway]
    
    Gateway --> AuthSvc[Auth Service]
    Gateway --> UserSvc[User Service]
    Gateway --> OrderSvc[Order Service]
    
    AuthSvc --> DB1[(Auth DB)]
    UserSvc --> DB2[(User DB)]
    OrderSvc --> DB3[(Order DB)]
    
    OrderSvc --> Queue[Message Queue]
    Queue --> NotifySvc[Notification Service]
    Queue --> AnalyticsSvc[Analytics Service]
    
    NotifySvc --> Email[Email Provider]
    
    style Gateway fill:#7c3aed,color:#fff
    style Queue fill:#0891b2,color:#fff
```

## Deployment Pipeline

Here's how a GitOps deployment pipeline works:

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant CI as CI Pipeline
    participant Registry as Container Registry
    participant Argo as ArgoCD
    participant K8s as Kubernetes

    Dev->>GH: Push code / open PR
    GH->>CI: Trigger workflow
    CI->>CI: Build & test
    CI->>Registry: Push container image
    CI->>GH: Update image tag in GitOps repo
    GH->>Argo: Detect config drift
    Argo->>K8s: Sync desired state
    K8s-->>Argo: Confirm deployment
```

## Platform Engineering Maturity

A quadrant view of platform engineering maturity:

```mermaid
quadrantChart
    title Platform Engineering Maturity
    x-axis Low Automation --> High Automation
    y-axis Low Self-Service --> High Self-Service
    quadrant-1 Optimised Platform
    quadrant-2 Automated Ops
    quadrant-3 Manual Everything
    quadrant-4 Developer Portal
    Team A: [0.2, 0.3]
    Team B: [0.5, 0.6]
    Team C: [0.8, 0.85]
    Industry Leader: [0.9, 0.9]
```

## Getting Started

To add Mermaid to your own 11ty site, include the Mermaid CDN script and a small initialisation snippet that detects ` ``` `mermaid code blocks and renders them client-side:

```js
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad: false, theme: 'default' });

document.addEventListener('DOMContentLoaded', async () => {
  const blocks = document.querySelectorAll('pre code.language-mermaid');
  for (const block of blocks) {
    const pre = block.parentElement;
    const source = block.textContent;
    const container = document.createElement('div');
    container.className = 'mermaid';
    container.textContent = source;
    pre.replaceWith(container);
  }
  await mermaid.run();
});
```

That's all it takes. Diagrams as code, shipped with your content.
