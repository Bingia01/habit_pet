// Redirect root to landing page
import { permanentRedirect } from 'next/navigation';

export default function Home() {
  permanentRedirect('/landing');
}
