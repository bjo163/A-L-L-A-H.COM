'use client';

import type { PhenomenonRecord } from '@moonwitness/types';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, SectionHeading, StatePanel, MotionFrame, Input } from '@moonwitness/ui';
import { useEffect, useState } from 'react';

interface ListResponse {
  data?: PhenomenonRecord[];
  error?: string;
}

export default function PhenomenaCatalogue() {
  const [phenomena, setPhenomena] = useState<PhenomenonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPhenomena() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/jizz/phenomena?limit=100&offset=0');
        if (cancelled) return;
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as ListResponse;
          setError(body.error ?? 'Failed to load observations.');
          return;
        }
        const data = (await res.json()) as PhenomenonRecord[];
        if (!cancelled) setPhenomena(data);
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load observations. Check source connection.');
          console.error('Phenomena load error:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPhenomena();
    return () => { cancelled = true; };
  }, []);

  const filteredPhenomena = phenomena.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.summary.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (tags.length && !tags.some(t => p.tags.includes(t))) {
      return false;
    }
    return true;
  });

  const allTags = [...new Set(phenomena.flatMap(p => p.tags))];

  return (
    <>
      <MotionFrame effect="enter">
        <SectionHeading
          titleId="phenomena-heading"
          kicker="OBSERVATION INDEX"
          title="Phenomena catalogue"
          trailing={<Badge variant="gold">Provenance-first</Badge>}
        />
        <div className="jizz-search-bar">
          <Input placeholder="Search observations..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="jizz-tag-filters">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={tags.includes(tag) ? 'active' : 'default'}
              onClick={() => {
                setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
              }}
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </MotionFrame>

      {loading ? (
        <StatePanel kind="loading" cause="Loading observation catalogue..." />
      ) : error ? (
        <StatePanel kind="error" cause={error} nextAction="Try refreshing the page." />
      ) : filteredPhenomena.length === 0 ? (
        <StatePanel kind="empty" cause="No observations match your filters." nextAction="Clear filters or check source connection." />
      ) : (
        <section className="jizz-records" aria-labelledby="phenomena-heading">
          <div className="jizz-records__grid">
            {filteredPhenomena.map(phenomenon => (
              <Card key={phenomenon.id} as="article" className="jizz-phenomenon-card">
                <CardHeader>
                  <CardTitle>{phenomenon.title}</CardTitle>
                  <CardDescription>{phenomenon.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="jizz-phenomenon-meta">
                    <Badge variant={phenomenon.provenance.verification_status === 'verified' ? 'active' : 'default'}>
                      {phenomenon.provenance.verification_status}
                    </Badge>
                    <Badge variant="default">
                      {phenomenon.tags.map(t => `#${t}`).join(' ')}
                    </Badge>
                    <Badge variant="default">
                      {new Date(phenomenon.observed_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </>
  );
}