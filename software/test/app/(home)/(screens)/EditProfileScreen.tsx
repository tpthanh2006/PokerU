import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { InputField } from '../../../components/ui/InputField';
import { KeyboardAwareView } from '../../../components/ui/KeyboardAwareView';
import GradientButton from '../../../components/ui/GradientButton';
import { api } from '../../../services/api';

export default function EditProfileScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update username if changed
      if (username !== user?.username) {
        await user?.update({
          username: username,
        });
      }

      // Update email if changed
      if (email !== user?.primaryEmailAddress?.emailAddress) {
        await user?.createEmailAddress({ email });
      }

      // Always sync with backend after any Clerk updates
      const token = await getToken();
      if (token) {
        await api.post('users/sync_profile/', {
          clerk_data: {
            id: user?.id,
            username: username,
            email: email,
            profile_image_url: user?.imageUrl
          }
        });
      }

      // Update password if provided
      if (newPassword && confirmPassword) {
        if (!currentPassword) {
          setError('Current password is required to change password');
          setLoading(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        try {
          await user?.updatePassword({
            currentPassword,
            newPassword,
          });
        } catch (err: any) {
          if (err.errors?.[0]?.code === 'form_password_incorrect') {
            setError('Current password is incorrect');
          } else {
            throw err;
          }
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      router.back();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.errors?.[0]?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaType: 'image',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setLoading(true);
        setError(null);
        try {
          // Log the user state
          console.log('User state:', {
            id: user?.id,
            username: user?.username,
            imageUrl: user?.imageUrl
          });

          const localUri = result.assets[0].uri;
          const filename = localUri.split('/').pop() || 'profile.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          const file = {
            uri: localUri,
            type,
            name: filename,
          };

          // Get token for both operations
          const token = await getToken();
          console.log('Token available:', !!token);

          // Upload with explicit session handling
          await user?.setProfileImage({
            file,
            uploadType: 'data_url'
          });

          // Wait a moment for Clerk to process
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Force reload the user
          await user?.reload();

          // Sync with backend using the same token
          if (token) {
            await api.post('users/sync_profile/', {
              clerk_data: {
                id: user?.id,
                username: user?.username,
                email: user?.primaryEmailAddress?.emailAddress,
                profile_image_url: user?.imageUrl
              }
            });
          }
          
          setLoading(false);
        } catch (uploadError: any) {
          console.error('Full upload error:', uploadError);
          
          // Check if we can get user details
          console.log('User state after error:', {
            id: user?.id,
            username: user?.username,
            imageUrl: user?.imageUrl,
            hasToken: Boolean(await getToken())
          });

          setError(uploadError.message || 'Failed to upload image');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Image picker error:', err);
      setError('Failed to select image');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9702E7', '#E14949']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAwareView>
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={handleImagePick}
          >
            <Image
              source={{ uri: user?.imageUrl }}
              style={styles.profileImage}
            />
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <InputField
              label="Username"
              placeholder="Enter username"
              value={username}
              onChange={setUsername}
              returnKeyType="next"
            />
            <InputField
              label="Email"
              placeholder="Enter email"
              value={email}
              onChange={setEmail}
              returnKeyType="next"
            />
            <InputField
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              type="password"
              returnKeyType="next"
            />
            <InputField
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={setNewPassword}
              type="password"
              returnKeyType="next"
            />
            <InputField
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              type="password"
              returnKeyType="done"
            />

            <GradientButton
              text={loading ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              style={styles.saveButton}
            />
          </View>
        </View>
      </KeyboardAwareView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0325',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#BB86FC',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1a0325',
  },
  form: {
    gap: 16,
  },
  saveButton: {
    marginTop: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
}); 