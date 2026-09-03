import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import HRDashboard from "./pages/HRDashboard";


/* =========================
   ACCESS DENIED PAGE
========================= */

function AccessDenied() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const handleGoToDashboard = () => {

        if (user?.role === "hr") {
            navigate("/hr");
        } else {
            navigate("/employee");
        }

    };


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };


    return (

        <div className="auth-container">

            <div className="auth-card">

                <div
                    style={{
                        fontSize: "56px",
                        marginBottom: "15px"
                    }}
                >
                    🔒
                </div>


                <h1>
                    Access Denied
                </h1>


                <p className="auth-description">

                    You don't have permission to access
                    this page.

                </p>


                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        justifyContent: "center",
                        marginTop: "25px"
                    }}
                >

                    <button
                        className="primary-button"
                        onClick={handleGoToDashboard}
                    >
                        Go to Dashboard
                    </button>


                    <button
                        className="link-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </div>

        </div>

    );

}


/* =========================
   PROTECTED ROUTE
========================= */

function ProtectedRoute({
    children,
    allowedRole
}) {

    const token =
        localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user")
    );


    /* =========================
       NOT LOGGED IN
    ========================= */

    if (!token || !user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    /* =========================
       WRONG ROLE
    ========================= */

    if (
        allowedRole &&
        user.role !== allowedRole
    ) {

        return <AccessDenied />;

    }


    return children;

}


/* =========================
   APP
========================= */

function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* LOGIN */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* REGISTER */}

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* EMPLOYEE */}

                <Route
                    path="/employee"
                    element={

                        <ProtectedRoute
                            allowedRole="employee"
                        >

                            <EmployeeDashboard />

                        </ProtectedRoute>

                    }
                />


                {/* HR */}

                <Route
                    path="/hr"
                    element={

                        <ProtectedRoute
                            allowedRole="hr"
                        >

                            <HRDashboard />

                        </ProtectedRoute>

                    }
                />


                {/* UNKNOWN ROUTE */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;