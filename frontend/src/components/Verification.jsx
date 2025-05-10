import React from "react";
import { Link } from "react-router-dom";

const Verification = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-10 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Ожидание верификации
        </h2>
        <p className="text-sm text-gray-600">
          Ваш аккаунт успешно зарегистрирован, но пока не прошел верификацию администратором сайта.
        </p>
        <p className="text-sm text-gray-600">
          После подтверждения вы сможете войти через{" "}
          <Link to="/" className="text-blue-600 underline">
            /login
          </Link>{" "}
          и пользоваться всеми необходимыми функциями.
        </p>
      </div>
    </div>
  );
};

export default Verification;
