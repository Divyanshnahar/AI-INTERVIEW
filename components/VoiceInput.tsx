"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, AlertCircle, Sparkles } from "lucide-react";

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognition };
    webkitSpeechRecognition?: { new (): SpeechRecognition };
  }
}

interface VoiceInputProps {
  onSubmit?: (transcript: string) => void;
}

export default function VoiceInput({ onSubmit }: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalStr = "";
      let interimStr = "";
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }
      
      if (finalStr) {
        setTranscript((prev) => (prev + " " + finalStr).trim());
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone permission denied. Please allow access to use voice input.");
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, interimTranscript]);

  const toggleListening = () => {
    setError(null);
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    const finalTranscript = (transcript + " " + interimTranscript).trim();
    if (finalTranscript && onSubmit) {
      onSubmit(finalTranscript);
      clearTranscript();
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 max-w-2xl mx-auto w-full">
        <AlertCircle size={24} />
        <p className="text-sm font-medium">
          Speech recognition is not supported in this browser. Please try Chrome or Edge.
        </p>
      </div>
    );
  }

  const hasContent = transcript.length > 0 || interimTranscript.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <div 
        className={`relative w-full h-64 flex flex-col rounded-3xl border-2 transition-all duration-500 overflow-hidden backdrop-blur-md shadow-2xl
          ${isListening 
            ? 'border-red-500/40 bg-gradient-to-b from-red-500/10 to-transparent shadow-[0_0_40px_rgba(239,68,68,0.15)]' 
            : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
      >
        {/* Header Indicator */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-3 h-3">
              {isListening && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening ? 'bg-red-500' : 'bg-white/20'}`}></span>
            </div>
            <span className={`text-sm font-medium tracking-wide uppercase ${isListening ? 'text-red-400' : 'text-white/40'}`}>
              {isListening ? "Recording Active" : "Ready to Record"}
            </span>
          </div>
          {hasContent && !isListening && (
            <button 
              onClick={clearTranscript}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Transcript Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="text-xl leading-relaxed font-light tracking-wide">
            {!hasContent ? (
              <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-white/20 gap-3">
                <Sparkles size={32} className="opacity-50" />
                <p>Tap the microphone and start speaking...</p>
              </div>
            ) : (
              <p className="text-white/90">
                {transcript}
                {interimTranscript && (
                  <span className="text-white/50 animate-pulse ml-1">{interimTranscript}</span>
                )}
              </p>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-red-500/90 backdrop-blur-md border-t border-red-500 flex items-center justify-center gap-2 text-white text-sm font-medium shadow-lg z-10 animate-in slide-in-from-bottom-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 px-2">
        <button
          onClick={toggleListening}
          className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 hover:scale-105 active:scale-95
            ${isListening 
              ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)]' 
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
            }`}
        >
          {isListening && (
            <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
          )}
          {isListening ? (
            <MicOff size={32} className="relative z-10" />
          ) : (
            <Mic size={32} className="relative z-10" />
          )}
        </button>

        <button
          onClick={handleSubmit}
          disabled={!hasContent}
          className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300
            ${hasContent
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95'
              : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
            }`}
        >
          <span className="text-lg">Submit</span>
          <Send size={20} className={hasContent ? 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform' : ''} />
        </button>
      </div>
    </div>
  );
}
