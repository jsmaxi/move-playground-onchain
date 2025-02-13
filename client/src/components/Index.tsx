"use client";

import { useState, useRef, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Copy, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Contract {
  id: string;
  name: string;
  content: string;
  toml: string;
  lastEdited?: string;
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

const defaultToml = `[package]
name = "contract"
version = "1.0.0"
authors = [""]

[addresses]
contract = "_"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework/", rev = "main"}`;

const defaultContract = `module contract::hello {
    use std::string;
    use aptos_framework::account;
    
    #[view]
    public fun hello(): string::String {
        string::utf8(b"Hello, Move!")
    }
}`;

const exampleContracts = [
  {
    name: "Hello World",
    content: defaultContract,
  },
  {
    name: "Token Contract",
    content: `module contract::token {
    use std::string;
    use aptos_framework::coin;
    
    struct MyToken {}
    
    fun init_module(account: &signer) {
        coin::register<MyToken>(account);
    }
}`,
  },
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: "1",
      name: "HelloWorld",
      content: defaultContract,
      toml: defaultToml,
      lastEdited: new Date().toISOString(),
    },
  ]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    contracts[0]
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([
    { publicKey: "0x1234...5678", isActive: true },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const createContract = () => {
    const newContract: Contract = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Contract",
      content: defaultContract,
      toml: defaultToml,
      lastEdited: new Date().toISOString(),
    };
    setContracts([...contracts, newContract]);
  };

  const deleteContract = (id: string) => {
    const newContracts = contracts.filter((c) => c.id !== id);
    setContracts(newContracts);
    if (selectedContract?.id === id) {
      setSelectedContract(newContracts[0] || null);
    }
  };

  const renameContract = (id: string, newName: string) => {
    setContracts(
      contracts.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const updateContractContent = (content: string) => {
    if (!selectedContract) return;
    const now = new Date().toISOString();
    setContracts(
      contracts.map((c) =>
        c.id === selectedContract.id ? { ...c, content, lastEdited: now } : c
      )
    );
    setSelectedContract({ ...selectedContract, content, lastEdited: now });
  };

  const createAccount = () => {
    const newAccount = {
      publicKey: `0x${Math.random().toString(16).substr(2, 40)}`,
      isActive: false,
    };
    setAccounts([...accounts, newAccount]);
  };

  const setActiveAccount = (publicKey: string) => {
    setAccounts(
      accounts.map((acc) => ({
        ...acc,
        isActive: acc.publicKey === publicKey,
      }))
    );
  };

  const loadExampleContract = (content: string) => {
    if (!selectedContract) return;
    updateContractContent(content);
  };

  const handleAudit = () => {
    if (!selectedContract) return;

    const dummyVulnerabilities = [
      {
        severity: "High",
        description: "Missing access control on critical function",
        location: "Line 15",
      },
      {
        severity: "Medium",
        description: "Potential integer overflow in arithmetic operation",
        location: "Line 23",
      },
      {
        severity: "Low",
        description: "Consider adding event emission for state changes",
        location: "Line 8",
      },
    ];

    toast({
      title: "Smart Contract Audit Results",
      description: (
        <div className="mt-2 space-y-2">
          {dummyVulnerabilities.map((vuln, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span
                className={`font-medium ${
                  vuln.severity === "High"
                    ? "text-red-500"
                    : vuln.severity === "Medium"
                    ? "text-yellow-500"
                    : "text-blue-500"
                }`}
              >
                {vuln.severity}:
              </span>
              <div className="flex-1">
                <p>{vuln.description}</p>
                <p className="text-xs text-muted-foreground">{vuln.location}</p>
              </div>
            </div>
          ))}
        </div>
      ),
      duration: 10000,
    });
  };

  const handleCompile = () => {
    toast({
      title: "Compiling Smart Contract",
      description: "Contract compiled successfully.",
    });
  };

  const handleDeploy = () => {
    const newTransaction: Transaction = {
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: new Date().toISOString(),
      status: "pending",
    };
    setTransactions([newTransaction, ...transactions]);

    toast({
      title: "Deploying Smart Contract",
      description: "Please connect your wallet to deploy the contract.",
    });
  };

  const handleCopyCode = () => {
    if (selectedContract) {
      navigator.clipboard.writeText(selectedContract.content);
      toast({
        title: "Code Copied",
        description: "Contract code has been copied to clipboard",
        duration: 2000,
      });
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isThinking) return;

    const userMessage = { role: "user" as const, content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsThinking(true);

    // Simulate AI thinking
    setTimeout(() => {
      const dummyResponses = [
        "In Move smart contracts, resource types are a unique feature that enables better asset management. They ensure that values can't be copied or discarded, only moved between storage locations.",
        "The key difference between Move and Solidity is Move's first-class support for resources. This makes it easier to represent and handle digital assets securely.",
        "To implement access control in Move, you typically use the `signer` type along with assertion functions. This ensures only authorized accounts can execute certain operations.",
      ];

      const aiMessage = {
        role: "assistant" as const,
        content:
          dummyResponses[Math.floor(Math.random() * dummyResponses.length)],
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsThinking(false);
    }, 1500);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar
        contracts={contracts}
        selectedContract={selectedContract}
        onContractSelect={setSelectedContract}
        onContractCreate={createContract}
        onContractDelete={deleteContract}
        onContractRename={renameContract}
        transactions={transactions}
        accounts={accounts}
        onCreateAccount={createAccount}
        onSetActiveAccount={setActiveAccount}
        exampleContracts={exampleContracts}
        onLoadExample={loadExampleContract}
      />
      <main className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 relative">
          {selectedContract ? (
            <>
              <div className="absolute top-2 right-2 z-10 flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  <span>{selectedContract.content.length} characters</span>
                  {selectedContract.lastEdited && (
                    <span className="ml-4">
                      Last edited:{" "}
                      {formatDistanceToNow(
                        new Date(selectedContract.lastEdited),
                        { addSuffix: true }
                      )}
                    </span>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                  <Copy size={16} className="mr-2" />
                  Copy Code
                </Button>
              </div>
              <Editor
                content={selectedContract.content}
                onChange={updateContractContent}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select or create a contract to start coding
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 bg-muted border-t border-border p-4">
          <Button
            className="py-4 text-base"
            variant="ghost"
            onClick={handleAudit}
          >
            Audit
          </Button>
          <Button
            className="py-4 text-base"
            variant="ghost"
            onClick={handleCompile}
          >
            Compile
          </Button>
          <Button
            className="py-4 text-base"
            variant="ghost"
            onClick={handleDeploy}
          >
            Deploy
          </Button>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Move Smart Contracts Assistant</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="text-sm text-muted-foreground">
                Ask your question about Move smart contracts and development.
              </div>
              <div className="flex-1 overflow-y-auto max-h-[400px] space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === "assistant"
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-muted text-muted-foreground">
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <form
                onSubmit={handleAskQuestion}
                className="flex flex-col gap-2"
              >
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question..."
                  className="min-h-[100px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion(e);
                    }
                  }}
                />
                <Button type="submit" disabled={isThinking}>
                  {isThinking ? "Thinking..." : "Ask"}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Index;
