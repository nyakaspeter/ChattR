import { Box, Button } from "@mui/material";

const Login = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" m={8}>
      <Button
        variant="outlined"
        href="/auth/google"
        startIcon={
          <img
            alt="google"
            width="20"
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          ></img>
        }
      >
        Log in with Google
      </Button>
    </Box>
  );
};

export default Login;
