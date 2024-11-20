import { Box, Button, TextField } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Form = () => {
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    role: "user"
  });

  const queryClient = useQueryClient();
  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ email, username, fullName, password, role }) => {
      try {
        const res = await fetch("/api/admin/createAccount", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, username, fullName, password, role }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create account");
        
        console.log("New account: ", data);

        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      // Optionally, invalidate queries if you need to refresh a list of users
      // queryClient.invalidateQueries(["allUserAdmin"]);
      queryClient.invalidateQueries(["allUserAdmin"]);
			navigate("/team");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  return (
    <Box m="20px">
      <Header title="CREATE ACCOUNT" subtitle="Create a New Account" />


      <form onSubmit={handleSubmit}>
        <Box
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
          }}
        >
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Full Name"
            // onBlur={handleBlur}
            onChange={handleInputChange}
            value={formData.fullName}
            name="fullName"
            sx={{ gridColumn: "span 2" }}
          />
          <TextField
            fullWidth
            variant="filled"
            type="email"
            label="Email"
            // onBlur={handleBlur}
            onChange={handleInputChange}
            value={formData.email}
            name="email"
            // error={!!touched.email && !!errors.email}
            // helperText={touched.email && errors.email}
            sx={{ gridColumn: "span 2" }}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Username"
            onChange={handleInputChange}
            value={formData.username}
            name="username"
            sx={{ gridColumn: "span 2" }}
          />
          <TextField
            fullWidth
            variant="filled"
            type="password"
            label="Password"
            // onBlur={handleBlur}
            onChange={handleInputChange}
            value={formData.password}
            name="password"
            sx={{ gridColumn: "span 2" }}
          />
          <Box display="flex" alignItems="center" gap="20px">
            <label htmlFor="user" style={{ display: "flex", alignItems: "center" }}>
              <input
                type="radio"
                id="user"
                name="role"
                value="user"
                checked={formData.role === "user"}
                onChange={() => handleRoleChange("user")}
                style={{ width: "20px", height: "20px", marginRight: "10px" }}
              />
              User
            </label>

            <label htmlFor="admin" style={{ display: "flex", alignItems: "center" }}>
              <input
                type="radio"
                id="admin"
                name="role"
                value="admin"
                checked={formData.role === "admin"}
                onChange={() => handleRoleChange("admin")}
                style={{ width: "20px", height: "20px", marginRight: "10px" }}
              />
              Admin
            </label>
          </Box>
        </Box>
        <Box display="flex" justifyContent="end" mt="20px">
          <Button type="submit" color="secondary" variant="contained">
            {isPending ? "Loading..." : "Create New Account"}
          </Button>
        </Box>
        {isError && <p className='text-red-500'>{error.message}</p>}
      </form>
    </Box>
  );
};

export default Form;
