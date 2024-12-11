// import { useState } from "react";
import { useState, useEffect } from "react";


import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

import RightPanel from "../../components/common/RightPanel";
import Sidebar from "../../components/common/Sidebar";
const HomePage = () => {
	const [feedType, setFeedType] = useState("forYou");
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

	return (
		<>
			<div className="flex max-w-6xl mx-auto p-0">
				<Sidebar />
			</div>
			<div className="flex-[4_4_0] mr-auto border-r border-zinc-300 min-h-screen">
				{/* Header */}
				<div className="flex w-full border-b border-slate-300">
					<div
						className="flex justify-center flex-1 p-3 hover:bg-gray-300 transition duration-300 cursor-pointer relative"
						onClick={() => setFeedType("forYou")}
					>
						For you
						{feedType === "forYou" && (
							<div className="absolute bottom-0 w-10 h-1 rounded-full bg-blue-500"></div>
						)}
					</div>
					<div
						className="flex justify-center flex-1 p-3 hover:bg-gray-300 transition duration-300 cursor-pointer relative"
						onClick={() => setFeedType("following")}
					>
						Following
						{feedType === "following" && (
							<div className="absolute bottom-0 w-10 h-1 rounded-full bg-blue-500"></div>
						)}
					</div>
				</div>

				{/* Wrapping div with alignment */}
				<div className="w-full text-left">
					{/* CREATE POST INPUT */}
					<CreatePost />

					{/* POSTS */}
					<Posts feedType={feedType} />
				</div>
			</div>
			<div className="flex max-w-6xl mx-auto p-0">
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
export default HomePage;
