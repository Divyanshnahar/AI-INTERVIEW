import { auth, signOut } from "@/auth";
import AuthForm from "@/components/AuthForm";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900/20 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            AI Interviewer
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Master your next interview with our intelligent AI platform. Practice, receive feedback, and land your dream job.
          </p>
        </div>

        {session?.user ? (
          <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-2xl text-white font-bold">
                {session.user.email?.[0].toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back!
            </h2>
            <p className="text-gray-300 mb-8">
              {session.user.email}
            </p>
            
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold rounded-lg transition-all"
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <AuthForm />
        )}
      </div>
    </main>
  );
}
