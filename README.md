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
shuttle run
shuttle deploy
```

Open [localhost:8000](http://127.0.0.1:8000/)
