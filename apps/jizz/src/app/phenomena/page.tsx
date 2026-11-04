'use client';

import { type PhenomenonRecord } from '@moonwitness/types';
import { JizzClientAdapter } from '@/lib/jizz/client';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, SectionHeading, StatePanel, MotionFrame, Input } from '@moonwitness/ui';
import { useEffect, useState } from 'react';

export default function PhenomenaCatalogue() {
  const [phenomena, setPhenomena] = useState<PhenomenonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const client = new JizzClientAdapter({
    base_url: process.env.NEXT_PUBLIC_JIZZ_API_URL ?? 'http://localhost:4000',
    api_key: process.env.NEXT_PUBLIC_JIZZ_API_KEY,
  });

  useEffect(() => {
    async function loadPhenomena() {
      try {
        setLoading(true);
        setError(null);
        const data = await client.listPhenomena(100, 0);
        setPhenomena(data);
      } catch (err) {
        setError('Failed to load observations. Check source connection.');
        console.error('Phenomena load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPhenomena();
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