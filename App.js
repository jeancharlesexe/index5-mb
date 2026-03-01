import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Alert } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AdhesionScreen from './src/screens/AdhesionScreen';
import PendingApprovalScreen from './src/screens/PendingApprovalScreen';
import AccountExitedScreen from './src/screens/AccountExitedScreen';
import SupportScreen from './src/screens/SupportScreen';
import RegisterScreen from './src/screens/RegisterScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('SPLASH');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkClientStatus = async (loginResponse) => {
    setIsLoading(true);
    const token = loginResponse.data.token;

    try {
      const response = await fetch('http://localhost:5246/api/v1/clients/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      const result = await response.json();

      if (response.status === 404 && result.data?.code === 'CLIENT_NOT_FOUND') {
        setUserData({ token }); // Only token needed for adhesion
        setCurrentScreen('ADHESION');
      } else if (response.ok) {
        setUserData({ token, client: result.data });

        const status = result.data.status;
        switch (status) {
          case 'PENDING':
            setCurrentScreen('PENDING_APPROVAL');
            break;
          case 'ACTIVE':
            setCurrentScreen('DASHBOARD');
            break;
          case 'EXITED':
            setCurrentScreen('ACCOUNT_EXITED');
            break;
          default:
            setCurrentScreen('SUPPORT');
            break;
        }
      } else {
        // Tratar outros erros
        Alert.alert('Erro', result.message || 'Erro ao verificar status do cliente.');
        setCurrentScreen('LOGIN');
      }
    } catch (error) {
      console.error('Me Check Error:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível verificar seu status.');
      setCurrentScreen('LOGIN');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F6F7F9', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EC7000" />
      </View>
    );
  }

  if (currentScreen === 'SPLASH') {
    return (
      <>
        <SplashScreen onFinish={() => setCurrentScreen('LOGIN')} />
        <StatusBar style="light" />
      </>
    );
  }

  if (currentScreen === 'LOGIN') {
    return (
      <>
        <LoginScreen
          onLoginSuccess={(data) => checkClientStatus(data)}
          onGoToRegister={() => setCurrentScreen('REGISTER')}
        />
        <StatusBar style="light" />
      </>
    );
  }

  if (currentScreen === 'REGISTER') {
    return (
      <>
        <RegisterScreen
          onBack={() => setCurrentScreen('LOGIN')}
          onRegisterSuccess={() => setCurrentScreen('LOGIN')}
        />
        <StatusBar style="light" />
      </>
    );
  }

  if (currentScreen === 'ADHESION') {
    return (
      <>
        <AdhesionScreen
          token={userData.token}
          onBack={() => setCurrentScreen('LOGIN')}
          onJoinSuccess={() => checkClientStatus({ data: { token: userData.token } })}
        />
        <StatusBar style="light" />
      </>
    );
  }

  if (currentScreen === 'PENDING_APPROVAL') {
    return (
      <>
        <PendingApprovalScreen onBackToLogin={() => setCurrentScreen('LOGIN')} />
        <StatusBar style="light" />
      </>
    );
  }

  if (currentScreen === 'ACCOUNT_EXITED') {
    return (
      <>
        <AccountExitedScreen
          onRejoin={() => setCurrentScreen('ADHESION')}
          onBackToLogin={() => setCurrentScreen('LOGIN')}
        />
        <StatusBar style="light" />
      </>
    );
  }

  if (currentScreen === 'SUPPORT') {
    return (
      <>
        <SupportScreen onBackToLogin={() => setCurrentScreen('LOGIN')} />
        <StatusBar style="light" />
      </>
    );
  }
  return (
    <>
      <DashboardScreen
        token={userData.token}
        client={userData.client}
        onLogout={() => setCurrentScreen('LOGIN')}
      />
      <StatusBar style="light" />
    </>
  );
}
