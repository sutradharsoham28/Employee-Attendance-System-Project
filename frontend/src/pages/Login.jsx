import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            localStorage.setItem("token", data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            if (data.user.role === "hr") {
                navigate("/hr");
            } else {
                navigate("/employee");
            }

        } catch (error) {

            console.log("Login error:", error);
            alert("Something went wrong");

        }

    };

    return (

        <div className="auth-container">

            <div className="auth-card">

                <h1>Employee Attendance</h1>

                <p className="auth-subtitle">
                    Management System
                </p>

                <h2>Welcome Back</h2>

                <p className="auth-description">
                    Login to access your account
                </p>

                <form onSubmit={handleLogin}>

                    <div className="form-group">

                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                    >
                        Login
                    </button>

                </form>

                <p className="register-text">

                    Don't have an account?

                    <button
                        className="link-button"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </button>

                </p>

            </div>

        </div>

    );

}

export default Login;