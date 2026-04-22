import type { Metadata } from 'next';
import SettingsPage from '@/features/settings/SettingsPage'

export const metadata: Metadata = { title: 'Configurações | VisualCRM' };

export default function Settings() {
    return <SettingsPage />
}
