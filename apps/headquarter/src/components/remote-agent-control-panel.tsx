'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AgentMode, AgentSessionEvent, PairedAgentDevice, RemoteAgentMission } from '@moonwitness/types';
import { mwClient } from '@allah/sdk';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, Input, StatePanel, StatusMessage, Textarea } from '@moonwitness/ui';

const modes: AgentMode[] = ['ask', 'plan', 'code', 'debug', 'ideate', 'autopilot'];
const cancellableStates = new Set(['queued', 'running', 'awaiting_approval']);

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : 'The remote agent request failed.';
}

function formatTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Time unavailable' : date.toLocaleString();
}

export function RemoteAgentControlPanel() {
  const [devices, setDevices] = useState<PairedAgentDevice[]>([]);
  const [missions, setMissions] = useState<RemoteAgentMission[]>([]);
  const [events, setEvents] = useState<AgentSessionEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [goal, setGoal] = useState('');
  const [mode, setMode] = useState<AgentMode>('code');
  const [pairingCode, setPairingCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<PairedAgentDevice | null>(null);

  const refresh = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [nextDevices, nextMissions] = await Promise.all([
        mwClient.agentControl.listDevices(),
        mwClient.agentControl.listMissions(),
      ]);
      setDevices(nextDevices);
      setMissions(nextMissions);
      setSelectedDeviceId((current) => (
        nextDevices.some((device: any) => device.id === current)
          ? current
          : nextDevices.find((device: any) => device.status !== 'revoked')?.id ?? ''
      ));
      setError(null);
    } catch (requestError) {
      setError(describeError(requestError));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(true);
    const timer = setInterval(() => void refresh(), 5_000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!selectedMissionId) {
      setEvents([]);
      setEventsLoading(false);
      return;
    }

    let active = true;
    setEventsLoading(true);
    const loadEvents = async () => {
      try {
        const nextEvents = await mwClient.agentControl.getMissionEvents(selectedMissionId);
        if (active) {
          setEvents(nextEvents);
          setEventsLoading(false);
        }
      } catch (requestError) {
        if (active) {
          setError(describeError(requestError));
          setEventsLoading(false);
        }
      }
    };

    void loadEvents();
    const timer = setInterval(() => void loadEvents(), 3_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [selectedMissionId]);

  const createPairing = async () => {
    const name = deviceName.trim();
    if (!name) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const pairing = await mwClient.agentControl.createPairing(name);
      setPairingCode({ code: pairing.code, expiresAt: pairing.expiresAt });
      setNotice('Pairing code created. Enter it in the A-L-L-A-H.COM VS Code extension before it expires.');
    } catch (requestError) {
      setError(describeError(requestError));
    } finally {
      setBusy(false);
    }
  };

  const requestRevoke = (device: PairedAgentDevice) => {
    setError(null);
    setNotice(null);
    setRevokeTarget(device);
  };

  const confirmRevoke = async () => {
    const device = revokeTarget;
    if (!device) return;
    setRevokeTarget(null);
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await mwClient.agentControl.revokeDevice(device.id);
      setNotice(`${device.name} was revoked.`);
      await refresh();
    } catch (requestError) {
      setError(describeError(requestError));
    } finally {
      setBusy(false);
    }
  };

  const submitMission = async () => {
    if (!selectedDeviceId || !goal.trim()) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const mission = await mwClient.agentControl.submitMission({
        deviceId: selectedDeviceId,
        mode,
        goal: goal.trim(),
      });
      setGoal('');
      setSelectedMissionId(mission.id);
      setNotice('Mission queued. The paired extension will request it over its outbound connection.');
      await refresh();
    } catch (requestError) {
      setError(describeError(requestError));
    } finally {
      setBusy(false);
    }
  };

  const cancelMission = async (mission: RemoteAgentMission) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await mwClient.agentControl.cancelMission(mission.id);
      setNotice('Cancellation requested. The extension confirms the final state.');
      await refresh();
    } catch (requestError) {
      setError(describeError(requestError));
    } finally {
      setBusy(false);
    }
  };

  const selectedDevice = devices.find((device) => device.id === selectedDeviceId);
  const selectedMission = missions.find((mission) => mission.id === selectedMissionId);

  return (
    <section className="remote-agent-control" aria-labelledby="remote-agent-heading">
      <header className="remote-agent-control__heading">
        <div>
          <h2 id="remote-agent-heading">Windows device operations</h2>
          <p>Pair an extension, send a workspace mission, and follow its reported state.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void refresh(true)} disabled={loading || busy}>
          {loading ? 'Loading devices…' : 'Refresh'}
        </Button>
      </header>

      {error && (
        <StatusMessage
          tone="danger"
          title="Device operation failed"
          action={
            <Button type="button" variant="outline" onClick={() => void refresh(true)} disabled={loading || busy}>
              Retry
            </Button>
          }
        >
          {error}
        </StatusMessage>
      )}
      {notice && <StatusMessage tone="success">{notice}</StatusMessage>}

      <div className="remote-agent-control__grid">
        <Card>
          <CardHeader>
            <CardTitle>Pair a Windows extension</CardTitle>
            <CardDescription>The code is single-use and expires shortly. The extension keeps local permission control.</CardDescription>
          </CardHeader>
          <CardContent className="remote-agent-control__stack">
            <Input
              label="Device name"
              autoComplete="off"
              value={deviceName}
              onChange={(event) => setDeviceName(event.target.value)}
              placeholder="Name this Windows workstation"
              disabled={busy}
            />
            <Button type="button" onClick={() => void createPairing()} disabled={busy || !deviceName.trim()}>
              Create pairing code
            </Button>
            {pairingCode && (
              <div className="remote-agent-control__pairing" role="status">
                <span>Enter this code in the VS Code extension</span>
                <code>{pairingCode.code}</code>
                <time dateTime={pairingCode.expiresAt}>Expires {formatTime(pairingCode.expiresAt)}</time>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paired devices</CardTitle>
            <CardDescription>Choose an active device to receive a mission. Revoked devices cannot be selected.</CardDescription>
          </CardHeader>
          <CardContent className="remote-agent-control__stack">
            {loading ? (
              <StatePanel as="h3" kind="loading" title="Loading devices" cause="Reading paired Windows extensions from the hub." />
            ) : devices.length === 0 ? (
              <StatePanel
                as="h3"
                kind="empty"
                title="No paired devices"
                cause="No Windows extension is paired with this account."
                nextAction="Create a pairing code, then enter it in the extension before it expires."
              />
            ) : (
              <ul className="remote-agent-control__device-list">
                {devices.map((device) => (
                  <li key={device.id}>
                    <div className="remote-agent-control__device">
                      <Button
                        type="button"
                        variant={selectedDeviceId === device.id ? 'gold' : 'outline'}
                        className="remote-agent-control__select"
                        aria-pressed={selectedDeviceId === device.id}
                        disabled={device.status === 'revoked'}
                        onClick={() => setSelectedDeviceId(device.id)}
                      >
                        <span>{device.name}</span>
                        <span>{device.status}{device.lastSeenAt ? ` · seen ${formatTime(device.lastSeenAt)}` : ''}</span>
                      </Button>
                      {device.status !== 'revoked' && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => requestRevoke(device)}
                          disabled={busy}
                          aria-label={`Revoke ${device.name}`}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="remote-agent-control__mission-form">
        <CardHeader>
          <CardTitle>Send a local mission</CardTitle>
          <CardDescription>
            {selectedDevice
              ? `Target: ${selectedDevice.name}. The extension will ask for workspace context consent locally.`
              : 'Pair and select a device before sending a mission.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="remote-agent-control__stack">
          <fieldset className="remote-agent-control__modes">
            <legend>Agent mode</legend>
            {modes.map((agentMode) => (
              <Button
                key={agentMode}
                type="button"
                variant={mode === agentMode ? 'gold' : 'outline'}
                aria-pressed={mode === agentMode}
                onClick={() => setMode(agentMode)}
                disabled={busy}
              >
                {agentMode}
              </Button>
            ))}
          </fieldset>
          <Textarea
            label="Mission goal"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="Describe the workspace task. Do not include secrets."
            rows={4}
            maxLength={4_000}
            disabled={busy}
          />
          <Button
            type="button"
            onClick={() => void submitMission()}
            disabled={busy || !selectedDevice || selectedDevice.status === 'revoked' || !goal.trim()}
          >
            Send mission to extension
          </Button>
        </CardContent>
      </Card>

      <div className="remote-agent-control__grid remote-agent-control__grid--history">
        <Card>
          <CardHeader>
            <CardTitle>Remote missions</CardTitle>
            <CardDescription>Mission state is reported by the paired extension, not inferred by Headquarter.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <StatePanel as="h3" kind="loading" title="Loading missions" cause="Reading mission state from the hub." />
            ) : missions.length === 0 ? (
              <StatePanel
                as="h3"
                kind="empty"
                title="No remote missions"
                cause="This account has not sent a workspace mission yet."
                nextAction="Select a paired device and send a goal to begin."
              />
            ) : (
              <ul className="remote-agent-control__mission-list">
                {missions.map((mission) => {
                  const target = devices.find((device) => device.id === mission.deviceId);
                  return (
                    <li key={mission.id}>
                      <Button
                        type="button"
                        variant={selectedMissionId === mission.id ? 'gold' : 'outline'}
                        className="remote-agent-control__mission"
                        aria-pressed={selectedMissionId === mission.id}
                        onClick={() => setSelectedMissionId(mission.id)}
                      >
                        <span>{mission.mode} · {mission.state}</span>
                        <span>{target?.name ?? 'Unknown device'} · {formatTime(mission.updatedAt)}</span>
                        <span>{mission.goal}</span>
                      </Button>
                      {cancellableStates.has(mission.state) && (
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={busy}
                          onClick={() => void cancelMission(mission)}
                          aria-label={`Request cancellation for ${mission.mode} mission`}
                        >
                          Stop
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session events</CardTitle>
            <CardDescription>
              {selectedMission ? `Events for ${selectedMission.mode} mission ${selectedMission.id}.` : 'Select a mission to inspect its event history.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedMission ? (
              <StatePanel
                as="h3"
                kind="empty"
                title="No mission selected"
                cause="Event history is scoped to one mission at a time."
                nextAction="Choose a mission from the history list to inspect its events."
              />
            ) : eventsLoading ? (
              <StatePanel as="h3" kind="loading" title="Loading events" cause="Reading the event history for this mission." />
            ) : events.length === 0 ? (
              <StatePanel
                as="h3"
                kind="offline"
                title="No events reported"
                cause="The paired extension has not sent an event for this mission."
                nextAction="Check that the extension is online and waiting for local approval."
              />
            ) : (
              <ol className="remote-agent-control__events" aria-live="polite">
                {events.map((event) => (
                  <li key={event.id}>
                    <Badge variant="active">{event.type.replace(/_/g, ' ')}</Badge>
                    <time dateTime={event.createdAt}>{formatTime(event.createdAt)}</time>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={revokeTarget !== null}
        onOpenChange={(next) => {
          if (!next) setRevokeTarget(null);
        }}
        title={`Revoke access for ${revokeTarget?.name ?? 'this device'}?`}
        description="The extension stops receiving missions on this pairing. Create a new pairing code to reconnect it."
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setRevokeTarget(null)}>
              Keep access
            </Button>
            <Button type="button" variant="destructive" onClick={() => void confirmRevoke()} disabled={busy}>
              Revoke access
            </Button>
          </>
        }
      />
    </section>
  );
}