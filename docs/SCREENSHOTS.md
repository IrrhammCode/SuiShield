# SuiShield — Screenshots Guide

This folder contains screenshots of the SuiShield application for documentation.

## 📸 Required Screenshots

Take screenshots of these pages when running locally (`npm run dev`):

| File Name | Route | Description |
|-----------|-------|-------------|
| `trust-analysis.png` | `/analyze` | Trust analysis page with address input, score card, risk signals |
| `chat.png` | `/chat` | AI chat interface showing conversation with source badges |
| `trust-graph.png` | `/trust-graph` | Fund flow visualization with node graph and risk coloring |
| `monitor.png` | `/monitor` | Address monitoring page with activity feed and status cards |
| `explore.png` | `/explore` | Dataset explorer with grid view, stats bar, search/filter |
| `dashboard.png` | `/dashboard` | Main dashboard overview |
| `architecture.png` | N/A | System architecture diagram (use Excalidraw, Figma, or similar) |

## 📐 Screenshot Guidelines

- **Resolution:** 1920x1080 or higher
- **Format:** PNG (preferred) or JPG
- **Theme:** Dark mode (default)
- **Browser:** Chrome or Firefox with clean profile
- **Content:** Use demo/test data, no real personal addresses

## 🎨 Architecture Diagram

Create an architecture diagram showing:

1. **User Layer:** Frontend (Next.js 16)
2. **API Layer:** Next.js API Routes
3. **AI Layer:** Groq AI Agent + Tatum MCP
4. **Data Layer:** Tatum Sui RPC + Walrus Storage
5. **Blockchain Layer:** Sui Move Contract

Tools to use:
- [Excalidraw](https://excalidraw.com/) — Hand-drawn style
- [Figma](https://figma.com/) — Professional design
- [Mermaid](https://mermaid.live/) — Code-based diagrams
- [D2](https://d2lang.com/) — Declarative diagrams
