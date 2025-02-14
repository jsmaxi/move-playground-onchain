# Movement Playground Onchain

An interactive development environment for experimenting with Move smart contracts on the Movement network. Write, audit, compile, and deploy smart contracts with integrated AI assistance.

Built for both beginners and experienced Move developers.

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
```

Fill with Shuttle local or remote endpoint URLs.

For example, when using localhost:

```
AUDIT_API_URL = "http://127.0.0.1:8000/audit"
CHAT_API_URL = "http://127.0.0.1:8000/chat"
COMPILE_API_URL = "http://127.0.0.1:8000/compile"
DEPLOY_API_URL = "http://127.0.0.1:8000/deploy"
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
