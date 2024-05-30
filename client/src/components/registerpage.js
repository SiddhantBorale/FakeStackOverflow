import "../stylesheets/App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage(api) {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isMatching, setIsMatching] = useState(true);
	const [error, setError] = useState("");
	const navigate = useNavigate();


	const handleSubmit = async(e) => {
		e.preventDefault();

		console.log(api);

		const response = await api.api.register(username, email, password);

		if (response.success) {
			console.log(response.message);
			navigate('/login');	
		} else {
			setError(response.message);
		}
	}	

	return (
		<div className="login-container" onSubmit={handleSubmit}>
			<form action="/submit-your-login-form" method="POST">
				<div className="form-group">
					<label>First and Last name:</label>
					<input
						type="text"
						id="username"
						name="username"
						required
						onChange={(e) => setUsername(e.target.value)}
					></input>
				</div>
				<div className="form-group">
					<label>Email ID:</label>
					<input type="text" id="email" name="email" required onChange={(e) => setEmail(e.target.value)}></input>
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
				<div className="form-group">
					<label>Confirm Password:</label>
					<input
						type="password"
						id="confirmPass"
						name="password"
						required
						onChange={(e) => {
							if (e.target.value !== password) {
								setIsMatching(false);
							} else {
								setIsMatching(true);
							}
						}}
					></input>
				</div>
				<button type="submit">Register</button>
			</form>
			<button onClick={(e) => {
				e.preventDefault();
				navigate("/");
			}}>Home</button>			
			{!isMatching && <p>The passwords don't match</p>}
			{error && error}
		</div>
	);
}
