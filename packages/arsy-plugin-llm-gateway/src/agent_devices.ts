import { defineModel, fields, modelRegistry } from '@allah/arsy-orm';

export const AgentPairing = defineModel({
  name: 'agent.pairing',
  tableName: 'agent_pairing',
  displayName: 'VS Code Agent Pairing',
  fields: {
    code_hash: fields.char({ label: 'Pairing Code Hash', required: true, unique: true }),
    user_id: fields.many2one('auth.user', { label: 'Created By', required: true }),
    expires_at: fields.datetime({ label: 'Expires At', required: true }),
    state: fields.selection(
      { pending: 'Pending', claimed: 'Claimed' },
      { label: 'State', required: true, default: 'pending' }
    ),
  },
  indexes: [{ fields: ['code_hash'], unique: true }],
});

export const AgentDevice = defineModel({
  name: 'agent.device',
  tableName: 'agent_device',
  displayName: 'Paired VS Code Device',
  fields: {
    name: fields.char({ label: 'Device Name', required: true }),
    platform: fields.selection({ windows: 'Windows' }, { label: 'Platform', required: true }),
    credential_hash: fields.char({ label: 'Credential Hash', required: true, unique: true }),
    pairing_id: fields.many2one('agent.pairing', { label: 'Pairing', required: true, unique: true }),
    paired_by: fields.many2one('auth.user', { label: 'Paired By', required: true }),
    state: fields.selection(
      { active: 'Active', revoked: 'Revoked' },
      { label: 'State', required: true, default: 'active' }
    ),
    last_seen_at: fields.datetime({ label: 'Last Seen At' }),
  },
  indexes: [
    { fields: ['credential_hash'], unique: true },
    { fields: ['pairing_id'], unique: true },
  ],
});

export const AgentMission = defineModel({
  name: 'agent.mission',
  tableName: 'agent_mission',
  displayName: 'VS Code Agent Mission',
  fields: {
    device_id: fields.many2one('agent.device', { label: 'Device', required: true }),
    submitted_by: fields.many2one('auth.user', { label: 'Submitted By', required: true }),
    mode: fields.selection(
      {
        ask: 'Ask',
        plan: 'Plan',
        code: 'Code',
        debug: 'Debug',
        ideate: 'Ideate',
        autopilot: 'Autopilot',
      },
      { label: 'Mode', required: true }
    ),
    goal: fields.text({ label: 'Mission Goal', required: true }),
    state: fields.selection(
      {
        queued: 'Queued',
        running: 'Running',
        awaiting_approval: 'Awaiting Approval',
        cancel_requested: 'Cancel Requested',
        cancelled: 'Cancelled',
        completed: 'Completed',
        failed: 'Failed',
        blocked: 'Blocked',
      },
      { label: 'State', required: true, default: 'queued' }
    ),
    result: fields.json({ label: 'Result' }),
  },
  indexes: [
    { fields: ['device_id', 'state'] },
    { fields: ['submitted_by'] },
  ],
});

export const AgentMissionEvent = defineModel({
  name: 'agent.mission.event',
  tableName: 'agent_mission_event',
  displayName: 'VS Code Agent Mission Event',
  fields: {
    mission_id: fields.many2one('agent.mission', { label: 'Mission', required: true }),
    event_type: fields.char({ label: 'Event Type', required: true }),
    payload: fields.json({ label: 'Event Payload' }),
  },
  indexes: [{ fields: ['mission_id'] }],
});

export function registerAgentDeviceModels(): void {
  modelRegistry.register(AgentPairing);
  modelRegistry.register(AgentDevice);
  modelRegistry.register(AgentMission);
  modelRegistry.register(AgentMissionEvent);
}
