import React, { useState, useEffect } from "react";
import { useSummarizeThoughts, useAskBrain } from "@workspace/api-client-react";
import { subscribeToThoughts, createThought, removeThought, Thought } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, Copy, Sparkles, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [newThought, setNewThought] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<string | null>(null);

  const { toast } = useToast();
  
  const summarizeMutation = useSummarizeThoughts();
  const askBrainMutation = useAskBrain();

  useEffect(() => {
    const unsubscribe = subscribeToThoughts((fetchedThoughts) => {
      setThoughts(fetchedThoughts);
    });
    return () => unsubscribe();
  }, []);

  const handleAddThought = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThought.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createThought(newThought);
      setNewThought("");
      toast({ title: "Thought added", description: "Your thought has been safely stored." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add thought.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteThought = async (id: string) => {
    try {
      await removeThought(id);
      toast({ title: "Thought deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete thought.", variant: "destructive" });
    }
  };

  const handleSummarize = () => {
    if (thoughts.length === 0) {
      toast({ title: "No thoughts", description: "Add some thoughts first to summarize them." });
      return;
    }
    
    summarizeMutation.mutate(
      { data: { thoughts: thoughts.map(t => ({ text: t.text, createdAt: t.createdAt })) } },
      {
        onSuccess: (data) => {
          setSummaryResult(data.result);
          toast({ title: "Summarized successfully" });
        },
        onError: () => {
          toast({ title: "Failed to summarize", variant: "destructive" });
        }
      }
    );
  };

  const handleAskBrain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (thoughts.length === 0) {
      toast({ title: "No thoughts", description: "Add some thoughts first before asking your brain." });
      return;
    }

    askBrainMutation.mutate(
      { data: { question, thoughts: thoughts.map(t => ({ text: t.text, createdAt: t.createdAt })) } },
      {
        onSuccess: (data) => {
          setAnswerResult(data.result);
          toast({ title: "Answer received" });
        },
        onError: () => {
          toast({ title: "Failed to get answer", variant: "destructive" });
        }
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="min-h-screen w-full py-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-3">
          <h1 className="font-serif text-5xl md:text-6xl text-foreground tracking-tight" data-testid="heading-title">NeuroAI</h1>
          <p className="text-muted-foreground text-lg" data-testid="heading-subtitle">Your thoughts, organized by AI.</p>
        </header>

        {/* Input Section */}
        <section className="space-y-4">
          <form onSubmit={handleAddThought} className="space-y-4">
            <Textarea 
              value={newThought}
              onChange={(e) => setNewThought(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[120px] text-lg resize-none rounded-xl bg-card border-card-border p-4 focus-visible:ring-primary shadow-sm"
              data-testid="input-thought"
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || !newThought.trim()}
                className="rounded-lg px-6 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                data-testid="button-submit-thought"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Add Thought
              </Button>
            </div>
          </form>
        </section>

        {/* AI Features */}
        {thoughts.length > 0 && (
          <section className="grid gap-8 md:grid-cols-2">
            {/* Summarize */}
            <div className="space-y-4">
              <Button 
                onClick={handleSummarize} 
                variant="outline" 
                className="w-full rounded-lg justify-start h-auto py-4 bg-card hover:bg-card/80 border-card-border shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.99]"
                disabled={summarizeMutation.isPending}
                data-testid="button-summarize"
              >
                <Sparkles className="w-5 h-5 mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-medium text-foreground">Summarize my thoughts</div>
                  <div className="text-xs text-muted-foreground font-normal">Extract key themes and ideas</div>
                </div>
              </Button>
              
              <AnimatePresence>
                {summaryResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="rounded-xl bg-card border-card-border shadow-sm overflow-hidden relative group">
                      <CardContent className="p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {summaryResult}
                      </CardContent>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(summaryResult)}
                        data-testid="button-copy-summary"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ask Brain */}
            <div className="space-y-4">
              <form onSubmit={handleAskBrain} className="relative">
                <Brain className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
                <Input 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask your brain a question..."
                  className="pl-11 pr-24 py-6 rounded-xl bg-card border-card-border focus-visible:ring-primary shadow-sm"
                  data-testid="input-ask-brain"
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={askBrainMutation.isPending || !question.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  data-testid="button-submit-question"
                >
                  {askBrainMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask'}
                </Button>
              </form>

              <AnimatePresence>
                {answerResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="rounded-xl bg-card border-card-border shadow-sm overflow-hidden relative group">
                      <CardContent className="p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {answerResult}
                      </CardContent>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(answerResult)}
                        data-testid="button-copy-answer"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Thoughts List */}
        <section className="space-y-6 pt-8 border-t border-border">
          <h2 className="font-serif text-3xl text-foreground" data-testid="heading-thoughts">Recent Thoughts</h2>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {thoughts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 px-4 rounded-xl border border-dashed border-border"
                  data-testid="empty-thoughts"
                >
                  <p className="text-muted-foreground">Your notebook is empty. Capture a thought to begin.</p>
                </motion.div>
              ) : (
                thoughts.map((thought) => (
                  <motion.div
                    key={thought.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="rounded-xl bg-card border-card-border shadow-sm group">
                      <CardContent className="p-5 flex gap-4">
                        <div className="flex-1 space-y-2">
                          <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base" data-testid={`text-thought-${thought.id}`}>{thought.text}</p>
                          <p className="text-xs text-muted-foreground font-medium" data-testid={`time-thought-${thought.id}`}>
                            {formatDistanceToNow(new Date(thought.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteThought(thought.id)}
                          className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
                          data-testid={`button-delete-thought-${thought.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
