import { auth, signOut } from "@/auth";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Sparkles, User, LogOut, History } from "lucide-react";
import UpdateResumeModal from "@/components/UpdateResumeModal";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">AI Interviewer</span>
          </div>
          
          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/history"
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors mr-2"
                >
                  <History className="w-4 h-4" />
                  History
                </Link>
                <UpdateResumeModal />
                <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 py-1.5 px-3 rounded-full border border-white/10">
                  <User className="w-4 h-4" />
                  {session.user.email}
                </div>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button
                    type="submit"
                    className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <Link 
                href="/login"
                className="bg-white text-black hover:bg-gray-100 px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-16 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>The future of interview prep is here</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Master your next interview with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient">
              Intelligent AI
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
            Practice with realistic AI interviewers, receive personalized feedback, and land your dream job with confidence. Experience the most advanced preparation platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Link 
              href={session?.user ? "/dashboard" : "/login"}
              className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-full text-white font-semibold text-lg overflow-hidden transition-transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative">Start Practicing Now</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-16 text-left">
            {[
              { title: "Realistic Scenarios", desc: "Industry-specific technical and behavioral rounds." },
              { title: "Instant Feedback", desc: "Detailed analysis on your answers and delivery." },
              { title: "Personalized Growth", desc: "Track progress and improve with targeted advice." }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
                <CheckCircle2 className="w-6 h-6 text-purple-400 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
