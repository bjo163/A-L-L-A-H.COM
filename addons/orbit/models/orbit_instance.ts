import { defineModel, fields } from '@allah/arsy-orm';

export const OrbitInstance = defineModel({
  name: 'orbit.instance',
  tableName: 'orbit_instance',
  displayName: 'Cloud Compute Instance',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Instance Name', required: true }),
    cpu_cores: fields.integer({ label: 'CPU Cores', default: 1, required: true }),
    ram_mb: fields.integer({ label: 'RAM (MB)', default: 1024, required: true }),
    disk_gb: fields.integer({ label: 'Disk (GB)', default: 20, required: true }),
    status: fields.selection(
      {
        provisioning: 'Provisioning',
        running: 'Running',
        stopped: 'Stopped',
        terminated: 'Terminated',
      },
      { label: 'Status', default: 'provisioning', required: true }
    ),
    ip_address: fields.char({ label: 'IP Address' }),
    // Typed FK (roadmap T3.5): the owning customer is a res.partner. Integer id
    // column preserved (no constraint added); the relation label enables `expand`.
    partner_id: fields.many2one('res.partner', { label: 'Partner' }),
    template_id: fields.many2one('orbit.template', { label: 'Template' }),
  },
  indexes: [{ fields: ['company_id'] }, { fields: ['status'] }],
});

export const OrbitTemplate = defineModel({
  name: 'orbit.template',
  tableName: 'orbit_template',
  displayName: 'OS Template',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Template Name', required: true }),
    os_family: fields.char({ label: 'OS Family', required: true }),
    image_hash: fields.char({ label: 'CAS Image Hash' }),
    default_cpu: fields.integer({ label: 'Default CPU Cores', default: 1 }),
    default_ram_mb: fields.integer({ label: 'Default RAM (MB)', default: 1024 }),
    default_disk_gb: fields.integer({ label: 'Default Disk (GB)', default: 20 }),
  },
  indexes: [{ fields: ['company_id'] }],
});

export const OrbitVolume = defineModel({
  name: 'orbit.volume',
  tableName: 'orbit_volume',
  displayName: 'Block Storage Volume',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Volume Name', required: true }),
    size_gb: fields.integer({ label: 'Size (GB)', required: true }),
    iops_tier: fields.selection(
      { standard: 'Standard', performance: 'Performance', premium: 'Premium' },
      { label: 'IOPS Tier', default: 'standard' }
    ),
    attach_instance_id: fields.many2one('orbit.instance', { label: 'Attached Instance' }),
  },
  indexes: [{ fields: ['company_id'] }],
});
