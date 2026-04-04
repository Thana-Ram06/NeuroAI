import React, { useState, useEffect, useRef } from "react";
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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [newThought, setNewThought] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<string | null>(null);

  const aboutRef = useRef<HTMLElement>(null);
  const { toast } = useToast();

  const summarizeMutation = useSummarizeThoughts();
  const askBrainMutation = useAskBrain();

  useEffect(() => {
    const unsubscribe = subscribeToThoughts((fetchedThoughts) => {
      setThoughts(fetchedThoughts);
    });
    return () => unsubscribe();
  }, []);

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddThought = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThought.trim()) return;

    setIsSubmitting(true);
    try {
      await createThought(newThought);
      setNewThought("");
      toast({ title: "Thought added", description: "Your thought has been safely stored." });
    } catch {
      toast({ title: "Error", description: "Failed to add thought.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteThought = async (id: string) => {
    try {
      await removeThought(id);
      toast({ title: "Thought deleted" });
    } catch {
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
        },
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
        },
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar onAboutClick={scrollToAbout} />

      <main className="flex-1 w-full px-4 md:px-8 py-16">
        <div className="max-w-3xl mx-auto space-y-16">

          {/* Hero Header */}
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h1
              className="font-serif text-5xl md:text-6xl text-foreground tracking-tight"
              data-testid="heading-title"
            >
              NeuroAI
            </h1>
            <p
              className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed"
              data-testid="heading-subtitle"
            >
              Your thoughts, organized by AI.
            </p>
          </motion.header>

          {/* Thought Input */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <form onSubmit={handleAddThought} className="space-y-4">
              <Textarea
                value={newThought}
                onChange={(e) => setNewThought(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-[130px] text-base resize-none rounded-xl bg-card border-card-border p-5 focus-visible:ring-primary shadow-sm transition-all duration-200 focus:shadow-md"
                data-testid="input-thought"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !newThought.trim()}
                  className="rounded-lg px-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  data-testid="button-submit-thought"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Add Thought
                </Button>
              </div>
            </form>
          </motion.section>

          {/* AI Features */}
          <AnimatePresence>
            {thoughts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="grid gap-6 md:grid-cols-2"
              >
                {/* Summarize */}
                <div className="space-y-4">
                  <Button
                    onClick={handleSummarize}
                    variant="outline"
                    className="w-full rounded-xl justify-start h-auto py-4 px-5 bg-card hover:bg-card/80 border-card-border shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:shadow-md"
                    disabled={summarizeMutation.isPending}
                    data-testid="button-summarize"
                  >
                    {summarizeMutation.isPending
                      ? <Loader2 className="w-5 h-5 mr-3 text-primary animate-spin" />
                      : <Sparkles className="w-5 h-5 mr-3 text-primary flex-shrink-0" />}
                    <div className="text-left">
                      <div className="font-medium text-foreground">Summarize my thoughts</div>
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">Extract key themes and ideas</div>
                    </div>
                  </Button>

                  <AnimatePresence>
                    {summaryResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Card className="rounded-xl bg-card border-card-border shadow-sm overflow-hidden relative group">
                          <CardContent className="p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                            {summaryResult}
                          </CardContent>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
                    <Brain className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
                    <Input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask your brain a question..."
                      className="pl-12 pr-24 py-6 rounded-xl bg-card border-card-border focus-visible:ring-primary shadow-sm transition-all duration-200 focus:shadow-md"
                      data-testid="input-ask-brain"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={askBrainMutation.isPending || !question.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      data-testid="button-submit-question"
                    >
                      {askBrainMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask"}
                    </Button>
                  </form>

                  <AnimatePresence>
                    {answerResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Card className="rounded-xl bg-card border-card-border shadow-sm overflow-hidden relative group">
                          <CardContent className="p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                            {answerResult}
                          </CardContent>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
              </motion.section>
            )}
          </AnimatePresence>

          {/* Thoughts List */}
          <section className="space-y-6 pt-8 border-t border-border">
            <h2 className="font-serif text-3xl text-foreground" data-testid="heading-thoughts">
              Recent Thoughts
            </h2>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {thoughts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-14 px-4 rounded-xl border border-dashed border-border"
                    data-testid="empty-thoughts"
                  >
                    <p className="text-muted-foreground">Your notebook is empty. Capture a thought to begin.</p>
                  </motion.div>
                ) : (
                  thoughts.map((thought) => (
                    <motion.div
                      key={thought.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="rounded-xl bg-card border-card-border shadow-sm group transition-shadow duration-200 hover:shadow-md">
                        <CardContent className="p-5 flex gap-4">
                          <div className="flex-1 space-y-2 min-w-0">
                            <p
                              className="text-foreground leading-relaxed whitespace-pre-wrap text-base"
                              data-testid={`text-thought-${thought.id}`}
                            >
                              {thought.text}
                            </p>
                            <p
                              className="text-xs text-muted-foreground"
                              data-testid={`time-thought-${thought.id}`}
                            >
                              {formatDistanceToNow(new Date(thought.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteThought(thought.id)}
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 flex-shrink-0"
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

          {/* About Section */}
          <motion.section
            ref={aboutRef}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="pt-8 border-t border-border space-y-8"
            id="about"
            data-testid="section-about"
          >
            <h2 className="font-serif text-3xl text-foreground">About NeuroAI</h2>

            <p className="text-muted-foreground leading-relaxed text-base max-w-2xl">
              NeuroAI is your personal AI-powered second brain — a quiet, focused space to capture your thoughts and let AI help you understand them.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Capture",
                  description: "Write down any thought, idea, or note. No formatting required — just your words.",
                },
                {
                  step: "02",
                  title: "Organize",
                  description: "Ask NeuroAI to summarize your thoughts and extract key themes automatically.",
                },
                {
                  step: "03",
                  title: "Query",
                  description: "Ask any question and get answers drawn exclusively from your own stored thoughts.",
                },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="rounded-xl bg-card border-card-border shadow-sm h-full transition-shadow duration-200 hover:shadow-md">
                    <CardContent className="p-6 space-y-3">
                      <span className="text-xs font-medium text-primary tracking-widest uppercase">{item.step}</span>
                      <h3 className="font-serif text-xl text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
