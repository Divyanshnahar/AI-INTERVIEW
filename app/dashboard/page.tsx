"use client";

import { useActionState } from "react";
import { startInterviewAction } from "@/actions/startInterview";
import { Briefcase, Upload, Loader2, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [state, formAction, isPending] = useActionState(startInterviewAction, null);

  return (
    <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-blue-500/20 blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">New Interview Session</h1>
          <p className="text-white/60 mb-8 text-lg">Upload your resume and the job details to begin.</p>

          {state?.error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-medium">{state.error}</p>
            </div>
          )}

          <form action={formAction} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="jobTitle" className="text-sm font-medium text-white/80">
                Job Title
              </label>
              <div className="relative">
                <Briefcase size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  id="jobTitle" 
                  name="jobTitle"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="jobDescription" className="text-sm font-medium text-white/80">
                Job Description
              </label>
              <textarea 
                id="jobDescription" 
                name="jobDescription"
                required
                placeholder="Paste the detailed job description here..."
                rows={5}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-white placeholder:text-white/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="resume" className="text-sm font-medium text-white/80">
                Resume (PDF only)
              </label>
              <div className="relative group cursor-pointer">
                <input 
                  type="file" 
                  id="resume" 
                  name="resume"
                  accept="application/pdf"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full bg-black/40 border border-dashed border-white/20 rounded-xl py-10 px-4 flex flex-col items-center justify-center gap-4 group-hover:border-blue-500 group-hover:bg-blue-500/5 transition-all">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors text-white/60">
                    <Upload size={28} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-white/90">Click or drag your PDF here</p>
                    <p className="text-sm text-white/40 mt-1">Maximum file size: 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-4 px-6 font-semibold shadow-[0_0_30px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]"
            >
              {isPending ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  <span className="text-lg tracking-wide">Initializing Session...</span>
                </>
              ) : (
                <span className="text-lg tracking-wide">Start Interview</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
