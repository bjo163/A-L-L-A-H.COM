"use client";

import * as React from "react";
import { Button } from "../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Input } from "../components/input";
import { Textarea } from "../components/textarea";
import { Badge } from "../components/badge";
import { cn } from "../lib/utils";
import { MotionFrame } from "../primitives/visual-effects";
import { SkinRoot } from "../skins/root";
import { skinIds, skinRegistry, type SkinId } from "../skins/registry";

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
          <p className="mw-skin-lab__kicker">MOONFRAME / SIX WORLD LABORATORY</p>
          <h1 id="skin-lab-title">Canonical representative task parity</h1>
          <p>
            The same navigation, content, form, status, and empty-state task rendered across all six approved DNA worlds.
          </p>
        </div>
        <Badge variant="gold">Six worlds · one engine</Badge>
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
        <SkinRoot skin={activeSkin} className="mw-skin-lab__skin-root">
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
              <section id="lab-overview" className="mw-skin-lab__hero" aria-labelledby="lab-hero-title">
                <MotionFrame effect="enter">
                  <div className="mw-skin-lab__hero-copy">
                    <p className="mw-skin-lab__hero-kicker">ENTRY / COMPARISON TASK</p>
                    <h2 id="lab-hero-title">A task that reads the same across all worlds.</h2>
                    <p>
                      Navigation, cards, forms, status messages, empty states, dialogs, and focus behavior are
                      equivalent while composition, geometry, typography, material, and motion change by design.
                    </p>
                    <div className="mw-skin-lab__hero-actions">
                      <Button type="button" onClick={() => setDialogOpen(true)}>
                        Open representative dialog
                      </Button>
                      <Button type="button" variant="outline" onClick={handleReset}>
                        Reset states
                      </Button>
                    </div>
                  </div>
                </MotionFrame>
              </section>

              <section id="lab-content" className="mw-skin-lab__grid" aria-labelledby="lab-content-title">
                <div className="mw-skin-lab__section-header">
                  <div>
                    <p className="mw-skin-lab__kicker">CONTENT / CARDS</p>
                    <h3 id="lab-content-title">Content card and data section</h3>
                  </div>
                  <Badge variant="gold">Real action · keyboard accessible</Badge>
                </div>
                <div className="mw-skin-lab__cards">
                  <Card>
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
                  <Card>
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
                          <dd>Idle · submitted · empty · dialog</dd>
                        </div>
                        <div>
                          <dt>Targets</dt>
                          <dd>=44px · focus visible</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="lab-form" className="mw-skin-lab__form-section" aria-labelledby="lab-form-title">
                <div className="mw-skin-lab__section-header">
                  <div>
                    <p className="mw-skin-lab__kicker">FORM / VALIDATION</p>
                    <h3 id="lab-form-title">Form validation with real behavior</h3>
                  </div>
                </div>
                <Card>
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
                    {submitted && form.projectName.trim() && form.brief.trim() && (
                      <div className="mw-skin-lab__status" role="status">
                        <strong>Submitted.</strong> The task payload is captured in state with no fabricated metrics.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section id="lab-states" className="mw-skin-lab__states" aria-labelledby="lab-states-title">
                <div className="mw-skin-lab__section-header">
                  <div>
                    <p className="mw-skin-lab__kicker">STATES / LOADING · EMPTY · ERROR · SUCCESS</p>
                    <h3 id="lab-states-title">Truthful states</h3>
                  </div>
                </div>
                <div className="mw-skin-lab__state-grid">
                  <Card>
                    <CardHeader>
                      <CardTitle>Loading</CardTitle>
                      <CardDescription>Explicit loading region.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mw-skin-lab__state-row" role="status" aria-live="polite">
                        <span className="mw-skin-lab__pulse" aria-hidden="true" />
                        <span>Loading representative records…</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Empty</CardTitle>
                      <CardDescription>No fabricated data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mw-skin-lab__empty" role="status">
                        <span className="mw-skin-lab__empty-glyph" aria-hidden="true" />
                        <div>
                          <p className="mw-skin-lab__empty-state">No records</p>
                          <p>Nothing is shown until a real source returns records.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Error</CardTitle>
                      <CardDescription>Actionable error state.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mw-skin-lab__error" role="alert">
                        <strong>Request failed.</strong> Retry when the connection is available.
                        <div className="mw-skin-lab__inline-actions">
                          <Button type="button" variant="outline" size="sm">
                            Retry
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Success</CardTitle>
                      <CardDescription>Confirmation without metrics inflation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mw-skin-lab__success" role="status">
                        <strong>Saved.</strong> Changes are recorded for this representative task.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </main>
          </div>
        </SkinRoot>
      </div>

      {dialogOpen && (
        <div className="mw-skin-lab__dialog-backdrop" role="presentation">
          <div className="mw-skin-lab__dialog" role="dialog" aria-modal="true" aria-labelledby="lab-dialog-title">
            <header className="mw-skin-lab__dialog-header">
              <div>
                <p className="mw-skin-lab__kicker">OVERLAY / DIALOG</p>
                <h4 id="lab-dialog-title">Representative dialog</h4>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </header>
            <div className="mw-skin-lab__dialog-body">
              <p>
                Dialog composition changes by world while semantics, focus trap expectation, escape behavior, and
                keyboard accessibility remain equivalent.
              </p>
              <div className="mw-skin-lab__inline-actions">
                <Button type="button" onClick={() => setDialogOpen(false)}>
                  Confirm
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
