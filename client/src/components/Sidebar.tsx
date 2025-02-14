"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit,
  FileText,
  ArrowRight,
  FileCode,
  ExternalLink,
  Github,
  Sun,
  Moon,
  File,
  ChevronLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Contract {
  id: string;
  name: string;
  content: string;
  toml: string;
}

interface Transaction {
  hash: string;
  timestamp: string;
  status: "pending" | "success" | "failed";
}

interface Account {
  publicKey: string;
  isActive: boolean;
}

interface SidebarProps {
  contracts: Contract[];
  selectedContract: Contract | null;
  onContractSelect: (contract: Contract) => void;
  onContractCreate: () => void;
  onContractDelete: (id: string) => void;
  onContractRename: (id: string, newName: string) => void;
  transactions: Transaction[];
  accounts: Account[];
  onCreateAccount: () => void;
  onSetActiveAccount: (publicKey: string) => void;
  exampleContracts: { name: string; content: string }[];
  onLoadExample: (content: string) => void;
  credits: number;
}

export const Sidebar = ({
  contracts,
  selectedContract,
  onContractSelect,
  onContractCreate,
  onContractDelete,
  onContractRename,
  transactions,
  accounts,
  onCreateAccount,
  onSetActiveAccount,
  exampleContracts,
  onLoadExample,
  credits,
}: SidebarProps) => {
  const [isContractsExpanded, setIsContractsExpanded] = useState(true);
  const [isTransactionsExpanded, setIsTransactionsExpanded] = useState(true);
  const [isAccountsExpanded, setIsAccountsExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isManifestExpanded, setIsManifestExpanded] = useState(true);

  const [manifestContent, setManifestContent] = useState(`[package]
name = "movement_playground_onchain"
version = "1.0.0"
authors = []

[addresses]

[dev-addresses]

[dependencies.AptosFramework]
git = "https://github.com/aptos-labs/aptos-core.git"
rev = "mainnet"
subdir = "aptos-move/framework/aptos-framework"

[dev-dependencies]`);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const handleRename = (id: string, newName: string) => {
    onContractRename(id, newName);
    setEditingId(null);
  };

  const openInExplorer = (hash: string) => {
    window.open(
      `https://explorer.aptoslabs.com/txn/${hash}?network=devnet`,
      "_blank"
    );
  };

  const openAccountInExplorer = (publicKey: string) => {
    window.open(
      `https://explorer.aptoslabs.com/account/${publicKey}?network=devnet`,
      "_blank"
    );
  };

  const getBgColor = (isActive: boolean) => {
    if (isActive) {
      return theme === "dark" ? "bg-gray-600" : "hover:bg-gray-100";
    } else {
      return theme === "dark" ? "bg-gray-800" : "hover:bg-gray-50";
    }
  };

  const handleManifestClick = () => {
    if (selectedContract) {
      onContractSelect({
        ...selectedContract,
        content: manifestContent,
        name: "Move.toml",
        id: "manifest",
      });
    }
  };

  return (
    <div
      className={`flex h-full flex-col border-r border-gray-200 bg-background text-foreground p-4 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center gap-2 mb-4 cursor-pointer">
        {!isCollapsed && (
          <>
            <Image src={"/logo.png"} alt="Logo" width={64} height={64} />
            <h1 className="text-lg font-semibold leading-tight text-yellow-400 drop-shadow-[1.2px_1.2px_1.2px_rgba(0,0,0,0.8)]">
              Movement Playground Onchain
            </h1>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-4"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="mb-2 w-full">
          <WalletConnector />
        </div>
      )}

      {!isCollapsed && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Movement Devnet</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Image
                    src={"/movement.png"}
                    alt="MOVE"
                    width={16}
                    height={16}
                  />
                  <span>{credits} MOVE</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>MOVE tokens for running operations:</p>
                <ul className="text-xs mt-1">
                  <li>Audit: 100 MOVE</li>
                  <li>Compile: 50 MOVE</li>
                  <li>Deploy: 200 MOVE</li>
                  <li>Prove: 100 MOVE</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      {!isCollapsed && (
        <Select
          onValueChange={(value: string) => {
            const example = exampleContracts.find((e) => e.name === value);
            if (example) onLoadExample(example.content);
          }}
        >
          <SelectTrigger className="mb-4">
            <SelectValue placeholder="Load example contract" />
          </SelectTrigger>
          <SelectContent>
            {exampleContracts.map((example) => (
              <SelectItem key={example.name} value={example.name}>
                {example.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {!isCollapsed && (
        <div className="flex flex-col space-y-4 flex-1 overflow-auto">
          <div>
            <button
              onClick={() => setIsManifestExpanded(!isManifestExpanded)}
              className="flex items-center text-sm font-medium text-gray-700 mb-2"
            >
              {isManifestExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              Manifest
            </button>

            {isManifestExpanded && (
              <div
                className="group relative rounded-md p-2 hover:bg-gray-50 ml-2 cursor-pointer"
                onClick={handleManifestClick}
              >
                <div className="flex items-center gap-2">
                  <File size={16} />
                  <span className="text-sm">Move.toml</span>
                </div>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setIsContractsExpanded(!isContractsExpanded)}
                className="flex items-center text-sm font-medium text-gray-700"
              >
                {isContractsExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                Contracts
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onContractCreate}
                className="h-6 w-6 p-0"
              >
                <Plus size={16} />
              </Button>
            </div>

            {isContractsExpanded && (
              <div className="space-y-2 ml-2">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className={`group relative rounded-md p-2 ${
                      selectedContract?.id === contract.id
                        ? theme === "dark"
                          ? "bg-gray-600"
                          : "bg-gray-100"
                        : theme === "dark"
                        ? "hover:bg-gray-800"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {editingId === contract.id ? (
                      <input
                        autoFocus
                        defaultValue={contract.name}
                        onBlur={(e) =>
                          handleRename(contract.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRename(contract.id, e.currentTarget.value);
                          }
                        }}
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div
                          className="flex cursor-pointer items-center gap-2"
                          onClick={() => onContractSelect(contract)}
                        >
                          <FileText size={16} />
                          <span className="text-sm">{contract.name}</span>
                        </div>
                        <div className="hidden gap-1 group-hover:flex">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(contract.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onContractDelete(contract.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setIsTransactionsExpanded(!isTransactionsExpanded)}
              className="flex items-center text-sm font-medium text-gray-700 mb-2"
            >
              {isTransactionsExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              Transactions
            </button>

            {isTransactionsExpanded && (
              <div className="space-y-2 ml-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.hash}
                    className="flex items-center gap-2 text-sm p-2 hover:bg-gray-50 rounded-md"
                  >
                    <ArrowRight
                      size={14}
                      className={
                        tx.status === "success"
                          ? "text-green-500"
                          : tx.status === "failed"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }
                    />
                    <span className="font-mono">{tx.hash.slice(0, 10)}...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openInExplorer(tx.hash)}
                      className="ml-auto h-6 w-6 p-0"
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setIsAccountsExpanded(!isAccountsExpanded)}
                className="flex items-center text-sm font-medium text-gray-700"
              >
                {isAccountsExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                Accounts
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCreateAccount}
                className="h-6 w-6 p-0"
              >
                <Plus size={16} />
              </Button>
            </div>

            {isAccountsExpanded && (
              <div className="space-y-2 ml-2">
                {accounts.map((account) => (
                  <div
                    key={account.publicKey}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${getBgColor(
                      account.isActive
                    )}`}
                  >
                    <div
                      className="flex items-center gap-2 flex-1"
                      onClick={() => onSetActiveAccount(account.publicKey)}
                    >
                      <FileCode size={14} />
                      <span className="font-mono text-sm">
                        {account.publicKey.slice(0, 10)}...
                      </span>
                      {account.isActive && (
                        <span className="text-xs text-green-600 font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAccountInExplorer(account.publicKey)}
                      className="h-6 w-6 p-0 ml-2"
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="h-8 w-8 p-0"
        >
          {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
        </Button>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.open(
                "https://github.com/jsmaxi/move-playground-onchain",
                "_blank"
              )
            }
            className="h-8 w-8 p-0"
          >
            <Github size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};
