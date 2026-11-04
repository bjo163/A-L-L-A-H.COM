'use client';

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, MotionFrame, PageHero, SectionHeading, StatePanel, WorldArtwork } from '@moonwitness/ui';

export default function MoonskyConsoleHome() {
  return (
    <>
      <MotionFrame effect="enter">
        <PageHero
          titleId="console-title"
          kicker="MOONSKY / RIOT ANARCHY / COMMAND CENTER"
          title="Communication operator console"
          summary="Secure messaging channel management, provider connections, and delivery monitoring. Every operation is audited and traced."
          actions={
            <>
              <Badge variant="active" dot>Status: Online</Badge>
              <Badge variant="default">Channels: 0 connected</Badge>
            </>
          }
          media={<WorldArtwork skin="riot-anarchy" />}
          captionLeft="RIOT ANARCHY / CHANNEL ATLAS"
          captionRight="00 / STANDBY"
        />
      </MotionFrame>

      <section className="moonsky-console" aria-labelledby="console-heading">
        <SectionHeading
          titleId="console-heading"
          kicker="SYSTEM OVERVIEW / 00"
          title="Channel status & metrics"
          trailing={<Badge variant="gold">Provenance-first</Badge>}
        />

        <div className="moonsky-console__grid">
          <Card as="article">
            <CardHeader>
              <CardTitle>Channels</CardTitle>
              <CardDescription>Connected messaging providers</CardDescription>
            </CardHeader>
            <CardContent>
              <StatePanel
                as="h3"
                kind="empty"
                title="No channels connected yet"
                cause="Channel adapters need to be configured in the console."
                nextAction="Add WhatsApp or Telegram provider accounts to begin."
              />
            </CardContent>
          </Card>
          <Card as="article">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Active messaging threads</CardDescription>
            </CardHeader>
            <CardContent>
              <StatePanel
                as="h3"
                kind="empty"
                title="No conversations yet"
                cause="Conversations appear when channels are connected and messages are exchanged."
                nextAction="Connect a provider and start messaging."
              />
            </CardContent>
          </Card>
          <Card as="article">
            <CardHeader>
              <CardTitle>Delivery</CardTitle>
              <CardDescription>Message delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <StatePanel
                as="h3"
                kind="empty"
                title="No delivery data yet"
                cause="Delivery metrics populate when messages are sent through connected channels."
                nextAction="Send a message through a connected channel."
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}