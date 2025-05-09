import Loader from "./components/Loader";
import NotFound from "./Components/NotFound";
import MainPage from "./components/MainPage";
import Login from "./components/Login";
import SideBar from "./Components/SideBar";
import Header from "./Components/Header";
import CalendarOverview from "./components/Calendar/CalendarOverview";
import SettingsOverview from "./components/Settings/SettingsOverview";
import SingleEvent from "./components/SingleEvent/SingleEvent";
import Account from "./components/Account";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { logout, setCredentials } from "./slices/authSlice";




function AppWrapper() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("userASY"));
    if (savedUser) {
      const currentTime = Date.now();
      const FIVE_HOURS = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

      if (currentTime - savedUser.timestamp > FIVE_HOURS) {
        // More than 5 hours have passed, remove user data
        localStorage.removeItem("userASY");
        dispatch(logout());  // Ensure Redux state is updated
      } else {
        // Otherwise, log in the user
        dispatch(setCredentials(savedUser));
      }
    }
  }, [dispatch]);

  const pathsWithoutLayout = ["/", "/contract"];
  const isMinimalPage = pathsWithoutLayout.includes(location.pathname);
  

  return (
    <div className="box-border m-0 p-0 overflow-x-hidden">
      <div className="flex flex-col h-screen">
        {!isMinimalPage && isAuthenticated && <Header />}
        <div className={isMinimalPage || !isAuthenticated ? "" : "flex flex-row flex-1"}>
          {!isMinimalPage && isAuthenticated && <SideBar />}

          <Routes>
            {/* Публичные маршруты */}
            <Route path="/" element={isAuthenticated ? <MainPage /> : <Login />} />

            {/* Условный доступ к маршрутам */}
            <Route path="/main" element={isAuthenticated ? <MainPage /> : <Loader />} />
            <Route path="/calendar" element={isAuthenticated ? <CalendarOverview /> : <Login />} />
            <Route path="/settings" element={isAuthenticated ? <SettingsOverview /> : <Login />} />
            <Route path="/event/+" element={isAuthenticated ? <SingleEvent type="add" /> : <Login />} />
            <Route path="/event/:number" element={isAuthenticated ? <SingleEvent type="view" /> : <Login />} />
            <Route path="/loader" element={isAuthenticated ? <Loader /> : <Login />} />
            <Route path="/account" element={isAuthenticated ? <Account /> : <Login />} />

            {/* 404 */}
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// Главный компонент с маршрутизатором
function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
