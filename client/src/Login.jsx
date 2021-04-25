import { Box, Button } from "@material-ui/core";

const Login = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" m={8}>
      <Button
        variant="outlined"
        href="/login/google"
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
