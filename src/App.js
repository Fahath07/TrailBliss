import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routers/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import "./Assets/Css/global.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
