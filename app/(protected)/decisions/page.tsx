import type { Metadata } from 'next';
import { DecisionQueuePage } from '@/features/decisions/DecisionQueuePage'

export const metadata: Metadata = { title: 'Decisões | VisualCRM' };

export default function Decisions() {
    return <DecisionQueuePage />
}
