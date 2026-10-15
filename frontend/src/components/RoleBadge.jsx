import { ROLE_LABELS } from '../utils/roles.js';

export default function RoleBadge({ role }) {
  return <span className={`role-badge role-badge--${role.toLowerCase()}`}>{ROLE_LABELS[role] ?? role}</span>;
}
