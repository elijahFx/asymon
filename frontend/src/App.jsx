import Loader from "./components/Loader";
import NotFound from "./Components/NotFound";
import MainPage from "./components/MainPage";
import Login from "./components/Login";
import SideBar from "./components/SideBar";
import Header from "./components/Header";
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
import Signup from "./components/Signup";
import Verification from "./components/Verification";
import AddEvent from "./components/AddEvent";
import List from "./components/List/List";
import SMSPage from "./components/SMSs/SMSPage";
import { ToastContainer } from "react-toastify";
import WaitingElement from "./components/WaitingList/WaitingElement";
import WaitingList from "./components/WaitingList/WaitingList";
import AddWaitingList from "./components/WaitingList/AddWaitingList";
import SMSOverview from "./components/SMSs/SMSOverview";


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

  const pathsWithoutLayout = ["/", "/contract", "/verification"];
  const isMinimalPage = pathsWithoutLayout.includes(location.pathname);
  

  return (
    <div className="box-border m-0 ">
      <div className="flex flex-col h-screen">
        {!isMinimalPage && isAuthenticated && <Header />}
        <div className={isMinimalPage || !isAuthenticated ? "" : "flex flex-row flex-1"}>
          {!isMinimalPage && isAuthenticated && <SideBar />}

          <Routes>
          
            {/* Публичные маршруты */}
            <Route path="/" element={isAuthenticated ? <MainPage /> : <Login />} />
            <Route path="/signup" element={isAuthenticated ? <MainPage /> : <Signup />} />
            <Route path="/verification" element={isAuthenticated ? <MainPage /> : <Verification />} />

            {/* Условный доступ к маршрутам */}
            <Route path="/main" element={isAuthenticated ? <MainPage type="monopoly" /> : <Loader />} />
            <Route path="/add" element={isAuthenticated ? <AddEvent /> : <Loader />} />
            <Route path="/jungle" element={isAuthenticated ? <MainPage type="jungle" /> : <Loader />} />
            <Route path="/jungle/event/:id" element={isAuthenticated ? <SingleEvent type="view" place="jungle" /> : <Login />} />
            <Route path="/bunker/event/:id" element={isAuthenticated ? <SingleEvent type="view" place="bunker"/> : <Login />} />
            <Route path="/bunker" element={isAuthenticated ? <MainPage type="bunker" /> : <Loader />} />
            <Route path="/list" element={isAuthenticated ? <List /> : <Login />} />
            <Route path="/event/:id" element={isAuthenticated ? <SingleEvent type="view" /> : <Login />} />
            <Route path="/sms" element={isAuthenticated ? <SMSOverview /> : <Login />} />
            <Route path="/loader" element={isAuthenticated ? <Loader /> : <Login />} />
            <Route path="/account" element={isAuthenticated ? <Account /> : <Login />} />


            <Route path="/waitings/add" element={isAuthenticated ? <AddWaitingList place="waitings" /> : <Login />} />
            <Route path="/views/add" element={isAuthenticated ? <AddWaitingList place="views" /> : <Login />} />
            <Route path="/waitings/:id" element={isAuthenticated ? <WaitingElement place="waitings" /> : <Login />} />
            <Route path="/views" element={isAuthenticated ? <WaitingList place="views"/> : <Login />} />

            <Route path="/waitings" element={isAuthenticated ? <WaitingList place="waitings" /> : <Login />} />
            
        
            
            <Route path="/views/:id" element={isAuthenticated ? <WaitingElement place="views" /> : <Login />} />
           

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
       <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
