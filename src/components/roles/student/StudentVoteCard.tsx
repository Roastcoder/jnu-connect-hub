import { useState } from "react";
import { Trophy, Check, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function StudentVoteCard({
  contestant,
  hasVoted,
  onVoteSuccess,
}: {
  contestant: {
    id: string;
    name: string;
    photo: string;
    bio: string;
    department?: string;
    college?: string;
  };
  hasVoted: boolean;
  onVoteSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(hasVoted);

  async function handleVote() {
    if (voted || loading) return;
    setLoading(true);
    try {
      const res = await api.student.castVote(contestant.id);
      if (res && (res as any).success) {
        setVoted(true);
        toast.success(`Voted for ${contestant.name}! 🎉`);
        if (onVoteSuccess) onVoteSuccess();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit vote");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card p-5 shadow-elevated transition-all hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-glow">
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-2xl bg-muted">
        <img
          src={contestant.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"}
          alt={contestant.name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="font-display text-lg font-bold truncate">{contestant.name}</div>
          <div className="text-xs text-white/80 truncate">{contestant.department || contestant.college || "JNU"}</div>
        </div>
      </div>

      {contestant.bio && <p className="mb-4 text-xs text-muted-foreground line-clamp-2">{contestant.bio}</p>}

      <div className="mt-auto">
        <button
          onClick={handleVote}
          disabled={voted || loading}
          className={
            "w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all " +
            (voted
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-default"
              : "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95")
          }
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : voted ? (
            <>
              <Check className="size-4" /> Voted
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Vote for {contestant.name.split(" ")[0]}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
