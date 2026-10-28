import { IonText } from '@ionic/react';

import type { Role } from '../../types/user';

const ROLE_COLORS: Record<Role, string> = {
  employee: 'primary',
  supervisor: 'tertiary',
};

export const RoleLabel = ({ role }: { role: Role }) => (
  <IonText color={ROLE_COLORS[role]}>{role}</IonText>
);
