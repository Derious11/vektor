"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronRight, Brain, ListCollapse, Wand2, Rows3, Zap } from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function LandingPage() {
  const blueprint = "hsl(227, 42%, 28%)";
  const blueprintSoft = "hsl(227, 32%, 20%)";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ----------------------------------------------------------- */}
      {/* NAVBAR */}
      {/* ----------------------------------------------------------- */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6" style={{ color: blueprint }} />
            <span className="text-xl font-bold tracking-tight">Vektor</span>
          </div>
          <ThemeToggle />

          <Button asChild className="button-elevated">
            <a href="/app">
              Create First Prompt
              <ChevronRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </header>

      <main className="flex-grow">

        {/* ----------------------------------------------------------- */}
        {/* HERO SECTION — Blueprint Grid */}
        {/* ----------------------------------------------------------- */}
        <section className="relative section-padding vektor-grid text-center">
          <div className="relative z-10 container mx-auto max-w-3xl px-4">

            <p className="vektor-eyebrow fade-up">Precision Leverage for AI Work</p>

            <h1 className="mt-4 text-5xl font-extrabold tracking-tight md:text-7xl fade-up delay-100">
              Stop Guessing.<br /> Start Directing.<br /><br /> Give Your AI Perfect Direction
            </h1>

            <div className="mt-4 mx-auto h-[3px] w-24 rounded-full fade-up delay-200"
                 style={{ backgroundColor: blueprint }} />

            <p className="mt-8 text-lg text-muted-foreground fade-up delay-200 sm:text-xl leading-relaxed">
              Vektor is the 4-step framework for entrepreneurs and leaders to get
              expert-level, actionable results from any AI.<br className="hidden sm:block" />
              No more generic answers.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4 fade-up delay-300">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground button-elevated"
                asChild
              >
                <a href="/app">
                  Create Your First Master Prompt
                  <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Button>

              <Button size="lg" variant="outline" className="button-elevated" asChild>
                <a href="#how-it-works">Learn More</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="vektor-divider my-24" />

        {/* ----------------------------------------------------------- */}
        {/* BEFORE / AFTER SECTION */}
        {/* ----------------------------------------------------------- */}
        <section className="container mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl fade-up">
              Tired of “Garbage In, Garbage Out?”
            </h2>
            <p className="mt-4 text-lg text-muted-foreground fade-up delay-100">
              A weak prompt gets you a weak answer.  
              A Vektor prompt becomes a reusable strategic asset.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* BEFORE */}
            <Card className="vektor-card fade-up delay-100 border-destructive/40 border-2">
              <CardHeader>
                <CardTitle className="text-destructive">Before Vektor</CardTitle>
                <CardDescription>
                  The “Hope and Pray” Prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="rounded bg-muted px-2 py-[3px] font-mono text-sm">
                  write a marketing plan
                </code>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  This gets you a generic, 10th-grade book report that’s unusable
                  for real business decisions.
                </p>
              </CardContent>
            </Card>

            {/* AFTER */}
            <Card className="vektor-card fade-up delay-200 border-2"
              style={{ borderColor: `${blueprint}85` }}>
              <CardHeader>
                <CardTitle style={{ color: blueprint }}>After Vektor</CardTitle>
                <CardDescription>
                  The “Master Prompt”
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="rounded bg-muted px-2 py-[3px] font-mono text-sm">
                  Act as an expert CMO… based on this context… create a detailed
                  GTM strategy… formatted as a memo…
                </code>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  This gets you a 90% complete, strategic document tailored to your
                  business, your goals, and your constraints.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ----------------------------------------------------------- */}
        {/* HOW IT WORKS */}
        {/* ----------------------------------------------------------- */}
        <section id="how-it-works" className="bg-muted section-padding">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl fade-up">
                A Framework for Genius-Level Output
              </h2>
              <p className="mt-4 text-lg text-muted-foreground fade-up delay-100">
                Our guided 4-step wizard ensures you build the perfect prompt every time.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

              {/* STEP 1 */}
              <div className="flex flex-col text-center sm:text-left fade-up">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg"
                     style={{ backgroundColor: blueprint }}>
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">1. Define the Role</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  Select the right expert persona (e.g., CMO, CTO, strategist) 
                  to prime the AI with domain-level competency.
                </p>
              </div>

              {/* STEP 2 */}
              <div className="flex flex-col text-center sm:text-left fade-up delay-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg"
                     style={{ backgroundColor: blueprintSoft }}>
                  <ListCollapse className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">2. Add Context</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  Provide the goals, constraints, and background the AI needs
                  for truly specific recommendations.
                </p>
              </div>

              {/* STEP 3 */}
              <div className="flex flex-col text-center sm:text-left fade-up delay-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg"
                     style={{ backgroundColor: blueprint }}>
                  <Wand2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">3. Give a Command</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  Move beyond “write me something.” Access precise professional 
                  commands for high-impact work.
                </p>
              </div>

              {/* STEP 4 */}
              <div className="flex flex-col text-center sm:text-left fade-up delay-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg"
                     style={{ backgroundColor: blueprintSoft }}>
                  <Rows3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">4. Select Format</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  Choose output styles like executive memos, slide decks, JSON schemas,
                  development tasks, and more.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- */}
        {/* TESTIMONIALS */}
        {/* ----------------------------------------------------------- */}
        <section className="section-padding">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl fade-up">
                The Difference Between an Intern and an Expert
              </h2>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">

              <Card className="vektor-card fade-up">
                <CardContent className="pt-6">
                  <p className="italic leading-relaxed">
                    “Vektor is my secret weapon. I went from spending 30 minutes rewriting 
                    prompts to getting a client-ready strategy in 30 seconds.”
                  </p>
                  <p className="mt-4 font-semibold">Sarah K., Founder & CEO</p>
                </CardContent>
              </Card>

              <Card className="vektor-card fade-up delay-100">
                <CardContent className="pt-6">
                  <p className="italic leading-relaxed">
                    “The Vektor framework lets me delegate complex technical analysis 
                    and architecture planning. I easily save 10+ hours weekly.”
                  </p>
                  <p className="mt-4 font-semibold">Mark T., CTO</p>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- */}
        {/* FINAL CTA */}
        {/* ----------------------------------------------------------- */}
        <section className="bg-primary text-primary-foreground section-padding text-center">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl fade-up">
              Build the Prompt That Builds Your Business.
            </h2>
            <p className="mt-6 text-lg fade-up delay-100 leading-relaxed">
              Stop wasting time. Start leveraging AI like an expert.
              Create your first master prompt now—free.
            </p>
            <div className="mt-10 fade-up delay-200">
              <Button size="lg" variant="secondary" className="button-elevated" asChild>
                <a href="/app">
                  Start Now — It&apos;s Free
                  <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ----------------------------------------------------------- */}
      {/* FOOTER */}
      {/* ----------------------------------------------------------- */}
      <footer className="border-t py-8">
        <div className="container mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Vektor. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
