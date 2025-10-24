// Redirect root to landing page
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/landing');
}
