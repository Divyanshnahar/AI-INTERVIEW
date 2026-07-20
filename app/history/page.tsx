import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Clock, Activity, Target } from "lucide-react";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const interviews = await prisma.interview.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Interview History</h1>
            <p className="text-white/50 text-lg">Review your past interview sessions</p>
          </div>
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all w-fit shadow-lg hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
        </header>

        {interviews.length === 0 ? (
          <div className="text-center py-20 text-white/50 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-md">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold text-white/80 mb-2">No Interviews Yet</h2>
            <p>You haven't completed any interview sessions.</p>
            <Link 
              href="/dashboard"
              className="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95"
            >
              Start New Interview
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interviews.map(interview => {
              // Calculate average score if available
              let avgScore = "--";
              if (interview.categoryScores && typeof interview.categoryScores === 'object') {
                const scoresMap = interview.categoryScores as Record<string, number>;
                const keys = Object.keys(scoresMap);
                if (keys.length > 0) {
                  const sum = keys.reduce((acc, k) => acc + (Number(scoresMap[k]) || 0), 0);
                  avgScore = String(Math.round(sum / keys.length));
                }
              }

              return (
                <Link 
                  href={`/interview/${interview.id}/feedback`} 
                  key={interview.id}
                  className="bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-3xl p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between transition-all group hover:scale-[1.02]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-xl line-clamp-1 flex-1 pr-4">{interview.jobTitle}</h3>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium tracking-wide uppercase flex items-center gap-1.5 shrink-0
                        ${interview.status === 'COMPLETED' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 
                          interview.status === 'IN_PROGRESS' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 
                          'bg-red-500/10 border-red-500/30 text-red-400'}
                      `}>
                        <Activity size={12} />
                        {interview.status.replace("_", " ")}
                      </div>
                    </div>
                    
                    <p className="text-white/40 text-sm mb-6 flex items-center gap-1.5">
                      <Clock size={14} />
                      {new Date(interview.createdAt).toLocaleDateString()} at {new Date(interview.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/70 group-hover:text-blue-400 transition-colors mt-4 pt-4 border-t border-white/10">
                    <Target size={16} />
                    <span className="text-sm font-medium">Average Score: {avgScore}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
