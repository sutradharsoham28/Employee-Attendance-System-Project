import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [department, setDepartment] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e) => {

        e.preventDefault();

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        employeeId: employeeId,
                        role: "employee",
                        department: department
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert("Registration successful");

            navigate("/login");

        } catch (error) {

            console.log("Registration error:", error);

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

                <h2>Create Account</h2>

                <p className="auth-description">
                    Register as a new employee
                </p>

                <form onSubmit={handleRegister}>

                    <div className="form-group">

                        <label>Name</label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />

                    </div>

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
                            placeholder="Create a password"
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>Employee ID</label>

                        <input
                            type="text"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            placeholder="e.g. EMP004"
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>Department</label>

                        <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="e.g. IT"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                    >
                        Create Account
                    </button>

                </form>

                <p className="register-text">

                    Already have an account?

                    <button
                        className="link-button"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>

                </p>

            </div>

        </div>

    );

}

export default Register;