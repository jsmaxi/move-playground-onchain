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
