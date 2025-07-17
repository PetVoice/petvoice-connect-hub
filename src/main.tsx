import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { NotificationManager } from '@/components/NotificationManager'

createRoot(document.getElementById("root")!).render(
  <>
    <NotificationManager />
    <App />
  </>
);
