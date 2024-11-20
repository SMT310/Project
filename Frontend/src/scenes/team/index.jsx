import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../utils/db/theme";

import { FaTrash } from "react-icons/fa";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Header from "../../components/Header";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const queryClient = useQueryClient();
  
  const { data: allUserAdmin, isLoading, error } = useQuery({
    queryKey: ["allUserAdmin"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/getAllUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: async (authUser) => {
      try {
        const res = await fetch(`/api/admin/${authUser}`, {
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
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["allUserAdmin"] });
    },
  });

  const handleDelete = (row) => {
    deleteUser(row.id);
  };

  const columns = [
    {
      field: "fullName",
      headerName: "Full Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "username",
      headerName: "Username",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "role",
      headerName: "Access Level",
      flex: 1,
      renderCell: ({ row: { role } }) => {
        return (
          <Box
            width="60%"
            display="flex"
            m="0 auto"
            mt="10px"
            p="5px"
            justifyContent="center"
            alignItems="center"
            backgroundColor={
              role === "admin"
                ? colors.greenAccent[700]
                : role === "manager"
                  ? colors.greenAccent[700]
                  : colors.greenAccent[700]
            }
            borderRadius="10px"
          >
            {role === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {role === "manager" && <SecurityOutlinedIcon />}
            {role === "user" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {role}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      renderCell: (params) => (
        <Box
          width="60%"
          display="flex"
          m="0 auto"
          mt="10px"
          p="5px"
          justifyContent="center"
          alignItems="center"
        >
          {!isDeleting && (
            <FaTrash
              style={{ cursor: "pointer", color: theme.palette.text.primary }}
              onClick={() => handleDelete(params)}
            />
          )}
          {isDeleting && <LoadingSpinner size='sm' />}
        </Box>
      ),
    }
  ];

  if (isLoading) return <LoadingSpinner size='lg' />;
  if (error) return <Typography color="error">{error.message}</Typography>;

  return (
    <Box m="20px">
      <Header title="USERS" subtitle="Managing Users" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          // checkboxSelection
          rows={allUserAdmin || []}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default Team;
