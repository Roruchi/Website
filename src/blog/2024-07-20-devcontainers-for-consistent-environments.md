---
title: Dev Containers for Consistent Development Environments
date: 2024-07-20
description: How Dev Containers solve the "works on my machine" problem and streamline onboarding.
draft: false  # set to true to hide this post from production builds
tags:
  - post
  - devcontainers
  - developer-experience
---

"It workson my machine" is the most dreaded phrase in software development. Dev Containers offer a solution.

## What Are Dev Containers?

Dev Containers (development containers) allow you to define your development environment as code using a `.devcontainer/devcontainer.json` file. This ensures every developer on your team has exactly the same tools, extensions, and runtime versions.

They work with VS Code, GitHub Codespaces, and other editors that support the Dev Container specification.

## A Simple Example

Here's a basic `.devcontainer/devcontainer.json` for a Node.js project:

```json
{
  "name": "Node.js Dev",
  "image": "mcr.microsoft.com/devcontainers/node:20",
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "extensions": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ],
  "postCreateCommand": "npm install"
}
```

## Benefits

- **Reproducible environments** — no more environment drift between machines
- **Faster onboarding** — new team members are productive in minutes
- **Works with Codespaces** — seamlessly move between local and cloud development
- **Version-controlled** — your environment config lives in source control

Give Dev Containers a try on your next project!
