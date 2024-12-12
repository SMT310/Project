import { FaComments } from "react-icons/fa6";
import { AiFillLike } from "react-icons/ai";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Linkify from 'react-linkify';

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatPostDate } from "../../utils/date";


const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();
	const postOwner = post.user;
	const isLiked = post.likes.includes(authUser._id);

	const isMyPost = authUser._id === post.user._id;

	const formattedDate = formatPostDate(post.createdAt);

	const [isExpanded, setIsExpanded] = useState(false); // Track if text is expanded
	const textLimit = 150; // Set character limit for truncation
	
	const customLinkDecorator = (href, text, key) => (<a href={href} key={key} style={{ color: 'blue', textDecoration: 'underline' }}> {text} </a>);

	const { mutate: deletePost, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/admin/deletePostAdmin/${post._id}`, {
					method: "DELETE",
				});
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Post deleted successfully", {
				style: {
					background: "#1E90FF", // Light blue
					color: "#FFFFFF",      // White text
				},
			});
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	const { mutate: likePost, isPending: isLiking } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/like/${post._id}`, {
					method: "POST",
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: (updatedLikes) => {
			queryClient.setQueryData(["posts"], (oldData) => {
				return oldData.map((p) => {
					if (p._id === post._id) {
						return { ...p, likes: updatedLikes };
					}
					return p;
				});
			});
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

	const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/comment/${post._id}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text: comment }),
				});
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: (updatedComments) => {
			queryClient.setQueryData(["posts"], (oldData) => {
				return oldData.map((p) => {
					if (p._id === post._id) {
						return { ...p, comments: updatedComments };
					}
					return p;
				});
			});
			setComment("");
			document.getElementById(`comments_modal${post._id}`).close();
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

	const handleDeletePost = () => {
		deletePost();
	};

	const handlePostComment = (e) => {
		e.preventDefault();
		if (isCommenting) return;
		commentPost();
	};

	const handleLikePost = () => {
		if (isLiking) return;
		likePost();
	};

	return (
		<>
			<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
				{/* <div className='avatar'> */}
				<div className="w-10 h-10 rounded-full overflow-hidden">
					<a to={`/profile/${postOwner.username}`}>
						<img src={postOwner.profileImg || "/avatar-placeholder.png"}
							className="w-full h-full object-cover rounded-full"
							alt="User Avatar"
						/>
					</a>
				</div>
				<div className='flex flex-col flex-1'>
					<div className='flex gap-2 items-center'>
						<a to={`/profile/${postOwner.username}`} className='font-bold text-lg'>
							{postOwner.fullName}
						</a>
						<span className='text-slate-400 hover:text-sky-400 flex gap-1 text-sm'>
							<a to={`/profile/${postOwner.username}`}>@{postOwner.username}</a>
							<span> · </span>
						</span>
						<span>{formattedDate}</span>
						{/* {isMyPost && ( */}
						<span className='flex justify-end flex-1'>
							{!isDeleting && (
								<FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />
							)}
							{isDeleting && <LoadingSpinner size='sm' />}
						</span>
						{/* )} */}
					</div>
					<div className='flex flex-col gap-3 overflow-hidden text-left'>
						<p className="text-lg">
							<Linkify componentDecorator={customLinkDecorator}>
							{isExpanded || post.text.length <= textLimit ? (
								post.text
							) : (
								<>
									{post.text.slice(0, textLimit)}
									<button
										className="text-xl text-blue-500 hover:text-black ml-2"
										onClick={() => setIsExpanded(!isExpanded)}
									>
										...Show More
									</button>
								</>
							)}
							{isExpanded && post.text.length > textLimit && (
								<button
									className="text-xl text-blue-500 hover:text-black ml-2"
									onClick={() => setIsExpanded(!isExpanded)}
								>
									Show Less
								</button>
								)}
							</Linkify>
						</p>
						{/* {post.img && (
							<img
								src={post.img}
								className='h-80 object-contain rounded-lg border border-gray-700'
								alt=''
							/>
						)} */}
						{post.img && typeof post.img === 'object' && Object.values(post.img).length > 0 && (
							// <div className="flex flex-wrap gap-3">
							// 	{Object.values(post.img).map((image, index) => (
							// 		<img
							// 			key={index}
							// 			src={image}
							// 			className="w-48 h-48 object-cover rounded-lg border border-gray-700"
							// 			alt={`Post image ${index + 1}`}
							// 		/>
							// 	))}
							// </div>
							<div
								className="grid gap-3"
								style={{
									gridTemplateColumns: `repeat(${Object.values(post.img).length === 1
										? 1 // 1 image takes full width
										: Object.values(post.img).length === 2
											? 2 // 2 images each take 50% of the width
											: Object.values(post.img).length === 3
												? 3 // 3 images each take 33.33% of the width
												: 4 // 4+ images each take 25% of the width
										}, 1fr)`,
								}}
							>
								{Object.values(post.img).map((image, index) => (
									<a
										key={index}
										href={image}
										target="_blank"
										rel="noopener noreferrer"
										className="w-full h-full"
									>
										<img
											src={image}
											className="object-cover rounded-lg w-full h-full border border-gray-700"
											alt={`Post image ${index + 1}`}
											style={{
												width: "100%",
												height: "100%",
												maxWidth: Object.values(post.img).length === 1 ? "100%" : "300px", // 100% width for 1 image, 300px for others
												maxHeight: "350px", // Maximum height for each image
											}}
										/>
									</a>
								))}
							</div>
						)}
					</div>
					<div className='flex justify-between mt-3'>
						{/* Left Section with Like Icon */}
						<div className='flex items-center gap-4'>
							{/* <div className='flex gap-1 items-center cursor-pointer group' onClick={handleLikePost}>
								{isLiking && <LoadingSpinner size='sm' />}

								{!isLiked && !isLiking && (
									<AiFillLike className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}

								{isLiked && !isLiking && (
									<AiFillLike className='w-4 h-4 cursor-pointer text-pink-500' />
								)} */}

							{/* Display like count with appropriate styles */}
							{/* <span
									className={`text-sm group-hover:text-pink-500 ${
										isLiked ? "text-pink-500" : "text-slate-500"
										}`}
								>
									{post.likes.length}
								</span> */}
							{/* </div> */}
						</div>

						{/* Center Section with Comment Icon */}
						<div className='flex items-center gap-4'>
							{/* <div
								className='flex gap-1 items-center cursor-pointer group'
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
							>
								<FaComments className='w-4 h-4 text-slate-500 group-hover:text-sky-400' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
							</div> */}
						</div>

						{/* Optional Right Section for Additional Icons */}
						{/* <div className='flex items-center gap-4'> */}
						{/* Any additional icons can go here */}
						{/* <div className='flex gap-1 items-center group cursor-pointer'>
								<FaRegShareFromSquare className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
								<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
							</div> */}
						{/* </div> */}

						{/* Comments Modal */}
						<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
							<div className='modal-box rounded border border-gray-600'>
								<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
								<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
									{post.comments.length === 0 && (
										<p className='text-sm text-slate-500'>
											No comments yet 🤔 Be the first one 😉
										</p>
									)}
									{post.comments.map((comment) => (
										<div key={comment._id} className='flex gap-2 items-start'>
											<div className='avatar'>
												<div className='w-8 rounded-full'>
													<img src={comment.user.profileImg || "/avatar-placeholder.png"} />
												</div>
											</div>
											<div className='flex flex-col'>
												<div className='flex items-center gap-1'>
													<span className='font-bold'>{comment.user.fullName}</span>
													<span className='text-gray-700 text-sm'>@{comment.user.username}</span>
												</div>
												<div className='text-sm'>{comment.text}</div>
											</div>
										</div>
									))}
								</div>
								<form className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2' onSubmit={handlePostComment}>
									<textarea
										className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800'
										placeholder='Add a comment...'
										value={comment}
										onChange={(e) => setComment(e.target.value)}
									/>
									<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
										{isCommenting ? (
											<span className='loading loading-spinner loading-md'></span>
										) : (
											"Post"
										)}
									</button>
								</form>
							</div>
							<form method='dialog' className='modal-backdrop'>
								<button className='outline-none'>close</button>
							</form>
						</dialog>
					</div>
				</div>
			</div >
		</>
	);
};
export default Post;