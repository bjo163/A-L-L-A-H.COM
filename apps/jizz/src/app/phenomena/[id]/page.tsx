'use client';

import type { PhenomenonRecord, PerspectiveRecord, SignalRecord } from '@moonwitness/types';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, SectionHeading, StatePanel, MotionFrame, Table, TableBody, TableCell, TableHeader, TableRow, Link, LinkButton } from '@moonwitness/ui';
import { useEffect, useState } from 'react';

interface Params {
  params: { id: string };
}

interface ErrorBody {
  error?: string;
}

export default function PhenomenonPerspectives({ params }: Params) {
  const [phenomenon, setPhenomenon] = useState<PhenomenonRecord | null>(null);
  const [perspectives, setPerspectives] = useState<PerspectiveRecord[]>([]);
  const [signals, setSignals] = useState<SignalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params.id;

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [phenomRes, perspsRes, sigsRes] = await Promise.all([
          fetch(`/api/jizz/phenomena/${id}`),
          fetch(`/api/jizz/phenomena/${id}/perspectives`),
          fetch(`/api/jizz/phenomena/${id}/signals`),
        ]);

        if (cancelled) return;

        const phenomBody = (await phenomRes.json().catch(() => ({}))) as PhenomenonRecord | ErrorBody;
        const perspsBody = (await perspsRes.json().catch(() => ({}))) as PerspectiveRecord[] | ErrorBody;
        const sigsBody = (await sigsRes.json().catch(() => ({}))) as SignalRecord[] | ErrorBody;

        if (!phenomRes.ok) {
          setError((phenomBody as ErrorBody).error ?? 'Failed to load phenomenon data.');
          return;
        }

        if (!cancelled) {
          setPhenomenon(phenomBody as PhenomenonRecord);
          setPerspectives(Array.isArray(perspsBody) ? perspsBody : []);
          setSignals(Array.isArray(sigsBody) ? sigsBody : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load phenomenon data. Check source connection.');
          console.error('Phenomenon detail load error:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [id]);

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
              <Link href={phenomenon.source_url} external>
                {new URL(phenomenon.source_url).hostname}
              </Link>
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