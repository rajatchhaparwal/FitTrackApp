import {StyleSheet,
         Text, 
         TextInput,
         TouchableOpacity, 
         View ,
         KeyboardAvoidingView, Platform,} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Otp = ({navigation,setIsLogged}) => {
  const [otp,setOtp] = useState("")
    const handleOnsubmit =()=>{
        setIsLogged(true);
        navigation.navigate('MainApp');
      }
  return (
   <SafeAreaView style={styles.container}>
         <KeyboardAvoidingView 
           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
           style={styles.content}
         >
           <View style={styles.headerContainer}>
             <Text style={styles.subtitle}>Enter 6 Digit Otp Sent To Your Phone Number</Text>
           </View>
   
           <View style={styles.inputContainer}>
             <Text style={styles.label}>Enter Otp</Text>
             <TextInput 
               value={otp}
               placeholder='123456'
               placeholderTextColor="#999"
               onChangeText={setOtp}
               keyboardType="phone-pad"
               style={styles.input}
             />
             
             <TouchableOpacity 
               onPress={handleOnsubmit} 
               style={styles.button}
               activeOpacity={0.8}
             >
               <Text style={styles.buttonText}>Submit</Text>
             </TouchableOpacity>
           </View>
         </KeyboardAvoidingView>
       </SafeAreaView>
  );
}

export default Otp


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 55,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5a8bffff',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});