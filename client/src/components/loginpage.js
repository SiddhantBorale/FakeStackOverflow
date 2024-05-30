import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../stylesheets/App.css";

export default function LoginPage(api) {

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const navigate = useNavigate();


	const handleSubmit = async(e) => {
		e.preventDefault();
		const response = await api.api.login(username, password);

		if (response.success) {
			console.log(response.message);
			navigate("/questions");
		} else {
			setError(response.message);
		}
	}

	return (
		<div className="login-container">
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label>Username:</label>
					<input
						type="text"
						id="username"
						name="username"
						required
						onChange={(e) => setUsername(e.target.value)}
					></input>
				</div>
				<div className="form-group">
					<label>Password:</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						onChange={(e) => setPassword(e.target.value)}
					></input>
				</div>
				<button type="submit">Login</button>
			</form>
			<button onClick={(e) => {
				e.preventDefault();
				navigate("/");
			}}>Home</button>
			{error && <p>{error}</p>}
		</div>
	);
}
