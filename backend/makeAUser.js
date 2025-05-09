async function registerUser() {
    try {
        const userData = {
            nickname: "komers",
            status: "admin",
            rank: "Председатель Правления",
            password: "lusya13102016", // Пароль должен хешироваться на сервере
            avatar: "dasda2", // Лучше использовать null вместо "nothing"
            fullName: "Добросельский Никита Андреевич"
        };

        const response = await fetch("http://localhost:5000/users/signup", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("User registered successfully:", result);
        return result;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
}

// Пример вызова функции
registerUser().then(() => {
    console.log("Registration process completed");
}).catch(error => {
    console.error("Error in registration process:", error);
});