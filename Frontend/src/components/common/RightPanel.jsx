// import { Link } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";

// import useFollow from "../../hooks/useFollow";

// import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
// import LoadingSpinner from "./LoadingSpinner";

// const RightPanel = () => {
// 	const { data: suggestedUsers, isLoading } = useQuery({
// 		queryKey: ["suggestedUsers"],
// 		queryFn: async () => {
// 			try {
// 				const res = await fetch("/api/users/suggested");
// 				const data = await res.json();
// 				if (!res.ok) {
// 					throw new Error(data.error || "Something went wrong!");
// 				}
// 				return data;
// 			} catch (error) {
// 				throw new Error(error.message);
// 			}
// 		},
// 	});

// 	const { follow, isPending } = useFollow();

// 	if (suggestedUsers?.length === 0) return <div className='md:w-64 w-0'></div>;

// 	return (
// 		<div className='hidden lg:block my-4 mx-2'>
// 			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
// 				<p className='font-bold'>Who to follow</p>
// 				<div className='flex flex-col gap-4'>
// 					{/* item */}
// 					{isLoading && (
// 						<>
// 							<RightPanelSkeleton />
// 							<RightPanelSkeleton />
// 							<RightPanelSkeleton />
// 							<RightPanelSkeleton />
// 						</>
// 					)}
// 					{!isLoading &&
// 						suggestedUsers?.map((user) => (
// 							<Link
// 								to={`/profile/${user.username}`}
// 								className='flex items-center justify-between gap-4'
// 								key={user._id}
// 							>
// 								<div className='flex gap-2 items-center'>
// 									<div className='avatar'>
// 										<div className='w-8 rounded-full'>
// 											<img src={user.profileImg || "/avatar-placeholder.png"} />
// 										</div>
// 									</div>
// 									<div className='flex flex-col'>
// 										<span className='font-semibold tracking-tight truncate w-28'>
// 											{user.fullName}
// 										</span>
// 										<span className='text-sm text-slate-500'>@{user.username}</span>
// 									</div>
// 								</div>
// 								<div>
// 									<button
// 										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
// 										onClick={(e) => {
// 											e.preventDefault();
// 											follow(user._id);
// 										}}
// 									>
// 										{isPending ? <LoadingSpinner size='sm' /> : "Follow"}
// 									</button>
// 								</div>
// 							</Link>
// 						))}
// 				</div>
// 			</div>
// 		</div>
// 	);
// };
// export default RightPanel;

{/* 
	import { FaSearch } from "react-icons/fa";
	<label className="input input-bordered flex items-center gap-2 mb-4">
	<input type="text" className="grow" placeholder="Search" />
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 16 16"
		fill="currentColor"
		className="h-4 w-4 opacity-70">
		<path
			fillRule="evenodd"
			d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
			clipRule="evenodd" />
	</svg>
</label> */}
import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";
import { useQuery } from "@tanstack/react-query";

const RightPanel = () => {
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

	// const { follow, isPending } = useFollow();

	if (suggestedUsers?.length === 0) return <div className='md:w-64 w-0'></div>;

	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className="sticky top-2 z-20  p-4 rounded-md mb-4">
				<label className="input input-bordered flex items-center gap-2 mb-4">
					<input type="text" className="grow" placeholder="Search" />
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						className="h-4 w-4 opacity-70">
						<path
							fillRule="evenodd"
							d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
							clipRule="evenodd" />
					</svg>
				</label>
			</div>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-20'>
				<p className='font-bold text-left mb-4'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
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
								className='flex items-center justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.profileImg || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex flex-col leading-tight'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
										</span>
										<span className='text-sm text-slate-500'>@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={(e) => e.preventDefault()}
									>
										Follow
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