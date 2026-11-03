'use client';

import { useState, useEffect } from 'react';
import { EcosystemNavbar, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';
// JIZZ API types (adapting from @moonwitness/types for read-only data)
interface Observation {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  coverage: 'high' | 'medium' | 'low';
}

interface Perspective {
  id: string;
  actor: string;
  framing: string;
  position: string;
  sources: number;
}

// Use these types instead of importing non-existent ones

export default function WorldObservatoryHome() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Initial data load (will be replaced with real API calls)
    setTimeout(() => {
      setObservations([
        { id: 'obs-001', title: 'Global Climate Report', source: 'NASA', publishedAt: '2024-11-01', coverage: 'high' },
        { id: 'obs-002', title: 'Tech Industry Layoffs', source: 'Reuters', publishedAt: '2024-10-28', coverage: 'medium' },
        { id: 'obs-003', title: 'UN Climate Summit', source: 'UN', publishedAt: '2024-11-02', coverage: 'high' },
      ]);
      setPerspectives([
        { id: 'pers-001', actor: 'US', framing: 'economic', position: 'supportive', sources: 12 },
        { id: 'pers-002', actor: 'EU', framing: 'environmental', position: 'concerned', sources: 8 },
        { id: 'pers-003', actor: 'China', framing: 'development', position: 'neutral', sources: 5 },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const handlePerspectiveClick = (perspectiveId: string) => {
    // Navigate to perspective comparison view
    console.log('Navigating to perspective:', perspectiveId);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500/20 selection:text-amber-200">
      <EcosystemNavbar
        currentApp="jizz"
        userName={user?.name}
        userEmail={user?.email}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center py-12 space-y-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <Badge variant="gold" dot>Powered by ROCKSOUL JIZZ</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
            WORLD OBSERVATORY
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg">
            Source-grounded global intelligence. How is the world seeing it?
          </p>
        </section>

        {/* Observations Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-100">Recent Observations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {observations.map((obs) => (
              <Card key={obs.id} className="hover:border-amber-500/30 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{obs.title}</CardTitle>
                  <CardDescription className="text-xs">{obs.source} • {obs.publishedAt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Coverage: {obs.coverage}</span>
                    <Button variant="outline" size="sm" onClick={() => console.log('View observation')}>View</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Perspectives Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-100">Perspectives by Actor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {perspectives.map((pers) => (
              <Card key={pers.id} className="hover:border-amber-500/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{pers.actor}</CardTitle>
                    <Badge variant="default">{pers.framing}</Badge>
                  </div>
                  <CardDescription>{pers.position}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-zinc-400">
                    <div className="flex justify-between mb-2">
                      <span>Sources: {pers.sources}</span>
                      <span className="text-emerald-400">✓ Verified</span>
                    </div>
                    <Button variant="default" size="sm" onClick={() => handlePerspectiveClick(pers.id)}>
                      Compare Perspectives
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}