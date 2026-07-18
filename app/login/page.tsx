import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900/20 to-slate-900 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-12 relative">
        <Link 
          href="/" 
          className="absolute -top-16 left-0 flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            AI Interviewer
          </h1>
        </div>

        <AuthForm />
      </div>
    </main>
  );
}
