import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import RightPanel from "../../components/common/RightPanel";
import Sidebar from "../../components/common/Sidebar";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
// import { FaHeart } from "react-icons/fa6";
import { AiFillLike } from "react-icons/ai";
import { IoTrashBin } from "react-icons/io5";
import { BiSolidComment } from "react-icons/bi";
import { useState, useEffect } from "react";
const NotificationPage = () => {
	const queryClient = useQueryClient();
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const [showScrollButton, setShowScrollButton] = useState(false);

	// Show or hide the "Return to Top" button based on scroll position
	const checkScrollPosition = () => {
		if (window.scrollY > 300) {
			setShowScrollButton(true);
		} else {
			setShowScrollButton(false);
		}
	};
	// Add event listener for scroll
	useEffect(() => {
		window.addEventListener("scroll", checkScrollPosition);
		return () => {
			window.removeEventListener("scroll", checkScrollPosition);
		};
	}, []);
	// Scroll to top function
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/notifications");
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/notifications", {
					method: "DELETE",
				});
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully", {
				style: {
					background: "#1E90FF", // Light blue
					color: "#FFFFFF",      // White text
				},
			});
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message, {
				style: {
					background: "#B22222", // Firebrick (deep red)
					color: "#FFFFFF",      // White text for contrast
				},
			});
		},
	});

	const filteredNotifications = notifications?.filter(
		(notification) => notification.from._id !== authUser?._id
	);

	return (
		<>
			<div className='flex max-w-6xl mx-auto p-0'>
				<Sidebar />
			</div>
			<div className='flex-[4_4_0] border-l border-r border-zinc-300 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-400'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown dropdown-bottom dropdown-end'>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<a onClick={deleteNotifications}>Delete all notifications</a>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{filteredNotifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				{/* {filteredNotifications?.map((notification) => (
					<div className='border-b border-gray-300' key={notification._id}>
						<div className='flex gap-2 p-4'>
							<div className='flex-shrink-0'>
								{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
								{notification.type === "like" && <AiFillLike className='w-7 h-7 text-red-500' />}
								{notification.type === "comment" && <BiSolidComment className='w-7 h-7 text-blue-500' />}
							</div>
							<Link to={`/profile/${notification.from.username}`} className='flex items-center gap-2'>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={notification.from.profileImg || "/avatar-placeholder.png"} />
									</div>
								</div>
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification.from.username}</span>{" "}
									{notification.type === "follow" ? (
										"followed you"
									) : notification.type === "like" ? (
										"liked your post"
									) : notification.type === "comment" ? (
										"commented on your post"
									) : (
										""
									)}
								</div>
							</Link>
						</div>
					</div>
				))} */}
				{filteredNotifications?.map((notification) => (
					<div className="border-b border-gray-300" key={notification._id}>
						<div className="flex justify-between p-4">
							{/* Left Section: Notification Content */}
							<div className="flex gap-2 items-center">
								{/* Icon Section */}
								<div className="flex-shrink-0">
									{notification.type === "follow" && <FaUser className="w-7 h-7 text-primary" />}
									{notification.type === "like" && <AiFillLike className="w-7 h-7 text-red-500" />}
									{notification.type === "comment" && <BiSolidComment className="w-7 h-7 text-blue-500" />}
								</div>

								{/* Notification Message */}
								<Link to={`/profile/${notification.from.username}`} className="flex items-center gap-2">
									<div className="">
										<div className="w-8 h-8 rounded-full overflow-hidden">
											<img src={notification.from.profileImg || "/avatar-placeholder.png"} alt="User Avatar" />
										</div>
									</div>
									<div className="flex gap-1">
										<span className="font-bold">@{notification.from.username}</span>{" "}
										{notification.type === "follow" ? (
											"followed you"
										) : notification.type === "like" ? (
											"liked your post"
										) : notification.type === "comment" ? (
											"commented on your post"
										) : (
											""
										)}
									</div>
								</Link>
							</div>

							{/* Right Section: Notification Time */}
							<div className="text-sm text-gray-500 flex-shrink-0">
								{notification.createdAt
									? new Date(notification.createdAt).toLocaleString("en-US", {
										hour: "2-digit",
										minute: "2-digit",
										month: "short",
										day: "numeric",
									})
									: "Just now"}
							</div>
						</div>
					</div>
				))}

			</div>
			<div className='flex max-w-6xl mx-auto p-0'>
				<RightPanel />
			</div>
			{/* Return to top button */}
			{showScrollButton && (
				<button
					onClick={scrollToTop}
					className="fixed bottom-4 right-4 bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-400 transition"
				>
					↑
				</button>
			)}
		</>
	);
};
export default NotificationPage;