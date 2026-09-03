import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function EmployeeDashboard() {

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const navigate = useNavigate();


    /* =========================
       DATA STATES
    ========================= */

    const [attendance, setAttendance] = useState(null);
    const [leaveBalance, setLeaveBalance] = useState(0);
    const [leaves, setLeaves] = useState([]);

    const [dataLoading, setDataLoading] = useState(true);


    /* =========================
       LEAVE FORM
    ========================= */

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");

    const [formErrors, setFormErrors] = useState({
        startDate: "",
        endDate: "",
        reason: ""
    });


    /* =========================
       BUTTON LOADING STATES
    ========================= */

    const [checkingIn, setCheckingIn] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [submittingLeave, setSubmittingLeave] = useState(false);


    /* =========================
       MESSAGE
    ========================= */

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");


    /* =========================
       NAVIGATION
    ========================= */

    const [activeSection, setActiveSection] =
        useState("dashboard");


    /* =========================
       SHOW MESSAGE
    ========================= */

    const showMessage = (
        text,
        type = "success"
    ) => {

        setMessage(text);
        setMessageType(type);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        setTimeout(() => {
            setMessage("");
        }, 4000);

    };


    /* =========================
       LOGOUT
    ========================= */

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };


    /* =========================
       NAVIGATION
    ========================= */

    const handleNavigation = (section) => {

        setActiveSection(section);

        if (section === "dashboard") {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } else {

            document
                .getElementById(section)
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        }

    };


    /* =========================
       FETCH ATTENDANCE
    ========================= */

    const fetchAttendance = async () => {

        try {

            const response = await fetch(
                "http://localhost:5000/api/attendance/my",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                const today =
                    new Date().toLocaleDateString(
                        "en-CA"
                    );

                const todayAttendance =
                    data.attendance.find(
                        record =>
                            record.date === today
                    );

                setAttendance(
                    todayAttendance || null
                );

            }

        } catch (error) {

            console.log(
                "Attendance error:",
                error
            );

        }

    };


    /* =========================
       FETCH LEAVE BALANCE
    ========================= */

    const fetchLeaveBalance = async () => {

        try {

            const response = await fetch(
                "http://localhost:5000/api/leave/balance",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                setLeaveBalance(
                    data.leaveBalance
                );

            }

        } catch (error) {

            console.log(
                "Leave balance error:",
                error
            );

        }

    };


    /* =========================
       FETCH LEAVE HISTORY
    ========================= */

    const fetchLeaves = async () => {

        try {

            const response = await fetch(
                "http://localhost:5000/api/leave/my",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                setLeaves(
                    data.leaves
                );

            }

        } catch (error) {

            console.log(
                "Leave history error:",
                error
            );

        }

    };


    /* =========================
       INITIAL DATA
    ========================= */

    useEffect(() => {

        const loadDashboard = async () => {

            setDataLoading(true);

            await Promise.all([
                fetchAttendance(),
                fetchLeaveBalance(),
                fetchLeaves()
            ]);

            setDataLoading(false);

        };

        loadDashboard();

    }, []);


    /* =========================
       CHECK IN
    ========================= */

    const handleCheckIn = async () => {

        if (checkingIn) {
            return;
        }

        setCheckingIn(true);

        try {

            const response = await fetch(
                "http://localhost:5000/api/attendance/checkin",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                showMessage(
                    data.message,
                    "error"
                );

                return;

            }

            showMessage(
                "Check-in successful",
                "success"
            );

            await fetchAttendance();

        } catch (error) {

            console.log(
                "Check-in error:",
                error
            );

            showMessage(
                "Unable to check in. Please try again.",
                "error"
            );

        } finally {

            setCheckingIn(false);

        }

    };


    /* =========================
       CHECK OUT
    ========================= */

    const handleCheckOut = async () => {

        if (checkingOut) {
            return;
        }

        setCheckingOut(true);

        try {

            const response = await fetch(
                "http://localhost:5000/api/attendance/checkout",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                showMessage(
                    data.message,
                    "error"
                );

                return;

            }

            showMessage(
                "Check-out successful",
                "success"
            );

            await fetchAttendance();

        } catch (error) {

            console.log(
                "Check-out error:",
                error
            );

            showMessage(
                "Unable to check out. Please try again.",
                "error"
            );

        } finally {

            setCheckingOut(false);

        }

    };


    /* =========================
       VALIDATE LEAVE FORM
    ========================= */

    const validateLeaveForm = () => {

        const errors = {
            startDate: "",
            endDate: "",
            reason: ""
        };

        let valid = true;


        if (!startDate) {

            errors.startDate =
                "Please select a start date.";

            valid = false;

        }


        if (!endDate) {

            errors.endDate =
                "Please select an end date.";

            valid = false;

        }


        if (
            startDate &&
            endDate &&
            endDate < startDate
        ) {

            errors.endDate =
                "End date cannot be before start date.";

            valid = false;

        }


        if (!reason.trim()) {

            errors.reason =
                "Please enter a reason for your leave.";

            valid = false;

        }
        else if (reason.trim().length < 5) {

            errors.reason =
                "Reason should contain at least 5 characters.";

            valid = false;

        }


        setFormErrors(errors);

        return valid;

    };


    /* =========================
       APPLY LEAVE
    ========================= */

    const handleApplyLeave = async (e) => {

        e.preventDefault();

        if (submittingLeave) {
            return;
        }


        if (!validateLeaveForm()) {
            return;
        }


        setSubmittingLeave(true);

        try {

            const response = await fetch(
                "http://localhost:5000/api/leave/apply",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        startDate,
                        endDate,
                        reason: reason.trim()
                    })

                }
            );

            const data =
                await response.json();


            if (!response.ok) {

                showMessage(
                    data.message,
                    "error"
                );

                return;

            }


            showMessage(
                "Leave application submitted successfully",
                "success"
            );


            setStartDate("");
            setEndDate("");
            setReason("");

            setFormErrors({
                startDate: "",
                endDate: "",
                reason: ""
            });


            await fetchLeaves();

        } catch (error) {

            console.log(
                "Leave application error:",
                error
            );

            showMessage(
                "Unable to submit leave request. Please try again.",
                "error"
            );

        } finally {

            setSubmittingLeave(false);

        }

    };


    /* =========================
       LOADING SCREEN
    ========================= */

    if (dataLoading) {

        return (

            <div className="dashboard-loading">

                <div className="loading-spinner"></div>

                <h2>
                    Loading Dashboard
                </h2>

                <p>
                    Please wait while we load your information...
                </p>

            </div>

        );

    }


    return (

        <div className="app-layout">


            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="sidebar">


                <div className="sidebar-brand">

                    <div className="brand-icon">
                        EA
                    </div>

                    <div>

                        <h2>
                            Employee
                        </h2>

                        <span>
                            Attendance System
                        </span>

                    </div>

                </div>


                <nav className="sidebar-nav">

                    <button
                        className={`nav-item ${
                            activeSection === "dashboard"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigation("dashboard")
                        }
                    >

                        <span>
                            ▣
                        </span>

                        Dashboard

                    </button>


                    <button
                        className={`nav-item ${
                            activeSection === "attendance"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigation("attendance")
                        }
                    >

                        <span>
                            ◷
                        </span>

                        Attendance

                    </button>


                    <button
                        className={`nav-item ${
                            activeSection === "leave"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigation("leave")
                        }
                    >

                        <span>
                            ▤
                        </span>

                        Leave

                    </button>


                    <button
                        className={`nav-item ${
                            activeSection === "history"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigation("history")
                        }
                    >

                        <span>
                            ☷
                        </span>

                        Leave History

                    </button>

                </nav>


                <div className="sidebar-bottom">

                    <div className="sidebar-user">

                        <div className="user-avatar">

                            {user.name
                                .charAt(0)
                                .toUpperCase()}

                        </div>

                        <div>

                            <strong>
                                {user.name}
                            </strong>

                            <span>
                                {user.employeeId}
                            </span>

                        </div>

                    </div>


                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >

                        ↪ Logout

                    </button>

                </div>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="main-content">


                {/* HEADER */}

                <header className="top-header">

                    <div>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Welcome back,{" "}
                            {user.name.split(" ")[0]}.
                            Here's your overview for today.
                        </p>

                    </div>


                    <div className="header-date">

                        {new Date().toLocaleDateString(
                            "en-IN",
                            {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            }
                        )}

                    </div>

                </header>


                {/* =========================
                    MESSAGE
                ========================= */}

                {message && (

                    <div
                        className={`dashboard-message ${messageType}`}
                    >

                        <span>

                            {messageType === "success"
                                ? "✓"
                                : "✕"}

                            {" "}

                            {message}

                        </span>


                        <button
                            onClick={() =>
                                setMessage("")
                            }
                            aria-label="Close message"
                        >

                            ×

                        </button>

                    </div>

                )}


                {/* =========================
                    WELCOME
                ========================= */}

                <section
                    id="dashboard"
                    className="modern-welcome"
                >

                    <div>

                        <span className="welcome-label">
                            EMPLOYEE PORTAL
                        </span>

                        <h2>
                            Good to see you,{" "}
                            {user.name.split(" ")[0]} 👋
                        </h2>

                        <p>
                            Keep track of your attendance,
                            working hours and leave requests.
                        </p>

                    </div>


                    <div className="welcome-details">

                        <div>

                            <span>
                                Employee ID
                            </span>

                            <strong>
                                {user.employeeId}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Department
                            </span>

                            <strong>
                                {user.department}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =========================
                    SUMMARY
                ========================= */}

                <section className="modern-summary">


                    <div className="modern-stat-card">

                        <div className="stat-icon">
                            ◷
                        </div>

                        <div>

                            <span>
                                Today's Status
                            </span>

                            <strong>
                                {attendance
                                    ? attendance.status
                                    : "Not Checked In"}
                            </strong>

                        </div>

                    </div>


                    <div className="modern-stat-card">

                        <div className="stat-icon">
                            ⇥
                        </div>

                        <div>

                            <span>
                                Check In
                            </span>

                            <strong>
                                {attendance?.checkIn || "--"}
                            </strong>

                        </div>

                    </div>


                    <div className="modern-stat-card">

                        <div className="stat-icon">
                            ⇤
                        </div>

                        <div>

                            <span>
                                Check Out
                            </span>

                            <strong>
                                {attendance?.checkOut || "--"}
                            </strong>

                        </div>

                    </div>


                    <div className="modern-stat-card">

                        <div className="stat-icon">
                            ▣
                        </div>

                        <div>

                            <span>
                                Leave Balance
                            </span>

                            <strong>
                                {leaveBalance} Days
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =========================
                    ATTENDANCE
                ========================= */}

                <section
                    id="attendance"
                    className="modern-section"
                >

                    <div className="modern-section-header">

                        <div>

                            <h2>
                                Today's Attendance
                            </h2>

                            <p>
                                Record your working hours for today.
                            </p>

                        </div>

                    </div>


                    <div className="attendance-modern-card">


                        <div className="attendance-modern-info">


                            <div>

                                <span>
                                    Status
                                </span>

                                <strong>
                                    {attendance
                                        ? attendance.status
                                        : "Not Checked In"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Check In
                                </span>

                                <strong>
                                    {attendance?.checkIn || "--"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Check Out
                                </span>

                                <strong>
                                    {attendance?.checkOut || "--"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Working Hours
                                </span>

                                <strong>

                                    {attendance?.workingHours !== undefined
                                        ? `${attendance.workingHours} hrs`
                                        : "--"}

                                </strong>

                            </div>

                        </div>


                        <div className="attendance-modern-actions">


                            <button
                                className="modern-checkin"
                                onClick={handleCheckIn}
                                disabled={
                                    attendance !== null ||
                                    checkingIn ||
                                    checkingOut
                                }
                            >

                                {checkingIn
                                    ? "Checking In..."
                                    : "Check In"}

                            </button>


                            <button
                                className="modern-checkout"
                                onClick={handleCheckOut}
                                disabled={
                                    attendance === null ||
                                    attendance.checkOut !== undefined &&
                                    attendance.checkOut !== null ||
                                    checkingIn ||
                                    checkingOut
                                }
                            >

                                {checkingOut
                                    ? "Checking Out..."
                                    : "Check Out"}

                            </button>

                        </div>

                    </div>

                </section>


                {/* =========================
                    APPLY LEAVE
                ========================= */}

                <section
                    id="leave"
                    className="modern-section"
                >

                    <div className="modern-section-header">

                        <div>

                            <h2>
                                Apply for Leave
                            </h2>

                            <p>
                                Submit a new leave request.
                            </p>

                        </div>


                        <div className="leave-balance-display">

                            {leaveBalance} days available

                        </div>

                    </div>


                    <form
                        className="modern-leave-form"
                        onSubmit={handleApplyLeave}
                        noValidate
                    >


                        <div className="modern-form-row">


                            <div className="modern-form-group">

                                <label>
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    value={startDate}
                                    min={
                                        new Date()
                                            .toLocaleDateString(
                                                "en-CA"
                                            )
                                    }
                                    onChange={(e) => {

                                        setStartDate(
                                            e.target.value
                                        );

                                        setFormErrors({
                                            ...formErrors,
                                            startDate: ""
                                        });

                                    }}
                                    className={
                                        formErrors.startDate
                                            ? "input-error"
                                            : ""
                                    }
                                    required
                                />

                                {formErrors.startDate && (

                                    <span className="field-error">
                                        {formErrors.startDate}
                                    </span>

                                )}

                            </div>


                            <div className="modern-form-group">

                                <label>
                                    End Date
                                </label>

                                <input
                                    type="date"
                                    value={endDate}
                                    min={
                                        startDate ||
                                        new Date()
                                            .toLocaleDateString(
                                                "en-CA"
                                            )
                                    }
                                    onChange={(e) => {

                                        setEndDate(
                                            e.target.value
                                        );

                                        setFormErrors({
                                            ...formErrors,
                                            endDate: ""
                                        });

                                    }}
                                    className={
                                        formErrors.endDate
                                            ? "input-error"
                                            : ""
                                    }
                                    required
                                />

                                {formErrors.endDate && (

                                    <span className="field-error">
                                        {formErrors.endDate}
                                    </span>

                                )}

                            </div>

                        </div>


                        <div className="modern-form-group">

                            <label>
                                Reason
                            </label>

                            <textarea
                                value={reason}
                                onChange={(e) => {

                                    setReason(
                                        e.target.value
                                    );

                                    setFormErrors({
                                        ...formErrors,
                                        reason: ""
                                    });

                                }}
                                placeholder="Enter the reason for your leave..."
                                rows="4"
                                className={
                                    formErrors.reason
                                        ? "input-error"
                                        : ""
                                }
                                required
                            />

                            {formErrors.reason && (

                                <span className="field-error">
                                    {formErrors.reason}
                                </span>

                            )}

                        </div>


                        <button
                            type="submit"
                            className="modern-submit"
                            disabled={submittingLeave}
                        >

                            {submittingLeave
                                ? "Submitting..."
                                : "Submit Leave Request"}

                        </button>

                    </form>

                </section>


                {/* =========================
                    LEAVE HISTORY
                ========================= */}

                <section
                    id="history"
                    className="modern-section"
                >

                    <div className="modern-section-header">

                        <div>

                            <h2>
                                Leave History
                            </h2>

                            <p>
                                Track your previous leave requests.
                            </p>

                        </div>

                    </div>


                    {leaves.length === 0 ? (

                        <div className="modern-empty">

                            No leave applications found.

                        </div>

                    ) : (

                        <div className="modern-table-container">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Start Date
                                        </th>

                                        <th>
                                            End Date
                                        </th>

                                        <th>
                                            Reason
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {leaves.map(
                                        (leave) => (

                                            <tr
                                                key={
                                                    leave._id
                                                }
                                            >

                                                <td>
                                                    {
                                                        leave.startDate
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        leave.endDate
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        leave.reason
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={`status-badge ${leave.status.toLowerCase()}`}
                                                    >
                                                        {
                                                            leave.status
                                                        }
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>

    );

}

export default EmployeeDashboard;