import { Button } from "@/components/ui/button";
import {
    ChatBubble,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { useTransition, animated, type AnimatedProps } from "@react-spring/web";
import { Paperclip, Send, X, Bot, ShieldAlert, Cpu, Sparkles, Sliders } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Content, UUID } from "@elizaos/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { cn, moment } from "@/lib/utils";
import { Avatar, AvatarImage } from "./ui/avatar";
import CopyButton from "./copy-button";
import ChatTtsButton from "./ui/chat/chat-tts-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import AIWriter from "react-aiwriter";
import type { IAttachment } from "@/types";
import { AudioRecorder } from "./audio-recorder";
import { Badge } from "./ui/badge";
import { useAutoScroll } from "./ui/chat/hooks/useAutoScroll";
import { useAuth } from "../App";

type ExtraContentFields = {
    user: string;
    createdAt: number;
    isLoading?: boolean;
};

type ContentWithUser = Content & ExtraContentFields;

type AnimatedDivProps = AnimatedProps<{ style: React.CSSProperties }> & {
    children?: React.ReactNode;
};

export default function Page({ agentId }: { agentId: UUID }) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [input, setInput] = useState("");
    const [activeProvider, setActiveProvider] = useState("groq"); // default client choice
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const queryClient = useQueryClient();

    const getMessageVariant = (role: string) =>
        role !== "user" ? "received" : "sent";

    const { scrollRef, isAtBottom, scrollToBottom, disableAutoScroll } = useAutoScroll({
        smooth: true,
    });
   
    useEffect(() => {
        scrollToBottom();
    }, [queryClient.getQueryData(["messages", agentId])]);

    useEffect(() => {
        scrollToBottom();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (e.nativeEvent.isComposing) return;
            handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input) return;

        const attachments: IAttachment[] | undefined = selectedFile
            ? [
                  {
                      url: URL.createObjectURL(selectedFile),
                      contentType: selectedFile.type,
                      title: selectedFile.name,
                  },
              ]
            : undefined;

        const newMessages = [
            {
                text: input,
                user: "user",
                createdAt: Date.now(),
                attachments,
            },
            {
                text: input,
                user: "system",
                isLoading: true,
                createdAt: Date.now(),
            },
        ];

        queryClient.setQueryData(
            ["messages", agentId],
            (old: ContentWithUser[] = []) => [...old, ...newMessages]
        );

        sendMessageMutation.mutate({
            message: input,
            selectedFile: selectedFile ? selectedFile : null,
        });

        setSelectedFile(null);
        setInput("");
        formRef.current?.reset();
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const sendMessageMutation = useMutation({
        mutationKey: ["send_message", agentId],
        mutationFn: ({
            message,
            selectedFile,
        }: {
            message: string;
            selectedFile?: File | null;
        }) => apiClient.sendMessage(agentId, message, selectedFile),
        onSuccess: (newMessages: ContentWithUser[]) => {
            queryClient.setQueryData(
                ["messages", agentId],
                (old: ContentWithUser[] = []) => [
                    ...old.filter((msg) => !msg.isLoading),
                    ...newMessages.map((msg) => ({
                        ...msg,
                        createdAt: Date.now(),
                    })),
                ]
            );
        },
        onError: (e) => {
            toast({
                variant: "destructive",
                title: "Unable to send message",
                description: e.message,
            });
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file?.type.startsWith("image/")) {
            setSelectedFile(file);
        }
    };

    const messages =
        queryClient.getQueryData<ContentWithUser[]>(["messages", agentId]) ||
        [];

    const transitions = useTransition(messages, {
        keys: (message) =>
            `${message.createdAt}-${message.user}-${message.text}`,
        from: { opacity: 0, transform: "translateY(20px)" },
        enter: { opacity: 1, transform: "translateY(0px)" },
        leave: { opacity: 0, transform: "translateY(5px)" },
    });

    const CustomAnimatedDiv = animated.div as React.FC<AnimatedDivProps>;

    return (
        <div className="flex flex-col w-full h-screen bg-slate-950/65 backdrop-blur-lg border-l border-slate-900">
            {/* Header / Info Panel */}
            <div className="flex items-center justify-between border-b border-slate-900 px-6 py-4 bg-slate-950/80 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Avatar className="size-10 p-0.5 border border-slate-800 rounded-full select-none bg-slate-900 flex items-center justify-center">
                        <Bot className="size-6 text-purple-400" />
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-white tracking-tight flex items-center gap-2">
                            AI Agent Swarm
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {agentId}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Model Provider selector dropdown */}
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                        <Cpu className="size-3.5 text-purple-400" />
                        <select 
                            value={activeProvider} 
                            onChange={(e) => {
                                setActiveProvider(e.target.value);
                                toast({
                                    title: "Swapped Provider",
                                    description: `Using ${e.target.value.toUpperCase()} answering backend.`,
                                });
                            }}
                            className="bg-transparent text-[11px] font-semibold text-slate-200 outline-none cursor-pointer capitalize"
                        >
                            <option value="groq" className="bg-slate-900 text-slate-200">Groq Llama-3</option>
                            <option value="openai" className="bg-slate-900 text-slate-200">OpenAI GPT-4o</option>
                            <option value="gemini" className="bg-slate-900 text-slate-200">Google Gemini</option>
                        </select>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-purple-950/40 border border-purple-500/25 text-purple-400">
                        {user?.subscriptionTier || "Free"} Active
                    </span>
                </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <ChatMessageList 
                    scrollRef={scrollRef}
                    isAtBottom={isAtBottom}
                    scrollToBottom={scrollToBottom}
                    disableAutoScroll={disableAutoScroll}
                    className="p-6 flex flex-col gap-6"
                >
                    {transitions((style, message: ContentWithUser) => {
                        const variant = getMessageVariant(message?.user);
                        const isSystem = message?.user !== "user";

                        return (
                            <CustomAnimatedDiv
                                style={{
                                    ...style,
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                }}
                            >
                                <div className={cn([
                                    "flex items-start gap-3 max-w-3xl",
                                    isSystem ? "self-start" : "self-end flex-row-reverse"
                                ])}>
                                    {isSystem ? (
                                        <div className="size-8 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                                            <Bot className="size-4.5 text-purple-400" />
                                        </div>
                                    ) : null}

                                    <div className="flex flex-col gap-1.5 w-full">
                                        <div className={cn([
                                            "rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
                                            isSystem 
                                                ? "bg-slate-900/40 border border-slate-800/80 text-slate-200 rounded-tl-sm"
                                                : "bg-gradient-to-tr from-purple-600 to-blue-600 text-white rounded-tr-sm shadow-purple-500/5"
                                        ])}>
                                            {isSystem ? (
                                                message?.isLoading ? (
                                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                                        <span className="size-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.3s]" />
                                                        <span className="size-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
                                                        <span className="size-1.5 rounded-full bg-purple-500 animate-bounce" />
                                                        Eliza is thinking...
                                                    </div>
                                                ) : (
                                                    <AIWriter>
                                                        {message?.text}
                                                    </AIWriter>
                                                )
                                            ) : (
                                                message?.text
                                            )}

                                            {/* Media Attachments */}
                                            {message?.attachments && message.attachments.length > 0 && (
                                                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-800/30">
                                                    {message.attachments.map((attachment: IAttachment) => (
                                                        <div
                                                            className="flex flex-col gap-1 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-w-sm"
                                                            key={`${attachment.url}-${attachment.title}`}
                                                        >
                                                            <img
                                                                alt="attachment"
                                                                src={attachment.url}
                                                                className="w-full object-cover max-h-48"
                                                            />
                                                            <div className="p-2 text-[10px] text-slate-500 font-medium truncate">
                                                                {attachment.title}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions panel */}
                                        <div className={cn([
                                            "flex items-center gap-3 mt-1",
                                            isSystem ? "justify-start" : "justify-end"
                                        ])}>
                                            {message?.text && !message?.isLoading && (
                                                <div className="flex items-center gap-1">
                                                    <CopyButton text={message?.text} />
                                                    <ChatTtsButton agentId={agentId} text={message?.text} />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 select-none text-[10px] text-slate-500">
                                                {message?.source && (
                                                    <Badge variant="outline" className="border-slate-800 bg-slate-900/50 text-[9px] font-semibold text-slate-400">
                                                        {message.source}
                                                    </Badge>
                                                )}
                                                {message?.action && (
                                                    <Badge variant="outline" className="border-purple-500/20 bg-purple-950/20 text-[9px] font-semibold text-purple-400">
                                                        {message.action}
                                                    </Badge>
                                                )}
                                                {message?.createdAt && (
                                                    <ChatBubbleTimestamp
                                                        timestamp={moment(message.createdAt).format("LT")}
                                                        className="text-slate-500 text-[10px]"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CustomAnimatedDiv>
                        );
                    })}
                </ChatMessageList>
            </div>

            {/* Input Footer */}
            <div className="px-6 pb-6 pt-2 bg-slate-950/40">
                <form
                    ref={formRef}
                    onSubmit={handleSendMessage}
                    className="relative rounded-2xl border border-slate-900 bg-slate-950 p-2 shadow-2xl focus-within:border-purple-500/50 transition-colors"
                >
                    {selectedFile && (
                        <div className="p-2 flex">
                            <div className="relative rounded-xl border border-slate-800 p-2 bg-slate-900/40">
                                <Button
                                    onClick={() => setSelectedFile(null)}
                                    className="absolute -right-2 -top-2 size-[22px] rounded-full bg-red-950 border border-red-500/30 text-red-400 hover:bg-red-900"
                                    variant="outline"
                                    size="icon"
                                >
                                    <X className="size-3" />
                                </Button>
                                <img
                                    alt="Selected file"
                                    src={URL.createObjectURL(selectedFile)}
                                    className="aspect-square object-contain w-16 rounded"
                                />
                            </div>
                        </div>
                    )}
                    
                    <ChatInput
                        ref={inputRef}
                        onKeyDown={handleKeyDown}
                        value={input}
                        onChange={({ target }) => setInput(target.value)}
                        placeholder="Type a message or trigger blockchain operations..."
                        className="min-h-12 resize-none rounded-xl bg-transparent border-0 p-3 shadow-none focus-visible:ring-0 text-slate-100 placeholder-slate-600 text-sm"
                    />
                    
                    <div className="flex items-center p-2 pt-0 border-t border-slate-900/40 mt-1 justify-between">
                        <div className="flex items-center gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            onClick={() => {
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.click();
                                                }
                                            }}
                                            className="hover:bg-slate-900 text-slate-500 hover:text-slate-300"
                                        >
                                            <Paperclip className="size-4" />
                                            <span className="sr-only">Attach file</span>
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="text-xs">Attach image</p>
                                </TooltipContent>
                            </Tooltip>
                            
                            <AudioRecorder
                                agentId={agentId}
                                onChange={(newInput: string) => setInput(newInput)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                disabled={!input || sendMessageMutation?.isPending}
                                type="submit"
                                size="sm"
                                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/10 active:scale-[0.98] transition flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                            >
                                {sendMessageMutation?.isPending ? "Sending..." : "Send Message"}
                                <Send className="size-3" />
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
