import type { Metadata } from 'next';
import { ContactsPage } from '@/features/contacts/ContactsPage'

export const metadata: Metadata = { title: 'Contatos | VisualCRM' };

export default function Contacts() {
    return <ContactsPage />
}
