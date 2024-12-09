import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";
import useFollow from "../../hooks/useFollow"
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRef, useEffect } from "react";

const RightPanel = () => {
	const inputContainerRef = useRef(null);
	const dropdownRef = useRef(null);
	const updateDropdownPosition = () => {
		if (inputContainerRef.current && dropdownRef.current) {
			const rect = inputContainerRef.current.getBoundingClientRect();
			dropdownRef.current.style.width = `${rect.width}px`;
			dropdownRef.current.style.left = `${rect.left}px`;
			dropdownRef.current.style.top = `${rect.bottom}px`;
		}
	};
	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/users/suggested");
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
	});

	const { data: allUsers } = useQuery({
		queryKey: ["allUsers"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/users/getAllUser", {
					method: "POST"
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
	});

	const { follow, isPending } = useFollow();
	const [query, setQuery] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);

	useEffect(() => {
		if (showDropdown) {
			updateDropdownPosition();
			window.addEventListener("resize", updateDropdownPosition);
		} else {
			window.removeEventListener("resize", updateDropdownPosition);
		}

		return () => window.removeEventListener("resize", updateDropdownPosition);
	}, [showDropdown]);

	const filteredUsers = allUsers?.filter(
		(user) =>
			user.fullName.toLowerCase().includes(query.toLowerCase()) ||
			user.username.toLowerCase().includes(query.toLowerCase())
	);

	if (suggestedUsers?.length === 0) return <div className='md:w-64 w-0'></div>;

	return (
		<div className="hidden lg:block my-4 mx-2">
			{/* <div className="sticky top-2 z-20 p-4 rounded-md mb-4"> */}
			<div
				className="mb-4 input input-bordered flex items-center gap-2 w-full rounded-full bg-white shadow-lg px-4"
				ref={inputContainerRef}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					className="h-4 w-4 opacity-70"
				>
					<path
						fillRule="evenodd"
						d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
						clipRule="evenodd"
					/>
				</svg>
				<input
					type="text"
					className="grow w-full py-2 px-2"
					placeholder="Search here"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setShowDropdown(e.target.value !== "");
					}}
					onFocus={() => setShowDropdown(query !== "")}
					onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
				/>
			</div>

			{showDropdown && (
				<div
					ref={dropdownRef}
					className="absolute bg-white shadow-lg rounded-md max-h-60 overflow-y-auto z-50"
				>
					{filteredUsers.length > 0 ? (
						filteredUsers.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
								key={user._id}
							>
								<div className="avatar">
									<div className="w-10 h-10 rounded-full overflow-hidden">
										<img
											src={user.profileImg || "/avatar-placeholder.png"}
											alt={user.fullName}
										/>
									</div>
								</div>
								<div className="flex flex-col leading-tight">
									<span className="font-semibold truncate text-gray-900">
										{user.fullName}
									</span>
									<span className="text-sm text-gray-500">@{user.username}</span>
								</div>
							</Link>
						))
					) : (
						<p className="p-2 text-sm text-gray-500">No results found</p>
					)}
				</div>
			)}

			{/* "Who to follow" Section */}
			{/* <div className="bg-[white] p-4 rounded-md sticky top-20 shadow-lg"> */}
			<div className="bg-[white] p-4 rounded-md w-[295px] top-20 shadow-lg">
				<p className="font-bold text-black text-left mb-4">Who to follow</p>
				<div className="flex flex-col gap-4">
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						suggestedUsers?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className="flex items-center justify-between gap-4"
								key={user._id}
							>
								<div className="flex gap-2 items-center">
									{/* <div className="avatar"> */}
									<div className="w-8 h-8 rounded-full overflow-hidden">
										<img src={user.profileImg || "/avatar-placeholder.png"} />
									</div>
									{/* </div> */}
									<div className="flex flex-col leading-tight">
										<span className="font-semibold tracking-tight truncate w-28">
											{user.fullName}
										</span>
										<span className="text-sm text-slate-500">@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
										onClick={(e) => {
											e.preventDefault();
											follow(user._id);
										}}
									>
										{isPending ? <LoadingSpinner size="sm" /> : "Follow"}
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;