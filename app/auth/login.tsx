import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { getGoogleAuthToken, decodeToken, GoogleUserData, GOOGLE_CLIENT_ID } from '@/src/api/googleAuth';

export default function LoginScreen() {
  const { 
    login, register, isLoading, error, clearError, requestPasswordReset, resetPassword, loginWithGoogle,
    isForgotPassword, setIsForgotPassword,
    forgotPasswordStep, setForgotPasswordStep,
    forgotEmail, setForgotEmail,
    resetCode, setResetCode,
    newPassword, setNewPassword,
    confirmNewPassword, setConfirmNewPassword,
    resetForgotPasswordForm
  } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showGoogleCompleteModal, setShowGoogleCompleteModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<GoogleUserData | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleLastName, setGoogleLastName] = useState('');
  const [googleCelular, setGoogleCelular] = useState('');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [registerName, setRegisterName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerCelular, setRegisterCelular] = useState('');

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert('Campos requeridos', 'Por favor completa email y contraseña');
      return;
    }

    try {
      clearError();
      await login({
        email: loginEmail,
        password: loginPassword,
      });
      // If successful, do nothing - navigation will happen automatically
    } catch (err: any) {
      console.log('Login error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error al iniciar sesión';
      Alert.alert('Error de login', errorMessage);
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerLastName || !registerEmail || !registerPassword || !registerCelular) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (registerPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      clearError();
      await register({
        name: registerName,
        last_name: registerLastName,
        email: registerEmail,
        password: registerPassword,
        celular: parseInt(registerCelular),
      });
      // If successful, the user is automatically logged in by the authService
      // Navigation will happen automatically in AuthContext
      Alert.alert('Éxito', 'Cuenta creada correctamente');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al registrar';
      Alert.alert('Error de registro', errorMessage);
    }
  };

  const handleRequestPasswordReset = async () => {
    console.log('[FRONTEND] handleRequestPasswordReset called with email:', forgotEmail);
    if (!forgotEmail) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu correo electrónico');
      return;
    }

    try {
      clearError();
      console.log('[FRONTEND] Calling requestPasswordReset API...');
      await requestPasswordReset(forgotEmail);
      console.log('[FRONTEND] requestPasswordReset success');
      console.log('[FRONTEND] Setting forgotPasswordStep to reset BEFORE alert');
      setForgotPasswordStep('reset');
      console.log('[FRONTEND] forgotPasswordStep updated to reset');
      Alert.alert('Éxito', 'Se ha enviado un código de reset a tu correo. Por favor verifica tu bandeja de entrada.');
      console.log('[FRONTEND] Alert shown');
    } catch (err: any) {
      console.log('[FRONTEND ERROR] requestPasswordReset failed:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error al solicitar reset';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleResetPassword = async () => {
    console.log('[FRONTEND] handleResetPassword called with email:', forgotEmail, 'code:', resetCode);
    if (!resetCode || !newPassword || !confirmNewPassword) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      clearError();
      console.log('[FRONTEND] Calling resetPassword API...');
      await resetPassword(forgotEmail, resetCode, newPassword);
      console.log('[FRONTEND] resetPassword success');
      Alert.alert('Éxito', 'Tu contraseña ha sido actualizada correctamente');
      resetForgotPasswordForm();
      console.log('[FRONTEND] Form reset');
    } catch (err: any) {
      console.log('[FRONTEND ERROR] resetPassword failed:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error al resetear contraseña';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('🔵 Iniciando Google Auth...');
      const token = await getGoogleAuthToken();

      if (!token) {
        console.error('❌ No token received');
        Alert.alert('Error', 'No se pudo obtener el token de Google');
        return;
      }

      // Decodificar el token para obtener datos del usuario
      const userData = decodeToken(token);
      
      if (!userData) {
        Alert.alert('Error', 'No se pudo decodificar el token de Google');
        return;
      }

      console.log('✅ Datos de Google:', userData.email);

      // Llamar al backend para verificar si el usuario existe
      try {
        clearError();
        console.log('🔍 Verificando si el usuario existe en la BD...');
        
        const response = await loginWithGoogle({
          email: userData.email,
          googleToken: token,
          googleId: userData.sub,
        });

        console.log('✅ Login con Google exitoso');
        // Si llegamos aquí, el usuario ya existe y está autenticado
      } catch (err: any) {
        console.log('❌ Error capturado:', err.response?.status, err.response?.data?.code);
        
        // Si el error es 404 (usuario no existe), mostrar modal para completar datos
        if (err.response?.status === 404 || err.response?.data?.code === 'USER_NOT_FOUND') {
          console.log('⚠️ Usuario no existe - Pidiendo datos adicionales');
          clearError(); // Limpiar error antes de mostrar modal
          setGoogleUserData(userData);
          setGoogleToken(token);
          console.log('📋 Sobre de setting modal a true - userData:', userData.email);
          setShowGoogleCompleteModal(true);
          console.log('📋 Modal state set to true');
        } else {
          const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error al iniciar sesión con Google';
          console.error('❌ Error en Google Login:', errorMessage);
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (err: any) {
      console.error('❌ Error en Google Login:', err);
      const errorMessage = err.message || 'Error al iniciar sesión con Google';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleGoogleLoginError = () => {
    Alert.alert('Error', 'Error al conectar con Google');
  };

  const handleGoogleCompleteRegistration = async () => {
    if (!googleUserData || !googleToken) return;

    if (!googleLastName || !googleCelular) {
      Alert.alert('Campos requeridos', 'Por favor completa apellido y teléfono');
      return;
    }

    try {
      clearError();
      console.log('📝 Completando registro de Google...');

      // Llamar al endpoint para crear usuario con Google
      await loginWithGoogle({
        email: googleUserData.email,
        name: googleUserData.given_name,
        last_name: googleLastName,
        celular: parseInt(googleCelular),
        googleId: googleUserData.sub,
        googleToken: googleToken,
      });

      console.log('✅ Registro con Google completado');
      setShowGoogleCompleteModal(false);
      setGoogleLastName('');
      setGoogleCelular('');
      setGoogleToken(null);
      setGoogleUserData(null);
      
      Alert.alert('Éxito', 'Tu cuenta ha sido creada con Google');
    } catch (err: any) {
      console.error('❌ Error completando registro:', err);
      const errorMessage = err.response?.data?.error || 'Error al crear la cuenta';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Turisteando</Text>
            <Text style={styles.subtitle}>
              {isForgotPassword ? 'Recuperar contraseña' : isRegistering ? 'Crear nueva cuenta' : 'Bienvenido'}
            </Text>
          </View>

        {isForgotPassword ? (
          // Forgot Password Form
          <View style={styles.form}>
            {forgotPasswordStep === 'email' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    editable={!isLoading}
                  />
                </View>

                <Text style={styles.infoText}>
                  Te enviaremos un código de recuperación a tu correo electrónico
                </Text>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleRequestPasswordReset}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Enviar código</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Código de recuperación</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="000000"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    value={resetCode}
                    onChangeText={setResetCode}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nueva contraseña</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar contraseña</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    editable={!isLoading}
                  />
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Actualizar contraseña</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={() => {
              resetForgotPasswordForm();
            }}>
              <Text style={styles.linkText}>
                <Text style={styles.linkBold}>← Volver al login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : !isRegistering ? (
          // Login Form
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={loginEmail}
                onChangeText={setLoginEmail}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                secureTextEntry
                value={loginPassword}
                onChangeText={setLoginPassword}
                editable={!isLoading}
              />
            </View>

            {error && !showGoogleCompleteModal && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setIsForgotPassword(true);
              setForgotPasswordStep('email');
            }}>
              <Text style={styles.linkText}>
                ¿Olvidaste tu contraseña? <Text style={styles.linkBold}>Recupérala aquí</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={isLoading}>
              <Text style={styles.googleButtonText}>📧 Loguearse con Google</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
            </View>

            <TouchableOpacity onPress={() => setIsRegistering(true)}>
              <Text style={styles.linkText}>
                ¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate aquí</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Register Form
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor="#999"
                value={registerName}
                onChangeText={setRegisterName}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu apellido"
                placeholderTextColor="#999"
                value={registerLastName}
                onChangeText={setRegisterLastName}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={registerEmail}
                onChangeText={setRegisterEmail}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="1234567890"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={registerCelular}
                onChangeText={setRegisterCelular}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                secureTextEntry
                value={registerPassword}
                onChangeText={setRegisterPassword}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                secureTextEntry
                value={registerConfirmPassword}
                onChangeText={setRegisterConfirmPassword}
                editable={!isLoading}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsRegistering(false)}>
              <Text style={styles.linkText}>
                ¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal personalizado para completar datos de Google */}
      {showGoogleCompleteModal && (
        <TouchableOpacity 
          style={styles.googleModalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowGoogleCompleteModal(false);
            setGoogleUserData(null);
            setGoogleToken(null);
            setGoogleLastName('');
            setGoogleCelular('');
          }}
        >
          <View style={styles.googleModalContent}>
            <Text style={styles.modalTitle}>Completa tu perfil</Text>
            <Text style={styles.modalSubtitle}>
              Primera vez con {googleUserData?.email}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre (automático)</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={googleUserData?.given_name || ''}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu apellido"
                placeholderTextColor="#999"
                value={googleLastName}
                onChangeText={setGoogleLastName}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="1234567890"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={googleCelular}
                onChangeText={setGoogleCelular}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleCompleteRegistration}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Completar Registro</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setShowGoogleCompleteModal(false);
              setGoogleUserData(null);
              setGoogleToken(null);
              setGoogleLastName('');
              setGoogleCelular('');
            }}>
              <Text style={styles.linkText}>
                <Text style={styles.linkBold}>Cancelar</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#28A745',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  disabledInput: {
    backgroundColor: '#e8e8e8',
    color: '#999',
  },
  button: {
    backgroundColor: '#28A745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 12,
    marginTop: -8,
  },
  infoText: {
    color: '#666',
    fontSize: 13,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
  },
  linkText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  linkBold: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
  // Modal styles - Custom implementation for React Native Web
  googleModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    zIndex: 9999,
    paddingHorizontal: 0,
  },
  googleModalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '80%',
    minHeight: 300,
    zIndex: 10000,
    overflow: 'auto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
});
