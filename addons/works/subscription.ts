import { modelRegistry } from '@allah/arsy-orm';
import { IspSubscription } from './models/isp_subscription';

export type IspSubscriptionStatus =
  | 'draft'
  | 'pending_payment'
  | 'active'
  | 'grace'
  | 'suspended'
  | 'expired'
  | 'cancelled'
  | 'reactivation_pending';

export interface IspSubscriptionEvent {
  type: 'subscription.activated' | 'subscription.suspended' | 'subscription.reactivated' | 'subscription.cancelled' | 'subscription.entered_grace' | 'subscription.expired';
  subscriptionId: number;
  status: IspSubscriptionStatus;
  reason?: string;
}

const eventListeners: ((event: IspSubscriptionEvent) => void)[] = [];

export function on(eventType: IspSubscriptionEvent['type'], callback: (event: IspSubscriptionEvent) => void): void {
  eventListeners.push(callback);
}

export function emit(event: IspSubscriptionEvent): void {
  for (const listener of eventListeners) {
    listener(event);
  }
}

export async function transitionSubscription(
  subscriptionId: number,
  toStatus: IspSubscriptionStatus,
  options: { reason?: string } = {}
): Promise<void> {
  const model = modelRegistry.get('isp.subscription');
  if (!model) throw new Error('Isp.subscription model not registered');

  const repo = new (model as any).constructor ? new (model as any).constructor() : new (await import('@allah/arsy-orm')).BaseRepository(model);
  
  // Find current subscription
  const subscription = await repo.findById(subscriptionId);
  if (!subscription) throw new Error('Subscription not found');

  // Define valid state transitions
  const validTransitions: Record<IspSubscriptionStatus, IspSubscriptionStatus[]> = {
    draft: ['pending_payment', 'cancelled'],
    pending_payment: ['active', 'cancelled'],
    active: ['grace', 'suspended', 'cancelled'],
    grace: ['active', 'suspended', 'expired', 'cancelled'],
    suspended: ['reactivation_pending', 'cancelled', 'active'],
    expired: ['cancelled'],
    cancelled: [],
    reactivation_pending: ['active', 'cancelled'],
  };

  const currentStatus = subscription.status as IspSubscriptionStatus;
  const allowedNext = validTransitions[currentStatus] || [];

  if (!allowedNext.includes(toStatus)) {
    throw new Error(`Invalid state transition from '${currentStatus}' to '${toStatus}'. Allowed: ${allowedNext.join(', ')}`);
  }

  // Execute transition-specific logic
  switch (toStatus) {
    case 'active':
      if (currentStatus !== 'draft' && currentStatus !== 'pending_payment' && currentStatus !== 'grace' && currentStatus !== 'reactivation_pending') {
        throw new Error(`Cannot activate subscription from '${currentStatus}' state`);
      }
      await repo.update(subscriptionId, {
        status: 'active',
        start_date: new Date().toISOString(),
        suspended_reason: null,
      });
      emit({
        type: 'subscription.activated',
        subscriptionId,
        status: 'active',
      });
      break;

    case 'grace':
      await repo.update(subscriptionId, {
        status: 'grace',
        grace_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      emit({
        type: 'subscription.entered_grace',
        subscriptionId,
        status: 'grace',
      });
      break;

    case 'suspended':
      await repo.update(subscriptionId, {
        status: 'suspended',
        suspended_reason: options.reason || 'No reason provided',
      });
      emit({
        type: 'subscription.suspended',
        subscriptionId,
        status: 'suspended',
        reason: options.reason,
      });
      break;

    case 'reactivated':
      await repo.update(subscriptionId, {
        status: 'active',
        suspended_reason: null,
      });
      emit({
        type: 'subscription.reactivated',
        subscriptionId,
        status: 'active',
      });
      break;

    case 'cancelled':
      await repo.update(subscriptionId, {
        status: 'cancelled',
      });
      emit({
        type: 'subscription.cancelled',
        subscriptionId,
        status: 'cancelled',
      });
      break;

    case 'expired':
      await repo.update(subscriptionId, {
        status: 'expired',
      });
      emit({
        type: 'subscription.expired',
        subscriptionId,
        status: 'expired',
      });
      break;
  }
}