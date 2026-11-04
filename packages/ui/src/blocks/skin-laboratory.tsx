"use client";

import * as React from "react";
import { Button } from "../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Input } from "../components/input";
import { Textarea } from "../components/textarea";
import { Badge } from "../components/badge";
import { Dialog } from "../components/dialog";
import { cn } from "../lib/utils";
import { MotionFrame } from "../primitives/visual-effects";
import { skinIds, skinRegistry, type SkinId } from "../skins/registry";
import { SkinScope, WorldArtwork } from "./world-artwork";
import { Kicker } from "./kicker";
import { PageHero } from "./page-hero";
import { SectionHeading } from "./section-heading";
import { StatePanel } from "./state-panel";
import { StatusMessage } from "./status-message";
import { DestinationCard, DestinationGrid } from "./destination-card";

export interface SkinLaboratoryProps {
  className?: string;
}

interface RepresentativeTaskForm {
  projectName: string;
  brief: string;
}

export function SkinLaboratory({ className }: SkinLaboratoryProps) {
  const [activeSkin, setActiveSkin] = React.useState<SkinId>("imperium-lumen");
  const [form, setForm] = React.useState<RepresentativeTaskForm>({
    projectName: "",
    brief: "",
  });
  const [submitted, setSubmitted] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm({ projectName: "", brief: "" });
    setSubmitted(false);
    setDialogOpen(false);
  };

  return (
    <section className={cn("mw-skin-lab", className)} aria-labelledby="skin-lab-title">
      <header className="mw-skin-lab__header">
        <div>
          <Kicker>MOONFRAME / SIX WORLD LABORATORY</Kicker>
          <h1 id="skin-lab-title">Canonical representative task parity</h1>
          <p>
            The same navigation, content, form, status, and empty-state task rendered across all six approved DNA worlds,
            built from the composition blocks the applications use.
          </p>
        </div>
        <Badge variant="gold">Six worlds • one engine</Badge>
      </header>

      <nav className="mw-skin-lab__nav" aria-label="Select DNA world">
        {skinIds.map((skinId) => {
          const skin = skinRegistry[skinId];
          const isActive = skinId === activeSkin;

          return (
            <button
              key={skinId}
              type="button"
              className={cn("mw-skin-lab__nav-item", isActive && "mw-skin-lab__nav-item--active")}
              aria-pressed={isActive}
              onClick={() => {
                setActiveSkin(skinId);
                setSubmitted(false);
                setDialogOpen(false);
              }}
            >
              <span className="mw-skin-lab__nav-name">{skin.name}</span>
              <span className="mw-skin-lab__nav-signature">{skin.signature}</span>
            </button>
          );
        })}
      </nav>

      <div className="mw-skin-lab__comparison">
        <SkinScope skin={activeSkin} className="mw-skin-lab__skin-root">
          <div className="mw-skin-lab__app-shell">
            <header className="mw-skin-lab__app-header">
              <div className="mw-skin-lab__app-brand">
                <span className="mw-skin-lab__app-mark">MW</span>
                <div>
                  <p className="mw-skin-lab__app-name">{skinRegistry[activeSkin].name}</p>
                  <p className="mw-skin-lab__app-sub">REPRESENTATIVE TASK</p>
                </div>
              </div>
              <nav className="mw-skin-lab__app-nav" aria-label="Representative navigation">
                <a href="#lab-overview">Overview</a>
                <a href="#lab-content">Content</a>
                <a href="#lab-form">Form</a>
                <a href="#lab-states">States</a>
              </nav>
            </header>

            <main className="mw-skin-lab__main">
              <section id="lab-overview" aria-labelledby="lab-hero-title">
                <MotionFrame effect="enter">
                  <PageHero
                    as="h2"
                    titleId="lab-hero-title"
                    kicker="ENTRY / COMPARISON TASK"
                    title="A task that reads the same across all worlds."
                    summary="Navigation, cards, forms, status messages, states, dialogs, and focus behavior are equivalent while composition, geometry, typography, material, and motion change by design."
                    media={<WorldArtwork skin={activeSkin} />}
                    mediaLayout="side"
                    actions={
                      <>
                        <Button type="button" onClick={() => setDialogOpen(true)}>
                          Open representative dialog
                        </Button>
                        <Button type="button" variant="outline" onClick={handleReset}>
                          Reset states
                        </Button>
                      </>
                    }
                    captionLeft={skinRegistry[activeSkin].name}
                    captionRight="01 / PARITY"
                  />
                </MotionFrame>
              </section>

              <section className="mw-skin-lab__grid" id="lab-content" aria-labelledby="lab-content-title">
                <SectionHeading
                  as="h3"
                  titleId="lab-content-title"
                  kicker="CONTENT / CARDS"
                  title="Content card and data section"
                  trailing={<Badge variant="gold">Real action • keyboard accessible</Badge>}
                />

                <DestinationGrid label="Representative destinations">
                  <DestinationCard
                    index="01"
                    role="open"
                    title="This page"
                    description="A destination card that links, with the skin deciding radius, edge, and travel."
                    href="#lab-content"
                  />
                  <DestinationCard
                    index="02"
                    role="reserved"
                    title="A route that does not exist yet"
                    description="The same card without a link, so the map never promises a destination it cannot reach."
                    status={<Badge variant="revoked">Not open</Badge>}
                  />
                </DestinationGrid>

                <div className="mw-skin-lab__cards">
                  <Card as="article">
                    <CardHeader>
                      <CardTitle>Primary card</CardTitle>
                      <CardDescription>Shared semantic card recipe with skin-specific composition.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Hierarchy, spacing, and radius follow the active world without changing role or structure.</p>
                      <div className="mw-skin-lab__inline-actions">
                        <Button type="button" size="sm">
                          Continue
                        </Button>
                        <Button type="button" variant="ghost" size="sm">
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card as="article">
                    <CardHeader>
                      <CardTitle>Data section</CardTitle>
                      <CardDescription>Truthful state reporting.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <dl className="mw-skin-lab__dl">
                        <div>
                          <dt>Route</dt>
                          <dd>Representative task</dd>
                        </div>
                        <div>
                          <dt>States</dt>
                          <dd>Idle • submitted • empty • dialog</dd>
                        </div>
                        <div>
                          <dt>Targets</dt>
                          <dd>=44px • focus visible</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="mw-skin-lab__form-section" id="lab-form" aria-labelledby="lab-form-title">
                <SectionHeading
                  as="h3"
                  titleId="lab-form-title"
                  kicker="FORM / VALIDATION"
                  title="Form validation with real behavior"
                />
                <Card as="article">
                  <CardHeader>
                    <CardTitle>Project brief</CardTitle>
                    <CardDescription>Required fields with accessible errors.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="mw-skin-lab__form" onSubmit={handleSubmit} noValidate>
                      <Input
                        label="Project name"
                        required
                        value={form.projectName}
                        onChange={(event) => setForm((current) => ({ ...current, projectName: event.target.value }))}
                        error={submitted && !form.projectName.trim() ? "Project name is required." : undefined}
                      />
                      <Textarea
                        label="Brief"
                        required
                        value={form.brief}
                        onChange={(event) => setForm((current) => ({ ...current, brief: event.target.value }))}
                        error={submitted && !form.brief.trim() ? "Add a brief for the task." : undefined}
                      />
                      <div className="mw-skin-lab__form-actions">
                        <Button type="submit">Submit task</Button>
                      </div>
                    </form>
                    {submitted && (
                      <StatusMessage tone={form.projectName.trim() && form.brief.trim() ? "success" : "danger"} title="Submit result">
                        {form.projectName.trim() && form.brief.trim()
                          ? "The task payload is captured in component state. No metric is invented."
                          : "Both fields are required before the task can be captured."}
                      </StatusMessage>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section className="mw-skin-lab__states" id="lab-states" aria-labelledby="lab-states-title">
                <SectionHeading
                  as="h3"
                  titleId="lab-states-title"
                  kicker="STATES / LOADING • EMPTY • ERROR • SUCCESS"
                  title="Truthful states"
                />
                <div className="mw-skin-lab__state-grid">
                  <StatePanel kind="loading" cause="Representative records are being read." />
                  <StatePanel
                    kind="empty"
                    title="No records"
                    cause="Nothing is shown until a real source returns records."
                    nextAction="Connect a source, then reload this view."
                  />
                  <StatePanel
                    kind="error"
                    title="Request failed"
                    cause="The representative source did not answer."
                    nextAction="Retry when the connection is available."
                    action={<Button type="button" variant="outline" size="sm">Retry</Button>}
                  />
                  <StatePanel
                    kind="permission"
                    title="Not authorised"
                    cause="This account has no grant for the representative resource."
                    nextAction="Ask an authorisation owner, then reload."
                  />
                </div>
              </section>
            </main>
          </div>
        </SkinScope>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Representative dialog"
        description="OVERLAY / DIALOG"
        className="mw-skin-lab__dialog"
        footer={
          <div className="mw-skin-lab__inline-actions">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            <Button type="button" onClick={() => setDialogOpen(false)}>
              Confirm
            </Button>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <p>
          Dialog composition changes by world while semantics, focus, Escape behavior, and keyboard accessibility remain equivalent.
        </p>
      </Dialog>
    </section>
  );
}
