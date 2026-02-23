import { Link } from "react-router-dom";
import CreateTicket from "../features/tickets/CreateTicket";

export default function LoginButton({ message }) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        border: "1px dashed #999",
        borderRadius: 6,
        background: "#fafafa",
      }}
    >
      <p style={{ margin: 0 }}>
        {message || "You need to be logged in to perform this action."}
      </p>

      <Link to="/login" style={{ display: "inline-block", marginTop: 8 }}>
        Login
      </Link>
    </div>
  );
}
