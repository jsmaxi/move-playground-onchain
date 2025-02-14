"use client";

import { useState, useRef, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Copy, MessageCircle, ZoomIn, ZoomOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  postAudit,
  postChat,
  postCompile,
  postDeploy,
  postProve,
} from "@/lib/server";
import Loading from "./Loading";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import Image from "next/image";

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
contract = "0x1a42874787568af30c785622899a27dacce066d671fa487e7fb958d6d0c85077"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework/", rev = "main"}`;

const defaultContract = `module contract::hello {
    use std::string;
    
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
  const [fontSize, setFontSize] = useState(14);
  const [isLoading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [credits, setCredits] = useState(1000);

  const log = (logText: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleString()}] ${logText}`]);
  };

  useEffect(() => {
    log("Welcome! Here you can view system logs in real-time.");
  }, []);

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

  const handleAudit = async () => {
    // const dummyVulnerabilities = [
    //   {
    //     severity: "High",
    //     description: "Missing access control on critical function",
    //     location: "Line 15",
    //   },
    //   {
    //     severity: "Medium",
    //     description: "Potential integer overflow in arithmetic operation",
    //     location: "Line 23",
    //   },
    //   {
    //     severity: "Low",
    //     description: "Consider adding event emission for state changes",
    //     location: "Line 8",
    //   },
    // ];

    // toast({
    //   title: "Smart Contract Audit Results",
    //   description: (
    //     <div className="mt-2 space-y-2">
    //       {dummyVulnerabilities.map((vuln, i) => (
    //         <div key={i} className="flex items-start gap-2 text-sm">
    //           <span
    //             className={`font-medium ${
    //               vuln.severity === "High"
    //                 ? "text-red-500"
    //                 : vuln.severity === "Medium"
    //                 ? "text-yellow-500"
    //                 : "text-blue-500"
    //             }`}
    //           >
    //             {vuln.severity}:
    //           </span>
    //           <div className="flex-1">
    //             <p>{vuln.description}</p>
    //             <p className="text-xs text-muted-foreground">{vuln.location}</p>
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   ),
    //   duration: 10000,
    // });

    if (!selectedContract) return;

    if (credits < 100) {
      log("Insufficient MOVE tokens. You need 100 MOVE tokens to audit.");
      return;
    }
    setCredits((prev) => prev - 100);

    try {
      setLoading(true);
      console.log(selectedContract);
      log("Auditing...");
      const result = await postAudit(
        selectedContract.content,
        selectedContract.toml
      );
      console.log(result);
      log("Audit response: " + result);
    } finally {
      setLoading(false);
    }
  };

  const handleCompile = async () => {
    if (!selectedContract) return;

    if (credits < 50) {
      log("Insufficient MOVE tokens. You need 50 MOVE tokens to compile.");
      return;
    }
    setCredits((prev) => prev - 50);

    try {
      setLoading(true);
      console.log(selectedContract);
      log("Compiling...");
      const result = await postCompile(
        selectedContract.content,
        selectedContract.toml
      );
      console.log(result);
      log("Compile response: " + result);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    // const newTransaction: Transaction = {
    //   hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    //   timestamp: new Date().toISOString(),
    //   status: "pending",
    // };
    // setTransactions([newTransaction, ...transactions]);

    if (!selectedContract) return;

    if (credits < 200) {
      log("Insufficient MOVE tokens. You need 200 MOVE tokens to deploy.");
      return;
    }
    setCredits((prev) => prev - 200);

    try {
      setLoading(true);
      console.log(selectedContract);
      log("Deploying...");
      const result = await postDeploy(
        selectedContract.content,
        selectedContract.toml
      );
      console.log(result);
      log("Deploy response: " + result);
    } finally {
      setLoading(false);
    }
  };

  const handleProve = async () => {
    if (!selectedContract) return;

    if (credits < 100) {
      log("Insufficient MOVE tokens. You need 100 MOVE tokens to use prover.");
      return;
    }
    setCredits((prev) => prev - 100);

    try {
      setLoading(true);
      console.log(selectedContract);
      log("Proving...");
      const result = await postProve(
        selectedContract.content,
        selectedContract.toml
      );
      console.log(result);
      log("Prove response: " + result);
    } finally {
      setLoading(false);
    }
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

    try {
      console.log(question);
      const result = await postChat(question);
      console.log(result);
      const aiMessage = {
        role: "assistant" as const,
        content: result,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleZoomIn = () => {
    setFontSize((prev) => Math.min(prev + 2, 24));
  };

  const handleZoomOut = () => {
    setFontSize((prev) => Math.max(prev - 2, 10));
  };

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
        credits={credits}
      />
      <main className="flex flex-col flex-1 overflow-hidden">
        <ResizablePanelGroup direction="vertical" className="flex-1">
          <ResizablePanel defaultSize={75} minSize={50}>
            <div className="relative h-full">
              {selectedContract ? (
                <>
                  <div className="absolute top-2 right-8 z-10 flex items-center gap-4">
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

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                    >
                      <Copy size={16} className="mr-2" />
                      Copy Code
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleZoomIn}
                      >
                        <ZoomIn size={16} />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleZoomOut}
                      >
                        <ZoomOut size={16} />
                      </Button>
                    </div>
                  </div>
                  <Editor
                    content={selectedContract.content}
                    onChange={updateContractContent}
                    fontSize={fontSize}
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Select or create a contract to start coding
                </div>
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25} minSize={10} maxSize={50}>
            <div className="h-full bg-editor-bg p-4 font-mono text-sm text-editor-text overflow-auto text-gray-400">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        <div className="grid grid-cols-4 gap-4 bg-muted border-t border-border p-2">
          <Button
            className="py-4 text-base border-r-2 border-gray-300 rounded-none"
            variant="ghost"
            onClick={handleAudit}
            disabled={isLoading}
          >
            {isLoading && <Loading />}
            Audit AI
            <div className="flex items-center gap-1 text-sm font-medium text-gray-400 ml-4">
              <Image src={"/movement.png"} alt="MOVE" width={10} height={10} />
              <span>100</span>
            </div>
          </Button>
          <Button
            className="py-4 text-base border-r-2 border-gray-300 rounded-none"
            variant="ghost"
            onClick={handleCompile}
            disabled={isLoading}
          >
            {isLoading && <Loading />}
            Compile
            <div className="flex items-center gap-1 text-sm font-medium text-gray-400 ml-4">
              <Image src={"/movement.png"} alt="MOVE" width={10} height={10} />
              <span>50</span>
            </div>
          </Button>
          <Button
            className="py-4 text-base border-r-2 border-gray-300 rounded-none"
            variant="ghost"
            onClick={handleDeploy}
            disabled={isLoading}
          >
            {isLoading && <Loading />}
            Deploy
            <div className="flex items-center gap-1 text-sm font-medium text-gray-400 ml-4">
              <Image src={"/movement.png"} alt="MOVE" width={10} height={10} />
              <span>200</span>
            </div>
          </Button>
          <Button
            className="py-4 text-base border-gray-300 rounded-none"
            variant="ghost"
            onClick={handleProve}
            disabled={isLoading}
          >
            {isLoading && <Loading />}
            Prove
            <div className="flex items-center gap-1 text-sm font-medium text-gray-400 ml-4">
              <Image src={"/movement.png"} alt="MOVE" width={10} height={10} />
              <span>100</span>
            </div>
          </Button>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-20 right-8 h-12 w-12 rounded-full shadow-lg"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Move Smart Contracts AI Assistant</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="text-sm text-muted-foreground">
                Ask your questions about Move smart contracts and development.
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
