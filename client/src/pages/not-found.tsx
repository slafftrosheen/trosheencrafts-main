import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 noise" />
      
      <Card className="w-full max-w-xl relative z-10 rounded-[3rem] border-2 border-border/40 bg-card/40 shadow-2xl overflow-hidden">
        <CardContent className="p-12 md:p-16 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20">
              <AlertCircle className="h-10 w-10" />
            </div>
          </div>
          
          <h1 className="text-5xl font-serif font-bold tracking-tight mb-4">Artefact <span className="text-primary italic">Not Found</span></h1>
          
          <p className="text-xl text-muted-foreground font-medium mb-12">
            The story you're looking for hasn't been written yet, or the piece has been moved to our archives.
          </p>

          <Link href="/">
            <Button size="lg" className="rounded-2xl h-16 px-10 font-bold text-lg shadow-xl shadow-primary/20">
              <ArrowLeft className="mr-3 h-5 w-5" /> Back to Workshop
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
