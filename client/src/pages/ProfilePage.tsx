import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Box,
  Alert,
  Divider,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProfile,
  updateProfileRequest,
  changePasswordRequest,
} from "../features/profile/profileApi";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { setAccessToken } from "../lib/tokenStore";
import TwoFactorSettings from "../features/twoFactor/TwoFactorSettings";

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    postcode: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | undefined>();
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Populate the form once the profile has loaded
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        phone: profile.phone || "",
        street: profile.address?.street || "",
        city: profile.address?.city || "",
        postcode: profile.address?.postcode || "",
      });
      setAvatarPreview(profile.avatar || "");
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["profile"], updatedUser);
      // Keep the navbar avatar/name in sync with the auth store too
      setUser({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const changePassword = useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: () => {
      // Backend clears the refresh cookie and invalidates sessions on change
      setAccessToken(null);
      setUser(null);
      navigate("/login");
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ ...form, avatar: avatarFile });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePassword.mutate(passwordForm);
  };

  if (isLoading)
    return <Container sx={{ py: 4 }}>Loading profile...</Container>;

  return (
    <Container sx={{ py: 4, maxWidth: "700px !important" }}>
      <Typography sx={{ variant: "h4", mb: 3 }}>My Profile</Typography>

      {/* --- Profile Info Form --- */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {updateProfile.isSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully
          </Alert>
        )}
        {updateProfile.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update profile
          </Alert>
        )}

        <Box component="form" onSubmit={handleProfileSubmit}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Avatar src={avatarPreview} sx={{ width: 80, height: 80 }}>
              {form.name.charAt(0).toUpperCase()}
            </Avatar>
            <Button component="label" variant="outlined" size="small">
              Change Avatar
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                fullWidth
                value={profile?.email ?? ""}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Street Address"
                fullWidth
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="City"
                fullWidth
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Postcode"
                fullWidth
                value={form.postcode}
                onChange={(e) => setForm({ ...form, postcode: e.target.value })}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>

      {/* --- Change Password Form --- */}
      <Paper sx={{ p: 3 }}>
        <Typography sx={{ variant: "h6", mb: 2 }}>Change Password</Typography>
        <Divider sx={{ mb: 2 }} />

        {changePassword.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(changePassword.error as any)?.response?.data?.message ||
              "Failed to change password"}
          </Alert>
        )}

        <Box component="form" onSubmit={handlePasswordSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Current Password"
                type="password"
                fullWidth
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="New Password"
                type="password"
                fullWidth
                required
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="outlined"
            color="warning"
            sx={{ mt: 3 }}
            disabled={changePassword.isPending}
          >
            {changePassword.isPending ? "Changing..." : "Change Password"}
          </Button>
          <Typography
            sx={{
              variant: "caption",
              display: "block",
              color: "text.secondary",
              mt: 1,
            }}
          >
            Changing your password will log you out of all devices.
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <TwoFactorSettings
            isEnabled={!!profile?.twoFactorEnabled}
            onStatusChange={() =>
              queryClient.invalidateQueries({ queryKey: ["profile"] })
            }
          />
        </Box>
      </Paper>
    </Container>
  );
}
