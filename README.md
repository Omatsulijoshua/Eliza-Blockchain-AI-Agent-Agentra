# Agentra 🤖 — Blockchain AI Agent

Agentra is a state-of-the-art, Web3-enabled autonomous AI agent built on top of the **elizaOS** architecture. It is designed to act as an intelligent guide, storyteller, and conversational interface for interactive applications, including the **Nigeria Leadership 3D Interactive Museum**, while natively supporting blockchain transactions and decentralized workflows.

---

## 🚀 Key Features

- **🌐 Multi-Platform Presence**: Native support for clients including Discord, Telegram, and X (Twitter) to communicate with users.
- **🔗 Web3 & Blockchain Native**: Natively integrated with EVM and Solana plugins for processing trust scores, tokens, and on-chain activities.
- **🧠 Advanced Cognitive Architecture**: Equipped with persistent memory, relationship tracking, document ingestion, and dynamic retrieval-augmented generation (RAG).
- **🎭 Customizable Personalities**: Run highly tailored character personas with unique backstory, knowledge databases, styles, and behavioral adjectives.

---

## 🛠️ Project Architecture

```
Agentra/
├── agent/             # Core agent runner and package entrypoint
├── client/            # Frontend direct client interface for web interactions
├── packages/          # Plugin modular ecosystem
│   ├── core/          # Core runtime, database adapters, and memory logic
│   ├── plugin-evm/    # Ethereum/EVM wallet, contract interactions, and transfers
│   └── plugin-solana/ # Solana token operations, balances, and swap functions
└── characters/        # Custom AI character configuration files
```

---

## 🚀 Quick Start Guide

### 📋 Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: `23+` (recommended)
- **pnpm**: `9+` (package manager)
- **Python**: `2.7+` (for node-gyp build steps)
- **WSL 2** (Required for Windows users)

---

### 📥 Installation & Setup

1. **Clone the Repository** (if not already local):
   ```bash
   git clone https://github.com/Omatsulijoshua/Eliza-Blockchain-AI-Agent-Agentra.git
   cd Eliza-Blockchain-AI-Agent-Agentra
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Build the Workspace**:
   ```bash
   pnpm build
   ```

4. **Configure Environment Variables**:
   Copy the example environment file and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and configure your API keys:
   - `OPENAI_API_KEY` (or alternate LLM provider keys like Anthropic, Gemini, Grok)
   - `TELEGRAM_BOT_TOKEN` / `TWITTER_USERNAME` (for bot integration)
   - Blockchain credentials (e.g., `SOLANA_PRIVATE_KEY` / `EVM_PRIVATE_KEY` for wallet plugins)

---

### 💻 Running the Agent

Start the core agent runtime in your terminal:
```bash
pnpm start
```

#### Run the Direct Client
To interact with the agent via a web-based chat interface:
1. Open another terminal in the project directory.
2. Run the client start script:
   ```bash
   pnpm start:client
   ```
3. Navigate to the local URL (usually `http://localhost:5173`) in your web browser.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests to enhance Agentra's capabilities.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
