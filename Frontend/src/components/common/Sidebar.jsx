import XSvg from "../svgs/X";

import { useNavigate } from "react-router-dom";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { useState } from "react";
// import { FaUser } from "react-icons/fa";
import { RiMapPinUserFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { BiPencil } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import CreatePostModal from "./CreatePostModal";
import CreatePost from "../../pages/home/CreatePost";
const Sidebar = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { mutate: logout } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/auth/logout", {
					method: "POST",
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
			toast.success("Logout successfully", {
				style: {
					background: "#1E90FF", // Light blue
					color: "#FFFFFF",      // White text
				},
			});
			localStorage.removeItem("authUser");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			navigate("/login");
		},
		onError: () => {
			toast.error("Logout failed", {
				style: {
					background: "#B22222", // Firebrick (deep red)
					color: "#FFFFFF",      // White text for contrast
				},
			});
		},
	});

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	return (
		<div className="md:flex-[2_2_0] w-18 max-w-64">
			{/* Increased width here */}
			<div className="sticky top-0 left-0 h-screen flex flex-col border-r border-zinc-300 w-32 md:w-64">
				<Link to="/" className="flex justify-center md:justify-start">
					<XSvg className="px-1 w-16 h-16 rounded-full fill-[#1DA1F2] hover:bg-gray-300" />
				</Link>
				<ul className="flex flex-col gap-3 mt-4">
					<li className="flex justify-center md:justify-start">
						<Link
							to="/"
							className="flex gap-3 items-center hover:bg-gray-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
						>
							<MdHomeFilled className="w-8 h-8" />
							<span className="text-2xl hidden md:block">Home</span>
						</Link>
					</li>
					<li className="flex justify-center md:justify-start">
						<Link
							to="/notifications"
							className="flex gap-3 items-center hover:bg-gray-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
						>
							<IoNotifications className="w-6 h-6" />
							<span className="text-2xl hidden md:block">Notifications</span>
						</Link>
					</li>

					<li className="flex justify-center md:justify-start">
						<Link
							to={`/profile/${authUser?.username}`}
							className="flex gap-3 items-center hover:bg-gray-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
						>
							<RiMapPinUserFill className="w-6 h-6" />
							<span className="text-2xl hidden md:block">Profile</span>
						</Link>
					</li>

					<li className="flex justify-center md:justify-start">
						<button
							// className="flex items-center justify-center w-full max-w-xs py-3 bg-black text-white text-2xl font-bold rounded-full hover:bg-[#1991DA] transition-all duration-300"
							className="flex items-center justify-center w-40 max-w-md py-3 bg-black text-white text-2xl font-bold rounded-full hover:bg-[#1991DA] transition-all duration-300"
							onClick={() => setIsModalOpen(true)}
						>
							{/* Create Post */}
							<span className="text-lg">POST</span>
						</button>
						<CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
							<CreatePost onSuccess={() => setIsModalOpen(false)} />
						</CreatePostModal>
					</li>
				</ul>
				{authUser && (
					<Link
						to={`/profile/${authUser.username}`}
						className="mt-auto mb-10 flex items-center gap-3 transition-all duration-300 hover:bg-gray-200 py-2 px-4 rounded-full"
					>
						{/* Avatar with larger size */}
						<div className="avatar flex-shrink-0">
							<div className="w-12 h-12 rounded-full">
								<img src={authUser?.profileImg || "/avatar-placeholder.png"} />
							</div>
						</div>

						{/* Text next to the avatar */}
						<div className="flex flex-col justify-center">
							<p className="text-black font-bold text-lg">{authUser?.fullName}</p>
							<p className="text-slate-500 text-sm">@{authUser?.username}</p>
						</div>

						{/* Logout icon */}
						<BiLogOut
							className="w-5 h-5 cursor-pointer transition-transform transform hover:translate-x-2 hover:text-red-500"
							onClick={(e) => {
								e.preventDefault();
								logout();
							}}
						/>
					</Link>
				)}
			</div>
		</div>
	);
};
export default Sidebar;