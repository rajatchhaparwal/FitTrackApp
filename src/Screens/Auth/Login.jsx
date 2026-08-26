import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendPhoneOtp, getFirebaseAuthErrorMessage } from '../../services/phoneAuth';
import { formatPhoneE164, formatPhoneDisplay } from '../../utils/phoneNumber';

const Login = ({ navigation }) => {
  const [number, setNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOnSubmit = async () => {
    if (number.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number.');
      return;
    }

    const phoneNumber = formatPhoneE164(number);
    setIsLoading(true);

    try {
      await sendPhoneOtp(phoneNumber);
      navigation.navigate('Otp', {
        phoneNumber,
        displayPhone: formatPhoneDisplay(number),
      });
    } catch (error) {
      Alert.alert('Could not send OTP', getFirebaseAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>MyFitFly</Text>
            <Text style={styles.subtitle}>
              Enter your phone number to start your fitness journey
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneInputWrapper}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                value={number}
                placeholder="000 000 0000"
                placeholderTextColor="#A0A0A0"
                onChangeText={(text) => setNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              onPress={handleOnSubmit}
              style={[styles.button, number.length < 10 && styles.buttonDisabled]}
              activeOpacity={0.8}
              disabled={isLoading || number.length < 10}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>

          </View>

          <Text style={styles.footerText}>
            By continuing, you agree to our <Text style={styles.link}>Terms of Service</Text>
          </Text>
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
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 50,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
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
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EEE',
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#DDD',
  },
  input: {
    flex: 1,
    height: 60,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
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
  footerText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 25,
  },
  link: {
    color: '#5A8BFF',
    fontWeight: '600',
  },

});

export default Login;
