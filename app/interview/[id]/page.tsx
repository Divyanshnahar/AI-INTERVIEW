"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import VoiceInput from "@/components/VoiceInput";
import { Loader2, User, Bot, AlertCircle, Volume2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export default function InterviewRoom() {
  const params = useParams();
  const router = useRouter();
  
  // Safe extraction of id
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat when history updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isAIThinking, isAISpeaking]);

  const handleUserResponse = async (transcript: string) => {
    if (!transcript.trim() || !id) return;

    // Clear any previous errors
    setError(null);

    // 1. Add user's text to local chat history immediately
    setChatHistory((prev) => [...prev, { role: "user", content: transcript }]);
    setIsAIThinking(true);

    try {
      // 2. Fetch the next question from Gemini
      const nextQRes = await fetch("/api/interview/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: id, studentAnswer: transcript }),
      });

      if (!nextQRes.ok) {
        throw new Error("Failed to generate the next question from the AI.");
      }

      const data = await nextQRes.json();
      const nextQuestion = data.nextQuestion;
      
      // 3. Add AI's text to the chat history
      setChatHistory((prev) => [...prev, { role: "ai", content: nextQuestion }]);
      setIsAIThinking(false);
      setIsAISpeaking(true);

      // 4. Fetch the Text-to-Speech audio
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: nextQuestion }),
      });

      if (!ttsRes.ok) {
        throw new Error("Failed to generate audio response.");
      }

      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Handle when audio finishes playing
      audio.onended = () => {
        setIsAISpeaking(false);
        if (data.isComplete) {
          router.push(`/interview/${id}/feedback`);
        }
      };

      // Play the audio
      await audio.play();

    } catch (err: any) {
      console.error("Interview flow error:", err);
      setError(err.message || "An unexpected error occurred. Please try speaking again.");
      setIsAIThinking(false);
      setIsAISpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-wide">AI Interview Room</h1>
            <p className="text-sm text-white/50">Keep your answers clear and concise</p>
          </div>
        </div>
        
        {/* Dynamic Status Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          {isAISpeaking ? (
            <>
              <Volume2 size={16} className="text-green-400 animate-pulse" />
              <span className="text-sm font-medium text-green-400">AI is speaking...</span>
            </>
          ) : isAIThinking ? (
            <>
              <Loader2 size={16} className="text-blue-400 animate-spin" />
              <span className="text-sm font-medium text-blue-400">AI is thinking...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-white/20"></div>
              <span className="text-sm font-medium text-white/40">Waiting for you...</span>
            </>
          )}
        </div>
      </header>

      {/* Error Boundary Display */}
      {error && (
        <div className="mx-8 mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-8 pb-32">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-white/30 space-y-4">
              <Bot size={48} className="opacity-20" />
              <p className="text-lg">The interview will begin when you submit your first response.</p>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`flex gap-4 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                    ${msg.role === "user" ? "bg-blue-600/20 text-blue-400" : "bg-white/10 text-white/60"}`}
                  >
                    {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  
                  <div className={`p-5 rounded-2xl text-lg leading-relaxed shadow-lg
                    ${msg.role === "user" 
                      ? "bg-blue-600 text-white rounded-tr-sm" 
                      : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm backdrop-blur-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Thinking Skeleton */}
          {isAIThinking && (
            <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2">
              <div className="flex gap-4 max-w-[80%]">
                <div className="shrink-0 w-10 h-10 rounded-full bg-white/10 text-white/60 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div className="p-5 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 flex items-center gap-2">
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          {/* Disable VoiceInput while AI is processing or speaking to prevent overlap */}
          <div className={`transition-opacity duration-300 ${isAIThinking || isAISpeaking ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <VoiceInput onSubmit={handleUserResponse} />
          </div>
        </div>
      </div>
    </div>
  );
}
