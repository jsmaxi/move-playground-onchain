"use client";

import Index from "@/components/Index";
import { Toaster } from "@/components/ui/toaster";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";

const wallets = [new PetraWallet()];

// declare enum Network {
//   MAINNET = "mainnet",
//   TESTNET = "testnet",
//   DEVNET = "devnet",
//   LOCAL = "local",
//   CUSTOM = "custom",
// }

export default function Home() {
  return (
    <div>
      <Toaster />
      <AptosWalletAdapterProvider
        plugins={wallets}
        autoConnect={true}
        // optInWallets={["Petra"]}
        // dappConfig={{
        //   network: Network.DEVNET,
        //   aptosApiKey: "my-generated-api-key",
        // }}
        // onError={(error) => {
        //   console.log("Aptos wallet error.", error);
        // }}
      >
        <Index />
      </AptosWalletAdapterProvider>
    </div>
  );
}
