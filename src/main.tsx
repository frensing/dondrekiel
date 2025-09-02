import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter as Router} from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext.tsx";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(console.error);
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Router>
            <AuthProvider>
                <App/>
            </AuthProvider>
        </Router>
    </StrictMode>,
)
