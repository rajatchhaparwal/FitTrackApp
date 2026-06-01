import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  verifyPhoneOtp,
  resendPhoneOtp,
  clearPhoneAuthSession,
  getFirebaseAuthErrorMessage,
} from '../../services/phoneAuth';

const Otp = ({ navigation, route }) => {
  const displayPhone = route.params?.displayPhone ?? 'your phone';
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOnSubmit = async () => {
    if (otp.length < 6) {
      return;
    }

    setIsLoading(true);
    try {
      await verifyPhoneOtp(otp);
    } catch (error) {
      Alert.alert('Verification failed', getFirebaseAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendPhoneOtp();
      setTimer(30);
      setOtp('');
      Alert.alert('OTP sent', `A new code was sent to ${displayPhone}.`);
    } catch (error) {
      Alert.alert('Could not resend OTP', getFirebaseAuthErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  const handleGoBack = () => {
    clearPhoneAuthSession();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>
              {<Icon name="arrow-back" style={{ paddingTop: 10 }} size={24} color="#000" />}{' '}
              Change Number
            </Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Verification</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to {displayPhone}. Enter it below to continue.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>OTP Code</Text>
            <TextInput
              ref={inputRef}
              value={otp}
              placeholder="000000"
              placeholderTextColor="#A0A0A0"
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus={true}
              letterSpacing={10}
              style={styles.input}
            />

            <TouchableOpacity
              onPress={handleOnSubmit}
              style={[styles.button, otp.length < 6 && styles.buttonDisabled]}
              activeOpacity={0.8}
              disabled={isLoading || otp.length < 6}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Verify & Proceed</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend} disabled={isResending}>
                  {isResending ? (
                    <ActivityIndicator size="small" color="#5A8BFF" />
                  ) : (
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#000000ff',
    fontWeight: '600',
    fontSize: 18,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#717171',
    marginTop: 10,
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    height: 70,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EEE',
    paddingHorizontal: 20,
    fontSize: 28,
    color: '#000',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#5A8BFF',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5A8BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#B0C4FF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  resendText: {
    color: '#999',
    fontSize: 14,
  },
  resendLink: {
    color: '#5A8BFF',
    fontWeight: '700',
    fontSize: 14,
  },
  timerText: {
    color: '#444',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default Otp;
