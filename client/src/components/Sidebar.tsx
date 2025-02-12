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
  //   Play,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}: SidebarProps) => {
  const [isContractsExpanded, setIsContractsExpanded] = useState(true);
  const [isTransactionsExpanded, setIsTransactionsExpanded] = useState(true);
  const [isAccountsExpanded, setIsAccountsExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
      `https://explorer.aptoslabs.com/txn/${hash}?network=testnet`,
      "_blank"
    );
  };

  const openAccountInExplorer = (publicKey: string) => {
    window.open(
      `https://explorer.aptoslabs.com/account/${publicKey}?network=testnet`,
      "_blank"
    );
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-background text-foreground p-4">
      <div className="flex items-center gap-2 mb-4">
        {/* <Play className="text-primary h-5 w-5" /> */}
        <h1 className="text-lg font-semibold leading-tight">
          Movement Playground Onchain
        </h1>
      </div>

      <Button variant="outline" className="mb-2 w-full justify-start gap-2">
        <span className="h-2 w-2 rounded-full bg-gray-400"></span>
        Connect
      </Button>

      <div className="mb-4 text-sm text-muted-foreground">Move Testnet</div>

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

      <div className="flex flex-col space-y-4 flex-1 overflow-auto">
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
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {editingId === contract.id ? (
                    <input
                      autoFocus
                      defaultValue={contract.name}
                      onBlur={(e) => handleRename(contract.id, e.target.value)}
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
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                    account.isActive ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
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

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="h-8 w-8 p-0"
        >
          {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
        </Button>
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
      </div>
    </div>
  );
};
