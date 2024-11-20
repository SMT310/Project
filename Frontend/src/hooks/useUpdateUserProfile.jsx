import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();

	const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
		mutationFn: async (formData) => {
			try {
				const res = await fetch(`/api/users/update`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
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
		// onSuccess: () => {
		// 	toast.success("Profile updated successfully");
		// 	Promise.all([
		// 		queryClient.invalidateQueries({ queryKey: ["authUser"] }),
		// 		queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
		// 	]);
		// },
		onSuccess: (updatedUser) => {
			// Update the authUser cache with the new data
			queryClient.setQueryData(["authUser"], updatedUser);

			// Optionally, you could also update localStorage here:
			localStorage.setItem("authUser", JSON.stringify(updatedUser));


			// Invalidate related queries to refetch any dependent data
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
			]);

			toast.success("Profile updated successfully");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
