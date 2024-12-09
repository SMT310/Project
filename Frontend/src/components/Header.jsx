import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../utils/db/theme";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box mb="30px">
      <Typography
        variant="h1"
        color={colors.grey[900]}
        fontWeight="bold"
        // sx={{ m: "0 0 5px 0" }}
        sx={{
          m: "0 0 5px 0",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)", // Shadow for depth
          color: colors.grey[800], // Adjust color for deeper tone
        }}
      >
        {title}
      </Typography>
      <Typography variant="h3"
        sx={{
          color: colors.grey[700],
          textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)", // Subtle shadow for subtitle
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
