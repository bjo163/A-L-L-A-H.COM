'use client';

import { type SignalRecord, type PhenomenonRecord } from '@moonwitness/types';
import { JizzClientAdapter } from '@/lib/jizz/client';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, SectionHeading, StatePanel, MotionFrame, Table, TableBody, TableCell, TableHeader, TableRow, Input } from '@moonwitness/ui';
import { useEffect, useState } from 'react';

export default function SignalsTimeline() {
  const [signals, setSignals] = useState<SignalRecord[]>([]);
  const [phenomena, setPhenomena] = useState<PhenomenonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [signalType, setSignalType] = useState<string>('');

  const client = new JizzClientAdapter({
    base_url: process.env.NEXT_PUBLIC_JIZZ_API_URL ?? 'http://localhost:4000',
    api_key: process.env.NEXT_PUBLIC_JIZZ_API_KEY,
  });

  useEffect(() => {
    async function loadSignals() {
      try {
        setLoading(true);
        setError(null);
        // Note: In a real implementation, there would be a /api/signals endpoint
        // For now, we'll fetch all phenomena and their signals
        const phenData = await client.listPhenomena(100, 0);
        setPhenomena(phenData);

        // Collect all signals from all phenomena (simplified)
        const allSignals: SignalRecord[] = [];
        for (const phen of phenData) {
          const phenSignals = await client.listSignals(phen.id);
          allSignals.push(...phenSignals);
        }
        setSignals(allSignals.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()));
      } catch (err) {
        setError('Failed to load signals. Check source connection.');
        console.error('Signals load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSignals();
  }, []);

  const filteredSignals = signals.filter(s => {
    if (search && !s.id.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (signalType && s.signal_type !== signalType) {
      return false;
    }
    return true;
  });

  const signalTypes = [...new Set(signals.map(s => s.signal_type))];

  return (
    <>
      <MotionFrame effect="enter">
        <SectionHeading
          titleId="signals-heading"
          kicker="SIGNALS & ANOMALIES"
          title="Global signals timeline"
          trailing={<Badge variant="gold">Pattern detection</Badge>}
        />
        <div className="jizz-signals-controls">
          <Input placeholder="Search signals..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="jizz-signal-filters">
            {signalTypes.map(type => (
              <Badge
                key={type}
                variant={signalType === type ? 'active' : 'default'}
                onClick={() => setSignalType(signalType === type ? '' : type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </MotionFrame>

      {loading ? (
        <StatePanel kind="loading" cause="Loading signals timeline..." />
      ) : error ? (
        <StatePanel kind="error" cause={error} nextAction="Try refreshing the page." />
      ) : filteredSignals.length === 0 ? (
        <StatePanel kind="empty" cause="No signals detected yet." nextAction="Signals emerge from pattern analysis of observation data." />
      ) : (
        <section className="jizz-records" aria-labelledby="signals-heading">
          <div className="jizz-records__grid">
            {filteredSignals.map(signal => {
              const phenomenon = phenomena.find(p => p.id === signal.phenomenon_id);
              return (
                <Card key={signal.id} as="article" className="jizz-signal-card">
                  <CardHeader>
                    <CardTitle>{signal.signal_type} signal</CardTitle>
                    <CardDescription>
                      {phenomenon ? phenomenon.title : 'Unknown phenomenon'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="jizz-signal-meta">
                      <Badge variant="active">{signal.magnitude.toFixed(2)}</Badge>
                      <Badge variant="default">{new Date(signal.detected_at).toLocaleDateString()}</Badge>
                      <Badge variant={signal.provenance.verification_status === 'verified' ? 'active' : 'default'}>
                        {signal.provenance.verification_status}
                      </Badge>
                    </div>
                    <div className="jizz-signal-metadata">
                      <pre className="jizz-signal-metadata__pre">{JSON.stringify(signal.metadata, null, 2)}</pre>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}