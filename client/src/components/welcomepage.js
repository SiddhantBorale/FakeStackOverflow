import { useNavigate } from "react-router-dom";
import "../stylesheets/App.css";
import Cookies from "js-cookie";

export default function WelcomePage() {
	const navigate = useNavigate();
	return (
		<div id="welcome" className="welcome">
			<div>
				<h1>Welcome to Fake Stack Overflow</h1>
				<div id="welcome-buttons" className="welcome-buttons">
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							navigate("/login");
						}}
					>
						Login
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							navigate("/register");
						}}
					>
						Register
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							if (Cookies.get("token")) {
								Cookies.remove("token");
							}
							navigate("/questions");
						}}
					>
						Continue as Guest
					</button>
				</div>
			</div>
		</div>
	);
}
