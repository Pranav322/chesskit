import React from 'react';
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      setError("");
      await signIn(email, password);
      router.push("/");
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/wrong-password":
            setError("Incorrect password");
            break;
          case "auth/user-not-found":
            setError("No account found with this email");
            break;
          case "auth/too-many-requests":
            setError("Too many failed attempts. Please try again later");
            break;
          case "auth/user-disabled":
            setError("This account has been disabled");
            break;
          case "auth/invalid-email":
            setError("Invalid email format");
            break;
          default:
            setError("Failed to sign in. Please try again");
            console.error("Sign In Error:", err);
        }
      } else {
        setError("An unexpected error occurred");
        console.error("Unexpected Error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!email || !password) {
      setError("All fields are required");
      return false;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setError("Invalid email address");
      return false;
    }
    return true;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      setError("");
      await signInWithGoogle();
      router.push("/");
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/popup-closed-by-user":
            setError("Sign in cancelled. Please try again");
            break;
          case "auth/popup-blocked":
            setError(
              "Pop-up blocked by browser. Please allow pop-ups for this site",
            );
            break;
          case "auth/account-exists-with-different-credential":
            setError(
              "An account already exists with the same email but different sign-in method",
            );
            break;
          default:
            setError("Failed to sign in with Google. Please try again");
            console.error("Google Sign In Error:", error);
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
        <PageTitle title="Sign In - ChessEasy" />
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
            Welcome Back
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
              onClick={handleGoogleSignIn}
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
              {isLoading ? "Signing in..." : "Continue with Google"}
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
              autoComplete="current-password"
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
            />

            <Box
              sx={{ mt: 2, mb: 2, display: "flex", justifyContent: "flex-end" }}
            >
              <Link href="/auth/reset-password" passHref>
                <MuiLink variant="body2">Forgot Password?</MuiLink>
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mt: 2,
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
                "Sign In"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Link href="/auth/signup" passHref>
                <MuiLink variant="body2">
                  Don't have an account? Sign Up
                </MuiLink>
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </AuthRoute>
  );
}
