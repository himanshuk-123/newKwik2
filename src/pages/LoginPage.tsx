import {
  Linking,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ToastAndroid,
  ActivityIndicator,
   ScrollView,          // ← ADD KARO
  KeyboardAvoidingView, // ← ADD KARO
  Platform,    
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import React, { useState } from "react";
import { COLORS } from "../constants/Colors";
import { HeroImg } from "../assets";
import { useAppStore } from "../store/AppStore";
import { LoginRequest } from "../types/api";
type Props = {};

const LoginPage = (_props: Props) => {
  const { loginUser, isLoading, loginMessage, loginProgress } = useAppStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const HandleNativeClick = (type: "tel" | "mail") => {
    switch (type) {
      case "tel":
        Linking.openURL("tel:0000000000");
        break;

      case "mail":
        Linking.openURL("mailto:support@kwikcheck.in");
        break;

      default:
        break;
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      ToastAndroid.show("Please enter username and password", ToastAndroid.SHORT);
      return;
    }

    try {
      const credentials: LoginRequest = {
        UserName: username,
        Pass: password,
        IMEI: 'unknown',
        Version: '6',
        IP: '',
        Location: null,
      };
      await loginUser(credentials);
      // Navigation is handled automatically by RootNavigator listening to auth state
      ToastAndroid.show("Login Successful", ToastAndroid.SHORT);
    } catch (error: any) {
      // Error handling is delegated to store's error state, but we show toast here for UX
      ToastAndroid.show(error.message || "Login failed", ToastAndroid.LONG);
    }
  };

return (
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: '#fff' }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* MAIN CONTENT */}
      <View style={styles.contentContainer}>
        
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
            <Text style={[styles.titleLarge, { color: COLORS.AppTheme.primary }]}>K</Text>
            wik
            <Text style={[styles.titleLarge, { color: COLORS.AppTheme.primary }]}>C</Text>
            heck
          </Text>
          <Text style={styles.subtitleText}>{`The raise and price of \tyour wheels`}</Text>
        </View>

        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={HeroImg} style={styles.heroImage} resizeMode="contain" />
        </View>

        {/* Username */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#6b7280" style={styles.inputIconLeft} />
          <TextInput
            style={styles.input}
            placeholder="Enter UserName"
            placeholderTextColor="#9ca3af"
            editable={!isLoading}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={20} color="#6b7280" style={styles.inputIconLeft} />
          <TextInput
            style={styles.input}
            placeholder="Enter Pass"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            editable={!isLoading}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={20}
              color="#6b7280"
              style={styles.inputIconRight}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <View style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password ?</Text>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Footer — ab neeche content ke andar hai, float nahi karega */}
        <View style={styles.footerText}>
          <Text style={[styles.footerContactText, { color: COLORS.AppTheme.primary }]}>
            For any issues contact
          </Text>
          <TouchableOpacity onPress={() => HandleNativeClick("tel")}>
            <Text style={[styles.footerContactText, { color: COLORS.textSecondary }]}>
              0000000000
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => HandleNativeClick("mail")}>
            <Text style={[styles.footerContactText, { color: COLORS.textSecondary }]}>
              support@kwikcheck.in
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>

    {/* Loading Overlay — ScrollView ke bahar rakho */}
    {isLoading && (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.AppTheme.primary} />
          <Text style={styles.loadingTitle}>Preparing your workspace</Text>
          <Text style={styles.loadingMessage}>{loginMessage || 'Please wait...'}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(8, Math.min(100, loginProgress))}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.max(0, Math.min(100, Math.round(loginProgress)))}%</Text>
        </View>
      </View>
    )}
  </KeyboardAvoidingView>
);
};

export default LoginPage;


const styles = StyleSheet.create({
scrollContent: {
  flexGrow: 1,               // ← scroll content ko stretch karne deta hai
  justifyContent: 'flex-start',
  paddingVertical: 40,
},
contentContainer: {
  width: '80%',
  alignSelf: 'center',
  gap: 16,
},
footerText: {
  alignItems: 'center',
  gap: 6,
  marginTop: 24,             // ← fixed positioning ki jagah normal flow mein
  paddingBottom: 8,
},

  titleContainer: {
    alignItems: "center",
  },
  titleText: {
    fontSize: 30,
    fontWeight: "bold",
  },
  titleLarge: {
    fontSize: 36,
  },
  subtitleText: {
    fontSize: 14,
    textTransform: "uppercase",
    fontWeight: "bold",
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  imageContainer: {
    paddingBottom: 32,
    height: 192,
    justifyContent: "center",
    alignItems: "center",
  },
  heroImage: {
    width: 300,
    height: 160,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },

  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
  },
  inputIconLeft: {
    marginRight: 8,
  },
  inputIconRight: {
    marginLeft: 8,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#000",
  },
  loginButton: {
    backgroundColor: COLORS.AppTheme.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  footerContactText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  loadingMessage: {
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.AppTheme.primary,
  },
  progressText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
});
