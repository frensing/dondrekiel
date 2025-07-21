import PWABadge from "./PWABadge.tsx";
import "./App.css";
import Map from "./components/Map.tsx";
import {Link, Route, Routes} from "react-router-dom";
import Stationen from "./components/Stationen.tsx";
import Nachrichten from "./components/Nachrichten.tsx";
import PwaBackgroundSync from "./PwaBackgroundSync.tsx";

function App() {
    const padding = {
        padding: 5,
    };

    return (
        <>


            <Routes>
                <Route path="/" element={<Map/>}/>
                <Route path="/stationen" element={<Stationen/>}/>
                <Route path="/nachrichten" element={<Nachrichten/>}/>
            </Routes>

            <div>
                <Link style={padding} to="/">
                    Karte
                </Link>
                <Link style={padding} to="/stationen">
                    Stationen
                </Link>
                <Link style={padding} to="/nachrichten">
                    Nachrichten
                </Link>
            </div>
            <PwaBackgroundSync/>
            <PWABadge/>
        </>
    );
}

export default App;
