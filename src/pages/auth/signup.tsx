import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRouter } from "next/router";
import { FirebaseError } from "firebase/app";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link as MuiLink,
  Divider,
  CircularProgress,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import Link from "next/link";
import AuthRoute from "@/components/AuthRoute";
import { Icon } from "@iconify/react";
import { PageTitle } from "@/components/pageTitle";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setError("Invalid email address");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      setError("");
      await signUp(email, password);
      router.push("/");
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/email-already-in-use":
            setError("An account with this email already exists");
            break;
          case "auth/invalid-email":
            setError("Invalid email format");
            break;
          case "auth/operation-not-allowed":
            setError(
              "Email/password accounts are not enabled. Please contact support"
            );
            break;
          case "auth/weak-password":
            setError("Password is too weak. Please use a stronger password");
            break;
          default:
            setError("Failed to create an account. Please try again");
            console.error("Sign Up Error:", err);
        }
      } else {
        setError("An unexpected error occurred");
        console.error("Unexpected Error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      setError("");
      await signInWithGoogle();
      router.push("/");
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/popup-closed-by-user":
            setError("Sign up cancelled. Please try again");
            break;
          case "auth/popup-blocked":
            setError(
              "Pop-up blocked by browser. Please allow pop-ups for this site"
            );
            break;
          case "auth/account-exists-with-different-credential":
            setError(
              "An account already exists with the same email but different sign-in method"
            );
            break;
          default:
            setError("Failed to sign up with Google. Please try again");
            console.error("Google Sign Up Error:", error);
        }
      } else {
        setError("An unexpected error occurred");
        console.error("Unexpected Error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthRoute>
      <Container component="main" maxWidth="xs">
        <PageTitle title="Sign Up - ChessEasy" />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 3, fontWeight: 600 }}
          >
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ width: "100%", mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleSignUp}
              startIcon={<Icon icon="flat-color-icons:google" width={24} />}
              disabled={isLoading}
              sx={{
                borderColor: "#4285f4",
                color: "text.primary",
                "&:hover": {
                  borderColor: "#4285f4",
                  backgroundColor: "rgba(66, 133, 244, 0.04)",
                },
              }}
            >
              {isLoading ? "Signing up..." : "Continue with Google"}
            </Button>
          </Box>

          <Divider sx={{ width: "100%", mb: 3 }}>
            <Typography color="text.secondary">or</Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      <Icon
                        icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                        width={24}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      <Icon
                        icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"}
                        width={24}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 3,
                py: 1.5,
                position: "relative",
              }}
            >
              {isLoading ? (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                  }}
                />
              ) : (
                "Sign Up"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Link href="/auth/login" passHref>
                <MuiLink variant="body2">
                  Already have an account? Sign In
                </MuiLink>
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </AuthRoute>
  );
}
