import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svgs/X";

import { IoIosMail } from "react-icons/io";
import { IoMdKey } from "react-icons/io";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const LoginPage = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const [userType, setUserType] = useState(false);


	const queryClient = useQueryClient();
	const { mutate: loginMutation, isPending, isError, error, } = useMutation({
		mutationFn: async ({ username, password }) => {
			try {
				const res = await fetch("/api/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ username, password }),
				});

				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Login successfully", {
				style: {
					background: "#1E90FF", // Light blue
					color: "#FFFFFF",      // White text
				},
			});
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		loginMutation(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className='lg:w-2/3 fill-[#1DA1F2]' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-[#1DA1F2]' />
					<h1 className='text-4xl font-extrabold text-[#1DA1F2]'>Login now</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<IoIosMail />
						<input
							type='text'
							className='grow'
							placeholder='username'
							name='username'
							onChange={handleInputChange}
							value={formData.username}
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<IoMdKey />
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					{/* <div className="flex justify-between items-center mx-0 mb-4 gap-4">
						<label htmlFor="User" className="flex items-center gap-2">
							User:
							<input
								type="radio"
								id="User"
								name="gender"
								defaultChecked
							/>
						</label>

						<label htmlFor="Admin" className="flex items-center gap-2">
							Admin:
							<input
								type="radio"
								id="Admin"
								name="gender"
							/>
						</label>
					</div> */}
					{/* <button className='btn rounded-full btn-primary text-white'> */}
					<button className="btn rounded-full bg-[#1DA1F2] text-white btn-outline w-full">
						{isPending ? "Loading..." : "Login"}
					</button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-[#333333] text-lg'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						{/* <button className='btn rounded-full btn-primary text-white btn-outline w-full'> */}
						<button className="btn rounded-full bg-[#1DA1F2] text-white btn-outline w-full">
							Sign up
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default LoginPage;