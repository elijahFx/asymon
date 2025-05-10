import React from "react";
import logo from "../imgs/logo2.svg";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/authSlice";

export default function Header() {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const userName = useSelector(state => state?.auth?.user)
  const avatarLink = useSelector(state => state?.auth?.avatar)

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  };

  return (
    <header className="fixed top-0 left-0 z-10 bg-white h-[11vh] w-screen flex justify-between items-center px-3.5 shadow-sm">
      <div className="flex items-center gap-2 max-w-[50%] h-full overflow-hidden">
        <Link to="/main" className="flex items-center h-full border-r-2 pr-2">
       {/* <h1 className="font-bold text-[#0C1B60]">Монополия</h1>  */} 
          {<img
            src={logo}
            alt="Логотип"
            className="ts2 h-14 w-14 object-contain cursor-pointer transition-all duration-400 hover:h-16 hover:w-16"
          />}
        </Link>
        <div className="flex flex-col justify-center overflow-hidden text-ellipsis">
          <h3 className="text-sm sm:text-base md:text-xl leading-tight truncate">
            asumon.by
          </h3>
          <h4 className="text-[10px] sm:text-xs leading-tight truncate">
            Автоматизированная система управления монополией
          </h4>
        </div>
      </div>

      <div className="h-10 w-10 rounded-full flex items-center justify-center border border-gray-300 overflow-hidden mr-7">
        <a 
          data-tooltip-id="my-tooltip"
          className="h-full w-full"
          
        >
          <img
            src={avatarLink}
            alt="Аватар"
            className="h-full w-full object-cover cursor-pointer"
          />
        </a>
        <Tooltip 
          id="my-tooltip" 
          clickable
          className="z-50"
          render={({ content }) => (
            <div className="flex content-center justify-center flex-col">
              <p className="cursor-pointer transition-all duration-400 hover:underline"><Link to="/account">{userName}</Link></p>
              <button 
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 font-medium mt-1 transition-all duration-400 cursor-pointer"
              >
                Выйти
              </button>
            </div>
          )}
        />
      </div>
    </header>
  );
}