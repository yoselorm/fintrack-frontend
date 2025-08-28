import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import Referrals from "./pages/Referrals";
import PrivateRoute from "./services/privateRoute";
import { useSelector } from "react-redux";

function App() {
  const {user,isAuthenticated} = useSelector((state)=>state.auth)
  return (
    <div className="min-h-screen flex flex-col">
    
      {user && isAuthenticated ? <Header />: null}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/referrals" element={<Referrals />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
