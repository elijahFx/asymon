import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../apis/userApi";
import { useDispatch } from "react-redux";
import { setCredentials, setError } from "../slices/authSlice";
import Loader from "./Loader";
import { Link } from "react-router-dom";
import logo from "../../src/imgs/logo.svg"

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({
    nickname: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(formData).unwrap();
      dispatch(setCredentials(userData));
      navigate("/main");
    } catch (err) {
      dispatch(setError(err.data?.message || "Ошибка при входе"));
      if (err.status === 403) {
        navigate("/verification");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <img
              src={logo}
              alt="Логотип"
              className="h-36 w-36 max-h-full object-contain cursor-pointer select-none transition-all duration-400 mb-4"
            />{" "}
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              Добро пожаловать
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Введите логин и пароль
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="nickname" className="sr-only">
                  Логин
                </label>
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C1B60] focus:border-transparent"
                  placeholder="Логин"
                  value={formData.nickname}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Пароль
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C1B60] focus:border-transparent"
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`cursor-pointer group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#0C1B60] hover:bg-[#0a154d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C1B60] transition-colors duration-300 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Вход..." : "Войти"}
              </button>
            </div>
          </form>
          <p className="mt-2 text-center text-sm text-gray-600">
            У Вас еще нет аккаунта?{" "}
            <Link
              className="text-blue-600 underline cursor-pointer"
              to="/signup"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
