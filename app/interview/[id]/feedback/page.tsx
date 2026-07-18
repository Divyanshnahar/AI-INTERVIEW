import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ScoreChart from "@/components/ScoreChart";
import { User, Bot, Target, FileText, Activity } from "lucide-react";

export default async function FeedbackPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      transcripts: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!interview) {
    notFound();
  }

  // Parse and format category scores for the Radar Chart
  let scoresList: { subject: string; score: number }[] = [];
  let averageScore = 0;

  if (interview.categoryScores && typeof interview.categoryScores === 'object') {
    const scoresMap = interview.categoryScores as Record<string, number>;
    const keys = Object.keys(scoresMap);
    
    if (keys.length > 0) {
      scoresList = keys.map(key => ({
        subject: key,
        score: Number(scoresMap[key]) || 0
      }));
      
      const sum = scoresList.reduce((acc, curr) => acc + curr.score, 0);
      averageScore = Math.round(sum / keys.length);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Interview Feedback</h1>
            <p className="text-white/50 text-lg">
              Role: <span className="text-white/90 font-medium">{interview.jobTitle}</span>
            </p>
          </div>
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 w-fit">
            <Activity size={16} className="text-blue-400" />
            <span className="text-sm font-medium tracking-wide uppercase text-blue-100">
              {interview.status.replace("_", " ")}
            </span>
          </div>
        </header>

        {/* Section 1 & 2: Overview & Visual Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Overview Cards */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] pointer-events-none rounded-full"></div>
              <div className="flex items-center gap-3 text-white/50 mb-6 relative z-10">
                <Target size={20} className="text-blue-400" />
                <h2 className="font-semibold uppercase tracking-wider text-sm">Overall Score</h2>
              </div>
              <div className="text-7xl font-bold text-white relative z-10 tracking-tighter">
                {averageScore > 0 ? averageScore : "--"}
                <span className="text-2xl text-white/30 font-normal ml-1">/100</span>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl flex flex-col">
            <h2 className="font-semibold text-lg mb-6 text-white/90">Skill Breakdown</h2>
            <div className="flex-1 min-h-[300px] w-full">
              <ScoreChart data={scoresList} />
            </div>
          </div>
        </div>

        {/* Section 3: Detailed Feedback & Transcript */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-md shadow-2xl mt-8">
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
            <FileText size={28} className="text-blue-400" />
            <h2 className="text-2xl font-bold">Detailed Transcript & Recruiter Notes</h2>
          </div>
          
          <div className="space-y-12">
            {interview.transcripts.map((msg, index) => (
              <div key={msg.id} className="flex flex-col gap-5 animate-in slide-in-from-bottom-4 fade-in duration-500" style={{ animationFillMode: 'both', animationDelay: `${index * 100}ms` }}>
                {/* Chat Bubble */}
                <div className={`flex w-full ${msg.role === "STUDENT" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-4 w-full md:max-w-[85%] ${msg.role === "STUDENT" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg
                      ${msg.role === "STUDENT" ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "bg-white/10 text-white/60 border border-white/10"}`}
                    >
                      {msg.role === "STUDENT" ? <User size={24} /> : <Bot size={24} />}
                    </div>
                    
                    <div className={`p-6 rounded-2xl text-lg leading-relaxed shadow-xl
                      ${msg.role === "STUDENT" 
                        ? "bg-blue-600/90 text-white rounded-tr-sm" 
                        : "bg-white/10 border border-white/10 text-white/90 rounded-tl-sm backdrop-blur-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>

                {/* AI Evaluation Note */}
                {msg.role === "AI" && msg.aiEvaluation && (
                  <div className="w-full flex justify-start pl-16 md:pl-20">
                    <div className="w-full md:max-w-[75%] bg-gradient-to-r from-blue-900/30 to-blue-900/10 border-l-4 border-blue-500 rounded-r-xl rounded-bl-sm p-5 text-blue-100/80 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-2xl"></div>
                      <p className="font-semibold text-blue-400 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <Target size={16} />
                        Recruiter Note
                      </p>
                      <p className="leading-relaxed text-base">{msg.aiEvaluation}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {interview.transcripts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-white/30 space-y-4">
                <FileText size={48} className="opacity-20" />
                <p className="text-lg">No transcript data available for this session.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
