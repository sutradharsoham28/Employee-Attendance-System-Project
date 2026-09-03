import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HRDashboard() {

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const navigate = useNavigate();


    /* =========================
       DATA
    ========================= */

    const [attendance, setAttendance] = useState([]);
    const [date, setDate] = useState("");
    const [leaves, setLeaves] = useState([]);


    /* =========================
       LOADING
    ========================= */

    const [dataLoading, setDataLoading] =
        useState(true);


    /* =========================
       LEAVE ACTION
    ========================= */

    const [processingLeaveId, setProcessingLeaveId] =
        useState(null);


    /* =========================
       MESSAGE
    ========================= */

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] =
        useState("success");


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
       FETCH ATTENDANCE
    ========================= */

    const fetchAttendance = async () => {

        try {

            const response = await fetch(
                "http://localhost:5000/api/attendance/all",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (response.ok) {

                setAttendance(
                    data.attendance
                );

                setDate(
                    data.date
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
       FETCH LEAVES
    ========================= */

    const fetchLeaves = async () => {

        try {

            const response = await fetch(
                "http://localhost:5000/api/leave/all",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (response.ok) {

                setLeaves(
                    data.leaves
                );

            }

        } catch (error) {

            console.log(
                "Leave error:",
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
                fetchLeaves()
            ]);

            setDataLoading(false);

        };

        loadDashboard();

    }, []);


    /* =========================
       UPDATE LEAVE STATUS
    ========================= */

    const handleLeaveStatus = async (
        leaveId,
        status
    ) => {

        if (processingLeaveId) {
            return;
        }

        setProcessingLeaveId(
            leaveId
        );

        try {

            const response = await fetch(
                `http://localhost:5000/api/leave/${leaveId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status
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
                data.message,
                "success"
            );


            await fetchLeaves();

        } catch (error) {

            console.log(
                "Leave status error:",
                error
            );

            showMessage(
                "Unable to update leave request. Please try again.",
                "error"
            );

        } finally {

            setProcessingLeaveId(
                null
            );

        }

    };


    /* =========================
       COUNTS
    ========================= */

    const presentCount =
        attendance.filter(
            employee =>
                employee.status === "Present"
        ).length;


    const lateCount =
        attendance.filter(
            employee =>
                employee.status === "Late"
        ).length;


    const absentCount =
        attendance.filter(
            employee =>
                employee.status === "Absent"
        ).length;


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
                    Please wait while we load today's information...
                </p>

            </div>

        );

    }


    return (

        <div className="dashboard-container">


            {/* =========================
                HEADER
            ========================= */}

            <header className="dashboard-header">

                <div>

                    <h1>
                        HR Dashboard
                    </h1>

                    <p>
                        Monitor employee attendance and leave
                    </p>

                </div>


                <button
                    className="logout-button"
                    onClick={handleLogout}
                >

                    Logout

                </button>

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

            <section className="welcome-card">

                <div>

                    <h2>
                        Welcome, {user.name} 👋
                    </h2>

                    <p>
                        Here's today's employee overview.
                    </p>

                </div>


                <div className="employee-details">

                    <div className="employee-detail-item">

                        <span>
                            Employee ID
                        </span>

                        <strong>
                            {user.employeeId}
                        </strong>

                    </div>


                    <div className="employee-detail-item">

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

            <section className="summary-grid">


                <div className="summary-card">

                    <p>
                        Total Employees
                    </p>

                    <h2>
                        {attendance.length}
                    </h2>

                </div>


                <div className="summary-card">

                    <p>
                        Present
                    </p>

                    <h2 className="stat-present">
                        {presentCount}
                    </h2>

                </div>


                <div className="summary-card">

                    <p>
                        Late
                    </p>

                    <h2 className="stat-late">
                        {lateCount}
                    </h2>

                </div>


                <div className="summary-card">

                    <p>
                        Absent
                    </p>

                    <h2 className="stat-absent">
                        {absentCount}
                    </h2>

                </div>

            </section>


            {/* =========================
                ATTENDANCE
            ========================= */}

            <section className="dashboard-section">

                <div className="section-title">

                    <div>

                        <h2>
                            Today's Attendance
                        </h2>

                        <p>
                            Employee attendance for {date}
                        </p>

                    </div>

                </div>


                {attendance.length === 0 ? (

                    <div className="empty-state">

                        <p>
                            No employee attendance found.
                        </p>

                    </div>

                ) : (

                    <div className="table-container">

                        <table className="hr-table">

                            <thead>

                                <tr>

                                    <th>
                                        Employee ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Check In
                                    </th>

                                    <th>
                                        Check Out
                                    </th>

                                    <th>
                                        Working Hours
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {attendance.map(
                                    (employee) => (

                                        <tr
                                            key={
                                                employee.employeeId
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    {
                                                        employee.employeeId
                                                    }
                                                </strong>

                                            </td>


                                            <td>
                                                {employee.name}
                                            </td>


                                            <td>
                                                {
                                                    employee.department
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={`attendance-status ${employee.status
                                                        .toLowerCase()
                                                        .replace(
                                                            " ",
                                                            "-"
                                                        )}`}
                                                >

                                                    {
                                                        employee.status
                                                    }

                                                </span>

                                            </td>


                                            <td>
                                                {
                                                    employee.checkIn ||
                                                    "--"
                                                }
                                            </td>


                                            <td>
                                                {
                                                    employee.checkOut ||
                                                    "--"
                                                }
                                            </td>


                                            <td>

                                                {
                                                    employee.workingHours !==
                                                        null &&
                                                    employee.workingHours !==
                                                        undefined
                                                        ? `${employee.workingHours} hrs`
                                                        : "--"
                                                }

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =========================
                LEAVE APPLICATIONS
            ========================= */}

            <section className="dashboard-section">

                <div className="section-title">

                    <div>

                        <h2>
                            Leave Applications
                        </h2>

                        <p>
                            Review and manage employee leave requests
                        </p>

                    </div>

                </div>


                {leaves.length === 0 ? (

                    <div className="empty-state">

                        <p>
                            No leave applications found.
                        </p>

                    </div>

                ) : (

                    <div className="table-container">

                        <table className="hr-table">

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Department
                                    </th>

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

                                    <th>
                                        Action
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

                                                <div className="employee-table-info">

                                                    <strong>
                                                        {
                                                            leave.employeeName
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            leave.employeeId
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            <td>
                                                {
                                                    leave.department
                                                }
                                            </td>


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


                                            <td>

                                                {leave.status ===
                                                "Pending" ? (

                                                    <div className="action-buttons">


                                                        <button
                                                            className="approve-button"
                                                            onClick={() =>
                                                                handleLeaveStatus(
                                                                    leave._id,
                                                                    "Approved"
                                                                )
                                                            }
                                                            disabled={
                                                                processingLeaveId !== null
                                                            }
                                                        >

                                                            {processingLeaveId ===
                                                            leave._id
                                                                ? "Processing..."
                                                                : "Approve"}

                                                        </button>


                                                        <button
                                                            className="reject-button"
                                                            onClick={() =>
                                                                handleLeaveStatus(
                                                                    leave._id,
                                                                    "Rejected"
                                                                )
                                                            }
                                                            disabled={
                                                                processingLeaveId !== null
                                                            }
                                                        >

                                                            {processingLeaveId ===
                                                            leave._id
                                                                ? "Processing..."
                                                                : "Reject"}

                                                        </button>

                                                    </div>

                                                ) : (

                                                    <span className="completed-action">

                                                        Completed

                                                    </span>

                                                )}

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>

    );

}

export default HRDashboard;