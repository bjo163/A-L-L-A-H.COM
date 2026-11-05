export interface ScheduledMission {
  id: string;
  runAt: string;
  enabled: boolean;
}

export function shouldRunMission(mission: ScheduledMission, now = new Date()): boolean {
  return mission.enabled && new Date(mission.runAt).getTime() <= now.getTime();
}
