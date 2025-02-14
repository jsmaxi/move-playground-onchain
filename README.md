# Movement Playground Onchain

An interactive development environment for experimenting with Move smart contracts on the Movement network. Write, audit, compile, and deploy smart contracts with integrated AI assistance.

Built for both beginners and experienced Move developers.

<img src="./images/movementplayground.png" alt="project logo" width="250" height="100"/>

---

### Quick Start

> Client

```bash
git clone https://github.com/jsmaxi/move-playground-onchain
cd move-playground-onchain/client
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000/)

Create .env file in client root and set environment variables according to the example:

```
AUDIT_API_URL = ""
CHAT_API_URL = ""
COMPILE_API_URL = ""
DEPLOY_API_URL = ""
PROVE_API_URL = ""
```

Fill with Shuttle local or remote endpoint URLs.

For example, when using localhost:

```
AUDIT_API_URL = "http://127.0.0.1:8000/audit"
CHAT_API_URL = "http://127.0.0.1:8000/chat"
COMPILE_API_URL = "http://127.0.0.1:8000/compile"
DEPLOY_API_URL = "http://127.0.0.1:8000/deploy"
PROVE_API_URL = "http://127.0.0.1:8000/prove"
```

> Agent

```bash
git clone https://github.com/jsmaxi/move-playground-onchain
cd move-playground-onchain/agent
cargo install cargo-shuttle
shuttle login
shuttle project start
shuttle run
shuttle deploy
```

Open [localhost:8000](http://127.0.0.1:8000/)

Make sure that .shuttle folder is created in agent root with config.toml file and Shuttle project id set inside: `id = "proj..."`

Also make sure to create Secrets.toml file in agent root and set environment variable inside of it: `OPENAI_API_KEY = "your-api-key"`

---

### Main Features:

- In-browser Move code editor
- One-click compilation and deployment to Movement network
- Integrated AI security audit checks for common vulnerabilities and tips
- AI assistant to help with code generation, debugging and best practices
- Native MOVE token payments for system actions
- Move smart contract examples
- Wallet connect functionality

### Security

This is experimental software. Use at your own risk. Check your smart contracts thoroughly before deploying to Movement mainnet.
