import { FaComments } from "react-icons/fa6";
import { AiFillLike } from "react-icons/ai";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FaEdit } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";

import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";


const Post = ({ post }) => {
	const [comment, setComment] = useState("");

	const [isEditing, setIsEditing] = useState(false); // To track if editing modal is open
	const [editingComment, setEditingComment] = useState(null); // Store the comment being edited
	const [editText, setEditText] = useState(""); // For updated text
	const [editImg, setEditImg] = useState(null); // For updated image (if needed)

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const queryClient = useQueryClient();

	const postOwner = post.user;
	const isLiked = post.likes.includes(authUser._id);
	const isMyPost = authUser._id === post.user._id;
	const formattedDate = formatPostDate(post.createdAt);

	const { mutate: deletePost, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/${post._id}`, {
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
			toast.success("Post deleted successfully");
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
			toast.error(error.message);
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
			// document.getElementById(`comments_modal${post._id}`).close();
			const modal = document.getElementById(`comments_modal${post._id}`);
			if (modal) {
				modal.close();
			}
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast.success("Comment successfully!");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const { mutate: editComment, isPending: isEditingComment } = useMutation({
		mutationFn: async ({ commentId, text, img }) => {
			try {
				const res = await fetch(`/api/posts/${post._id}/comments/${commentId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text, img }),
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
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
			toast.success("Comment updated successfully!");
			setIsEditing(false); // Close modal
			setEditingComment(null); // Clear editing state
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const { mutate: deleteComment, isPending: isDeletingComment } = useMutation({
		mutationFn: async (commentId) => {
			try {
				const res = await fetch(`/api/posts/${post._id}/deleteComments/${commentId}`, {
					method: "DELETE",
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: (updatedComments) => {
			// Update the comments list without reloading the page
			queryClient.setQueryData(["posts"], (oldData) => {
				return oldData.map((p) => {
					if (p._id === post._id) {
						return { ...p, comments: updatedComments };
					}
					return p;
				});
			});
			toast.success("Comment deleted successfully");
			setComment("");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (error) => {
			toast.error(error.message);
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

	const [isExpanded, setIsExpanded] = useState(false); // Track if text is expanded
	const textLimit = 150; // Set character limit for truncation

	const handleToggleText = () => {
		setIsExpanded((prev) => !prev);
	};

	useEffect(() => {
		if (isEditing) {
			const modal = document.getElementById("edit_comment_modal");
			if (modal) {
				modal.showModal(); // Explicitly show the modal
			}
		}
	}, [isEditing]);

	const handleEditComment = (commentId, text) => {
		setEditingComment(commentId);
		setEditText(text);
		setIsEditing(true); // Opens the Edit Comment Modal
	};


	// Function to handle form submission for editing a comment
	const handleSubmitEdit = (e) => {
		e.preventDefault();
		if (isEditingComment) return;

		editComment({ commentId: editingComment, text: editText, img: editImg });
	};

	console.log("is editing:", isEditing);

	return (
		<>
			<div className='flex gap-2 items-start p-4 border-b border-gray-300'>
				{/* Avatar Section */}
				<div className="w-10 h-10 rounded-full overflow-hidden">
					<Link to={`/profile/${postOwner.username}`}>
						<img
							src={postOwner.profileImg || "/avatar-placeholder.png"}
							className="w-full h-full object-cover rounded-full"
							alt="User Avatar"
						/>
					</Link>
				</div>
				<div className='flex flex-col flex-1'>
					<div className="flex gap-2 items-center">
						<Link to={`/profile/${postOwner.username}`} className="font-bold text-lg">
							{postOwner.fullName}
						</Link>
						<div className="flex gap-1 text-sm text-slate-400">
							<Link
								to={`/profile/${postOwner.username}`}
								className="hover:text-sky-400"
							>
								@{postOwner.username}
							</Link>
							<span> · </span>
							<span className="hover:text-sky-300">{formattedDate}</span>
						</div>
						{isMyPost && (
							<span className="flex justify-end flex-1">
								{!isDeleting && (
									<FaTrash
										className="cursor-pointer hover:text-red-500"
										onClick={handleDeletePost}
									/>
								)}
								{isDeleting && <LoadingSpinner size="sm" />}
							</span>
						)}
					</div>

					<div className='flex flex-col gap-3 overflow-hidden'>
						{/* <span className="text-lg">{post.text}</span> */}
						<p className="text-lg">
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
						</p>
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
												maxHeight: "300px", // Maximum height for each image
											}}
										/>
									</a>
								))}
							</div>
						)}
					</div>
					<div className='flex justify-between items-center mt-3'>
						{/* Left Section with Like Icon */}
						<div className='flex items-center gap-4'>
							<div className='flex gap-1 items-center cursor-pointer group' onClick={handleLikePost}>
								{isLiking && <LoadingSpinner size='sm' />}

								{!isLiked && !isLiking && (
									<AiFillLike className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}

								{isLiked && !isLiking && (
									<AiFillLike className='w-4 h-4 cursor-pointer text-pink-500' />
								)}

								{/* Display like count with appropriate styles */}
								<span
									className={`text-sm group-hover:text-pink-500 ${isLiked ? "text-pink-500" : "text-slate-500"
										}`}
								>
									{post.likes.length}
								</span>
							</div>
						</div>

						{/* Center Section with Comment Icon */}
						<div className='flex items-center justify-center flex-1'>
							<div
								className='flex gap-1 items-center cursor-pointer group'
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
							>
								<FaComments className='w-4 h-4 text-slate-500 group-hover:text-sky-400' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>{post.comments.length}</span>
							</div>
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
								<div className='flex justify-between items-center'>
									<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
									<button
										className='text-gray-500 hover:text-gray-700'
										onClick={() => document.getElementById(`comments_modal${post._id}`).close()}
									>
										<FaTimes className='w-5 h-5' />
									</button>
								</div>

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
											<div className='flex flex-col flex-1 relative'>
												<div className='flex items-center gap-1'>
													<span className='font-bold'>{comment.user.fullName}</span>
													<span className='text-gray-700 text-sm'>@{comment.user.username}</span>
												</div>
												<div className='text-sm'>{comment.text}</div>
												{comment.user._id === authUser._id && (
													<div className="flex justify-end gap-2 absolute top-0 right-0">
														<FaEdit
															className="w-4 h-4 text-slate-500 cursor-pointer hover:text-yellow-500"
															onClick={() => handleEditComment(comment._id, comment.text)}
														/>
														<FaTrash
															className="w-4 h-4 text-slate-500 cursor-pointer hover:text-red-500"
															onClick={() => deleteComment(comment._id)}
														/>
													</div>
												)}
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
									<button className='btn bg-black hover:bg-[#1991DA] rounded-full btn-sm text-white px-4'>
										{isCommenting ? (
											<span className='loading loading-spinner loading-md'></span>
										) : (
											"Post"
										)}
									</button>
								</form>
							</div>

							{/* Backdrop */}
							<form method='dialog' className='modal-backdrop' onClick={() => document.getElementById(`comments_modal${post._id}`).close()}>
								<button className='outline-none'>close</button>
							</form>
						</dialog>

					</div>
				</div>
			</div >
			{/* Edit Comment Modal */}
			{isEditing && (
				<dialog id="edit_comment_modal" className="modal border-none outline-none">
					<div className="modal-box rounded border border-gray-600">
						<h3 className="font-bold text-lg mb-4">Edit Comment</h3>
						<form className="flex flex-col gap-4" onSubmit={handleSubmitEdit}>
							<textarea
								className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
								placeholder="Update your comment..."
								value={editText}
								onChange={(e) => setEditText(e.target.value)}
							/>
							<div className="flex justify-end gap-2">
								<button
									type="button"
									className="btn btn-secondary rounded-full btn-sm text-white px-4"
									onClick={() => {
										setIsEditing(false);
										setEditText("");
										setEditingComment(null);
									}}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="btn btn-primary rounded-full btn-sm text-white px-4"
								>
									{isEditingComment ? (
										<span className="loading loading-spinner loading-md"></span>
									) : (
										"Save"
									)}
								</button>
							</div>
						</form>
					</div>
					<form method="dialog" className="modal-backdrop">
						<button className="outline-none">close</button>
					</form>
				</dialog>
			)}
		</>
	);
};
export default Post;