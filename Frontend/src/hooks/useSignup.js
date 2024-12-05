import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

let url = process.env.REACT_APP_SERVER_URL;

const useSignup = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const signup = async ({ first_name, last_name, email, password, confirmPassword, gender, role }) => {
		const success = handleInputErrors({ first_name, last_name, email, password, confirmPassword, gender, role });
		if (!success) return;

		setLoading(true);
		try {
			const res = await axios({
				url: `${url}/auth/signup`, 
				method: "POST",
				headers: { "Content-Type": "application/json" },
				data: { first_name, last_name, email, gender, role, password },
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

	// google login auth
	const googleAuth = async (tokenId) => {
		setLoading(true);
		try {
			const res = await axios({
				url: `${url}/auth/google`, 
				method: "POST",
				headers: { "Content-Type": "application/json" },
				data: { tokenId },
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
	}

	return { loading, signup, googleAuth };
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
