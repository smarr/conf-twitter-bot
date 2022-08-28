import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SignUp = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const [inputError, setInputError] = useState({
		username: {
			error: false,
			message: '',
		},
		password: {
			error: false,
			message: '',
		},
		form: {
			error: false,
			message: '',
		},
	});

	const setPasswordError = (error: boolean, message: string) => {
		setInputError((prevState) => ({
			...prevState,
			password: {
				...prevState.password,
				error,
				message,
			},
		}));
	};

	const setUsernameError = (error: boolean, message: string) => {
		setInputError((prevState) => ({
			...prevState,
			username: {
				...prevState.username,
				error,
				message,
			},
		}));
	};

	// const setFormError = (error: boolean, message: string) => {
	// 	setInputError((prevState) => ({
	// 		username: {
	// 			...prevState.username,
	// 		},
	// 		password: {
	// 			...prevState.password,
	// 		},
	// 		form: {
	// 			...prevState.form,
	// 			error,
	// 			message,
	// 		},
	// 	}));
	// };

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.id === 'username') {
			setUsername(e.target.value);

			// clear any errors when user modifies input
			if (inputError.username.error) {
				setUsernameError(false, '');
			}
		} else {
			setPassword(e.target.value);

			// clear any errors when user modifies input
			if (inputError.password) {
				setPasswordError(false, '');
			}
		}
	};

	// submit form if user hits the enter key on their keyboard
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSubmission(e);
		}
	};

	// submission from input itself or from button
	const handleSubmission = (e: React.FormEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		// check username length on submission
		if (username.length === 0) {
			setUsernameError(true, 'Please enter a username.');
		}

		// check password length on submission
		if (password.length === 0) {
			setPasswordError(true, 'Please enter a password.');
		}

		if (password.length > 0 && password.length < 7) {
			setPasswordError(true, 'Password must have at least 7 characters.');
		}

		if (!inputError.username.error && !inputError.password.error) {
			console.log('No errors, submit');
		}
	};

	return (
		<div className="container mx-auto flex justify-center">
			<div className="w-full max-w-sm">
				<form className="bg-white shadow-md px-8 pt-6 pb-8 mb-4 rounded">
					<h2 className="font-medium text-3xl text-center pb-5">Sign Up</h2>
					<div className="mb-6 grid grid-cols-1 gap-4">
						<div>
							<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
								Username
							</label>
							<input
								className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:shadow-outline ${
									inputError.username.error ? 'border-red-500' : ''
								}`}
								id="username"
								type="text"
								placeholder="Username"
								value={username}
								onChange={(e) => handleChange(e)}
								onKeyDown={(e) => handleKeyDown(e)}
							/>
							<p
								className={`text-red-500 text-xs italic ${
									inputError.username.error ? 'block' : 'hidden'
								}`}
							>
								{inputError.username.message}
							</p>
						</div>
						<div>
							<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
								Password
							</label>
							<input
								className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:shadow-outline ${
									inputError.password.error ? 'border-red-500' : ''
								}`}
								id="password"
								type="password"
								placeholder="Password"
								value={password}
								onChange={(e) => handleChange(e)}
								onKeyDown={(e) => handleKeyDown(e)}
							/>
							<p
								className={`text-red-500 text-xs italic ${
									inputError.password.error ? 'block' : 'hidden'
								}`}
							>
								{inputError.password.message}
							</p>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<Link to="/" className="text-sm text-blue-500">
							Already have an account?
						</Link>
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-[8rem] h-[1.25rem] text-sm flex items-center justify-center"
							onClick={(e) => handleSubmission(e)}
						>
							Sign Up
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SignUp;
