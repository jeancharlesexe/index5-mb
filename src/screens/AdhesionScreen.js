import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ITAU_ORANGE = '#EC7000';
const ITAU_BLUE = '#003399';
const BACKGROUND_GREY = '#F6F7F9';

const CustomAlert = ({ visible, title, message, onClose }) => (
    <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={[styles.modalHeader, { backgroundColor: title === 'Sucesso' ? '#4CAF50' : '#D32F2F' }]}>
                    <Ionicons
                        name={title === 'Sucesso' ? "checkmark-circle" : "alert-circle"}
                        size={40}
                        color="#fff"
                    />
                </View>
                <View style={styles.modalBody}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalMessage}>{message}</Text>
                    <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                        <Text style={styles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

const AdhesionScreen = ({ token, onBack, onJoinSuccess }) => {
    const [monthlyValue, setMonthlyValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        onCloseCallback: null
    });

    const showAlert = (title, message, onCloseCallback = null) => {
        setAlertConfig({ visible: true, title, message, onCloseCallback });
    };

    const handleJoin = async () => {
        const value = parseFloat(monthlyValue.replace(',', '.'));
        if (isNaN(value) || value < 100) {
            showAlert('Valor Mínimo', 'O valor mínimo para investimento mensal é de R$ 100,00.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5246/api/v1/clients/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    monthlyValue: value,
                }),
            });

            // Se o backend não retornar JSON ou der erro de rede
            let data;
            try {
                data = await response.json();
            } catch (e) {
                data = { message: 'Erro ao processar resposta do servidor.' };
            }

            if (response.ok) {
                setIsLoading(false);
                const backendMsg = data.message || (data.data && data.data.message) || '';

                let displayMsg = 'Sua adesão foi enviada e está aguardando aprovação do Administrador.';
                if (backendMsg.includes('Welcome back') || backendMsg.includes('reactivated')) {
                    displayMsg = 'Bem-vindo de volta! Sua adesão foi reativada com sucesso.';
                }

                showAlert('Sucesso', displayMsg, () => {
                    onJoinSuccess();
                });
            } else {
                showAlert('Não foi possível realizar a adesão', data.message || 'Verifique os dados e tente novamente.');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Join Error:', error);
            showAlert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique se a API está ativa.');
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => {
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                    if (alertConfig.onCloseCallback) {
                        alertConfig.onCloseCallback();
                    }
                }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.logoBadge}>
                        <Image
                            source={require('../../assets/icons/logo-itau.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.headerTitle}>Nova Adesão</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.welcomeText}>Bem-vindo ao Top Five!</Text>
                    <Text style={styles.description}>
                        Para começar sua jornada de investimentos, informe quanto deseja investir mensalmente.
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Valor do Aporte Mensal (R$)</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="currency-usd" size={24} color={ITAU_BLUE} />
                            <TextInput
                                style={styles.input}
                                placeholder="0,00"
                                keyboardType="numeric"
                                value={monthlyValue}
                                onChangeText={setMonthlyValue}
                                editable={!isLoading}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleJoin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>REALIZAR ADESÃO</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={isLoading}>
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_GREY,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        backgroundColor: ITAU_BLUE,
        padding: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    logoBadge: {
        width: 60,
        height: 60,
        backgroundColor: ITAU_ORANGE,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    logo: {
        width: '80%',
        height: '80%',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    formContainer: {
        flex: 1,
        padding: 30,
        marginTop: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 40,
    },
    label: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 2,
        borderBottomColor: ITAU_ORANGE,
        paddingHorizontal: 15,
        height: 60,
        borderRadius: 8,
    },
    input: {
        flex: 1,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    button: {
        backgroundColor: ITAU_ORANGE,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        alignItems: 'center',
        padding: 10,
    },
    backButtonText: {
        color: ITAU_BLUE,
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 20,
    },
    modalHeader: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBody: {
        padding: 25,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 24,
    },
    modalButton: {
        backgroundColor: ITAU_BLUE,
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 10,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AdhesionScreen;
