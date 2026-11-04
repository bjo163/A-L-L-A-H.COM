import { defineModel, fields } from '@allah/arsy-orm';
import { modelRegistry } from '@allah/arsy-orm';

/**
 * Sentinel Session Model
 * Stores active and historical RADIUS accounting sessions
 */
export const SentinelSession = defineModel({
  name: 'sentinel.session',
  tableName: 'sentinel_session',
  displayName: 'Sentinel RADIUS Session',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    account_id: fields.many2one('sentinel.account', { label: 'Account', required: true }),
    nas_id: fields.many2one('nexus.nas', { label: 'NAS', required: true }),
    acct_session_id: fields.char({ label: 'Accounting Session ID', required: true }),
    framed_ip_address: fields.char({ label: 'Framed IP Address', required: true }),
    calling_station_id: fields.char({ label: 'Calling Station ID (MAC)', required: true }),
    called_station_id: fields.char({ label: 'Called Station ID' }),
    start_time: fields.datetime({ label: 'Start Time', required: true }),
    stop_time: fields.datetime({ label: 'Stop Time' }),
    input_octets: fields.integer({ label: 'Input Octets', default: 0 }),
    output_octets: fields.integer({ label: 'Output Octets', default: 0 }),
    session_time_seconds: fields.integer({ label: 'Session Time (seconds)', default: 0 }),
    terminate_cause: fields.char({ label: 'Terminate Cause' }),
    is_active: fields.boolean({ label: 'Active', default: true, required: true }),
    nas_port: fields.integer({ label: 'NAS Port' }),
    nas_port_type: fields.integer({ label: 'NAS Port Type' }),
    framed_protocol: fields.char({ label: 'Framed Protocol' }),
    framed_ip_netmask: fields.char({ label: 'Framed IP Netmask' }),
    framed_routing: fields.integer({ label: 'Framed Routing' }),
    framed_mtu: fields.integer({ label: 'Framed MTU' }),
    framed_compression: fields.char({ label: 'Framed Compression' }),
    login_ip_host: fields.char({ label: 'Login IP Host' }),
    login_service: fields.char({ label: 'Login Service' }),
    login_tcp_port: fields.integer({ label: 'Login TCP Port' }),
    reply_message: fields.char({ label: 'Reply Message' }),
    service_type: fields.integer({ label: 'Service Type' }),
    framed_appletalk_link: fields.char({ label: 'Framed AppleTalk Link' }),
    framed_appletalk_network: fields.integer({ label: 'Framed AppleTalk Network' }),
    framed_appletalk_zone: fields.char({ label: 'Framed AppleTalk Zone' }),
    acct_authentic: fields.char({ label: 'Acct Authentic' }),
    acct_input_packets: fields.integer({ label: 'Input Packets', default: 0 }),
    acct_output_packets: fields.integer({ label: 'Output Packets', default: 0 }),
    acct_terminate_cause: fields.char({ label: 'Terminate Cause' }),
    acct_multi_session_id: fields.char({ label: 'Multi-Session ID' }),
    acct_link_count: fields.integer({ label: 'Link Count' }),
    acct_input_gigawords: fields.integer({ label: 'Input Gigawords', default: 0 }),
    acct_output_gigawords: fields.integer({ label: 'Output Gigawords', default: 0 }),
    event_timestamp: fields.datetime({ label: 'Event Timestamp' }),
    nas_port_type_name: fields.char({ label: 'NAS Port Type Name' }),
    metadata: fields.json({ label: 'Metadata', default: {} }),
  },
  indexes: [
    { fields: ['company_id', 'account_id'], unique: true },
    { fields: ['company_id', 'nas_id'] },
    { fields: ['acct_session_id'], unique: true },
    { fields: ['start_time'] },
    { fields: ['stop_time'] },
    { fields: ['is_active'] },
    { fields: ['calling_station_id'] },
    { fields: ['framed_ip_address'] },
  ],
});

// Register model
modelRegistry.register(SentinelSession);
export * from './sentinel_session';