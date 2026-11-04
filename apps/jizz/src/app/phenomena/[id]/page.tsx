'use client';

import { type PhenomenonRecord, type PerspectiveRecord, type SignalRecord } from '@moonwitness/types';
import { JizzClientAdapter } from '@/lib/jizz/client';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, SectionHeading, StatePanel, MotionFrame, Table, TableBody, TableCell, TableHeader, TableRow, Button, LinkButton } from '@moonwitness/ui';
import { useEffect, useState } from 'react';

interface Params {
  params: { id: string };
}

export default function PhenomenonPerspectives({ params }: Params) {
  const [phenomenon, setPhenomenon] = useState<PhenomenonRecord | null>(null);
  const [perspectives, setPerspectives] = useState<PerspectiveRecord[]>([]);
  const [signals, setSignals] = useState<SignalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const client = new JizzClientAdapter({
    base_url: process.env.NEXT_PUBLIC_JIZZ_API_URL ?? 'http://localhost:4000',
    api_key: process.env.NEXT_PUBLIC_JIZZ_API_KEY,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [phenom, persps, sigs] = await Promise.all([
          client.getPhenomenon(params.id),
          client.listPerspectives(params.id),
          client.listSignals(params.id),
        ]);

        setPhenomenon(phenom);
        setPerspectives(persps);
        setSignals(sigs);
      } catch (err) {
        setError('Failed to load phenomenon data. Check source connection.');
        console.error('Phenomenon detail load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id]);

  if (loading) {
    return <StatePanel kind="loading" cause="Loading phenomenon details..." />;
  }

  if (error) {
    return (
      <StatePanel kind="error" cause={error} nextAction="Return to phenomena catalogue." action={<LinkButton href="/phenomena">Back to catalogue</LinkButton>} />
    );
  }

  if (!phenomenon) {
    return (
      <StatePanel kind="error" cause="Phenomenon not found." nextAction="Return to phenomena catalogue." action={<LinkButton href="/phenomena">Back to catalogue</LinkButton>} />
    );
  }

  return (
    <>
      <MotionFrame effect="enter">
        <SectionHeading
          titleId="phenomenon-heading"
          kicker={`PHENOMENON / ${phenomenon.slug}`}
          title={phenomenon.title}
          trailing={
            <>
              <Badge variant="default">Observed: {new Date(phenomenon.observed_at).toLocaleDateString()}</Badge>
              <Badge variant={phenomenon.provenance.verification_status === 'verified' ? 'active' : 'default'}>
                {phenomenon.provenance.verification_status}
              </Badge>
            </>
          }
        />
      </MotionFrame>

      <section className="jizz-phenomenon-detail">
        <div className="jizz-phenomenon-header">
          <div className="jizz-phenomenon-header__meta">
            <Badge variant="default">
              {phenomenon.tags.map(t => `#${t}`).join(' ')}
            </Badge>
            <Badge variant="default">
              {phenomenon.geographic_scope ?? 'global'}
            </Badge>
          </div>
          <p className="jizz-phenomenon-summary">{phenomenon.summary}</p>
          {phenomenon.source_url && (
            <div className="jizz-phenomenon-source">
              <Badge variant="default">Source</Badge>
              <a href={phenomenon.source_url} target="_blank" rel="noopener noreferrer">
                {new URL(phenomenon.source_url).hostname}
              </a>
            </div>
          )}
        </div>

        <section className="jizz-perspectives-matrix">
          <SectionHeading titleId="perspectives-heading" title="Attached perspectives" />
          {perspectives.length === 0 ? (
            <StatePanel kind="empty" cause="No perspectives attached yet." nextAction="Perspectives are created when source analysis produces interpretations." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Actor</TableCell>
                  <TableCell>Framing</TableCell>
                  <TableCell>Stance</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell>Provenance</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perspectives.map(perspective => (
                  <TableRow key={perspective.id}>
                    <TableCell>
                      <strong>{perspective.actor_name}</strong>
                      <Badge variant="default">{perspective.actor_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{perspective.framing}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={perspective.stance === 'supporting' ? 'active' : perspective.stance === 'opposing' ? 'active' : 'default'}>
                        {perspective.stance}
                      </Badge>
                    </TableCell>
                    <TableCell>{(perspective.confidence * 100).toFixed(0)}%</TableCell>
                    <TableCell>{new Date(perspective.published_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={perspective.provenance.verification_status === 'verified' ? 'active' : 'default'}>
                        {perspective.provenance.verification_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        <section className="jizz-signals-timeline">
          <SectionHeading titleId="signals-heading" title="Detected signals" />
          {signals.length === 0 ? (
            <StatePanel kind="empty" cause="No signals detected yet." nextAction="Signals are generated from pattern analysis of source data." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Magnitude</TableCell>
                  <TableCell>Detected</TableCell>
                  <TableCell>Metadata</TableCell>
                  <TableCell>Provenance</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.map(signal => (
                  <TableRow key={signal.id}>
                    <TableCell>
                      <Badge variant="default">{signal.signal_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {signal.magnitude.toFixed(2)}
                    </TableCell>
                    <TableCell>{new Date(signal.detected_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {JSON.stringify(signal.metadata, null, 2).slice(0, 50)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant={signal.provenance.verification_status === 'verified' ? 'active' : 'default'}>
                        {signal.provenance.verification_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        <div className="jizz-phenomenon-actions">
          <LinkButton href="/phenomena" variant="outline">
            Back to catalogue
          </LinkButton>
        </div>
      </section>
    </>
  );
}