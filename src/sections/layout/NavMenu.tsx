import NavLink from "@/components/NavLink";
import { Icon } from "@iconify/react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

const MenuOptions = [
  { text: "Play", icon: "streamline:chess-pawn", href: "/play" },
  { text: "Analysis", icon: "streamline:magnifying-glass-solid", href: "/" },
  {
    text: "Database",
    icon: "streamline:database",
    href: "/database",
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NavMenu({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Toolbar />
      <Box sx={{ width: 250, overflow: "hidden" }}>
        <List>
          {MenuOptions.map(({ text, icon, href }) => (
            <ListItem key={text} disablePadding sx={{ margin: 0.7 }}>
              <NavLink href={href}>
                <ListItemButton onClick={onClose}>
                  <ListItemIcon style={{ paddingLeft: "0.5em" }}>
                    <Icon icon={icon} height="1.5em" />
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </NavLink>
            </ListItem>
          ))}

          <Divider sx={{ my: 2 }} />

          {user ? (
            <ListItem disablePadding sx={{ margin: 0.7 }}>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon style={{ paddingLeft: "0.5em" }}>
                  <Icon icon="mdi:logout" height="1.5em" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          ) : (
            <>
              <ListItem disablePadding sx={{ margin: 0.7 }}>
                <NavLink href="/auth/login">
                  <ListItemButton onClick={onClose}>
                    <ListItemIcon style={{ paddingLeft: "0.5em" }}>
                      <Icon icon="mdi:login" height="1.5em" />
                    </ListItemIcon>
                    <ListItemText primary="Login" />
                  </ListItemButton>
                </NavLink>
              </ListItem>
              <ListItem disablePadding sx={{ margin: 0.7 }}>
                <NavLink href="/auth/signup">
                  <ListItemButton onClick={onClose}>
                    <ListItemIcon style={{ paddingLeft: "0.5em" }}>
                      <Icon icon="mdi:account-plus" height="1.5em" />
                    </ListItemIcon>
                    <ListItemText primary="Sign Up" />
                  </ListItemButton>
                </NavLink>
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );
}
