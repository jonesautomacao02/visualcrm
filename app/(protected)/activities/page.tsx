import type { Metadata } from 'next';
import { ActivitiesPage } from '@/features/activities/ActivitiesPage'

export const metadata: Metadata = { title: 'Atividades | VisualCRM' };

export default function Activities() {
    return <ActivitiesPage />
}
