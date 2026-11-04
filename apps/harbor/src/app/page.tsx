'use client';

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, MotionFrame, PageHero, SectionHeading, StatePanel, WorldArtwork } from '@moonwitness/ui';

export default function HarborCustomerHome() {
  return (
    <>
      <MotionFrame effect="enter">
        <PageHero
          titleId="harbor-title"
          kicker="HARBOR / NEXUS PARADOX / CUSTOMER PORTAL"
          title="Your internet service, managed"
          summary="Manage your E-ISP plan, check coverage, view billing, track support tickets, and control your connection."
          actions={
            <>
              <Badge variant="active" dot>Service: Active</Badge>
              <Badge variant="default">Plan: Not provisioned</Badge>
            </>
          }
          media={<WorldArtwork skin="nexus-paradox" />}
          captionLeft="NEXUS PARADOX / SERVICE ATLAS"
          captionRight="00 / PORTAL"
        />
      </MotionFrame>

      <section className="harbor-console" aria-labelledby="harbor-heading">
        <SectionHeading
          titleId="harbor-heading"
          kicker="SERVICE OVERVIEW / 00"
          title="Your connection & billing"
          trailing={<Badge variant="gold">Customer-first</Badge>}
        />

        <div className="harbor-console__grid">
          <Card as="article">
            <CardHeader>
              <CardTitle>My Plan</CardTitle>
              <CardDescription>Current internet service plan</CardDescription>
            </CardHeader>
            <CardContent>
              <StatePanel
                as="h3"
                kind="empty"
                title="No plan provisioned"
                cause="You haven't activated an E-ISP plan yet."
                nextAction="Browse available plans and activate your service."
              />
            </CardContent>
          </Card>
          <Card as="article">
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Invoices and payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <StatePanel
                as="h3"
                kind="empty"
                title="No billing records"
                cause="Billing records appear when your plan is activated."
                nextAction="Activate a plan to see billing information."
              />
            </CardContent>
          </Card>
          <Card as="article">
            <CardHeader>
              <CardTitle>Support</CardTitle>
              <CardDescription>Ticket status and help center</CardDescription>
            </CardHeader>
            <CardContent>
              <StatePanel
                as="h3"
                kind="empty"
                title="No support tickets"
                cause="Your support tickets will appear here."
                nextAction="Create a ticket if you need assistance."
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}