import TTSPlayer from "@/components/TTSPlayer";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  // Protect the dashboard route
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900/20 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400">Welcome back, {session.user.email}</p>
            </div>
          </div>
          
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </header>

        <div className="grid gap-8">
          {/* We can add more dashboard widgets here later. For now, just the TTS Player */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-6">Tools</h2>
            <TTSPlayer />
          </section>
        </div>
      </div>
    </main>
  );
}
