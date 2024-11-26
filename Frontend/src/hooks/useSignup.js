import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useSignup = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const signup = async ({ first_name, last_name, email, password, confirmPassword, gender, role }) => {
		const success = handleInputErrors({ first_name, last_name, email, password, confirmPassword, gender, role });
		if (!success) return;

		setLoading(true);
		try {
			const apiUrl = 'http://localhost:9099';
			const res = await fetch(`${apiUrl}/auth/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ first_name, last_name, email, password, confirmPassword, gender, role }),
			});

			const data = await res.json();
			if (data.error) {
				throw new Error(data.error);
			}
			localStorage.setItem("chat-user", JSON.stringify(data));
			setAuthUser(data);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, signup };
};
export default useSignup;

function handleInputErrors({ first_name, last_name, email, password, confirmPassword, gender, role }) {
	if (!first_name || !last_name || !email || !password || !confirmPassword || !gender || !role) {
		toast.error("Please fill in all fields");
		return false;
	}

	if (password !== confirmPassword) {
		toast.error("Passwords do not match");
		return false;
	}

	if (password.length < 6) {
		toast.error("Password must be at least 6 characters");
		return false;
	}

	return true;
}
