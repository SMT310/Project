import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CiImageOn } from 'react-icons/ci';
import { BsEmojiSmileFill } from 'react-icons/bs';
import { IoCloseSharp } from 'react-icons/io5';
import toast from 'react-hot-toast';

const CreatePost = () => {
	const [text, setText] = useState("");
	const [img, setImages] = useState([]); // Store multiple images
	const imgRef = useRef(null);

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();

	const { mutate: createPost, isPending, isError, error } = useMutation({
		mutationFn: async ({ text, img }) => {
			try {
				const res = await fetch("/api/posts/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text, img }), // Send images array
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
			setText("");
			setImages([]);
			toast.success("Post created successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		createPost({ text, img });
	};

	const handleImgChange = (e) => {
		const files = Array.from(e.target.files);
		const newImages = [];

		files.forEach((file) => {
			const reader = new FileReader();
			reader.onload = () => {
				newImages.push(reader.result);
				// Update state only when all images have been read
				if (newImages.length === files.length) {
					setImages((prevImages) => [...prevImages, ...newImages]);
				}
			};
			reader.readAsDataURL(file);
		});
		imgRef.current.value = null; // Reset file input to allow re-selection of the same files
	};

	const removeImage = (index) => {
		setImages((prevImages) => prevImages.filter((_, i) => i !== index));
	};

	return (
		<div className='flex p-4 items-start gap-4 border-b border-gray-700'>
			<div className='avatar'>
				<div className='w-8 rounded-full'>
					<img src={authUser.profileImg || "/avatar-placeholder.png"} />
				</div>
			</div>
			<form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
				<textarea
					className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800'
					placeholder='What is happening?!'
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>

				{/* Image gallery for multiple images */}
				{img.length > 0 && (
					<div className='flex flex-wrap gap-2'>
						{img.map((img, index) => (
							<div key={index} className='relative w-32 h-32'>
								<IoCloseSharp
									className='absolute top-1 right-1 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
									onClick={() => removeImage(index)}
								/>
								<img src={img} className='w-full h-full object-cover rounded' />
							</div>
						))}
					</div>
				)}

				<div className='flex justify-between border-t py-2 border-t-gray-700'>
					<div className='flex gap-1 items-center'>
						<CiImageOn
							className='fill-primary w-6 h-6 cursor-pointer'
							onClick={() => imgRef.current.click()}
						/>
						<BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
					</div>
					<input
						type='file'
						hidden
						ref={imgRef}
						onChange={handleImgChange}
						accept="image/*"
						multiple // Allow multiple file selection
					/>
					<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
						{isPending ? "Posting..." : "Post"}
					</button>
				</div>
				{isError && <div className='text-red-500'>{error.message}</div>}
			</form>
		</div>
	);
};

export default CreatePost;
