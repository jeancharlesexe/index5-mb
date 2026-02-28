import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome } from '@expo/vector-icons';

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

const LoginScreen = ({ onLoginSuccess }) => {
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: ''
    });

    const showAlert = (title, message) => {
        setAlertConfig({ visible: true, title, message });
    };

    const handleLogin = async () => {
        if (!cpf || !password) {
            showAlert('Atenção', 'Por favor, preencha o CPF e a senha.');
            return;
        }

        setIsLoading(true);

        const cleanCpf = cpf.replace(/\D/g, '');

        try {
            const response = await fetch('http://localhost:5246/api/v1/auth/login/client', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cpf: cleanCpf,
                    password: password,
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
                onLoginSuccess(data);
            } else {
                showAlert(
                    'Falha no Login',
                    data.message || 'CPF ou senha incorretos. Por favor, tente novamente.'
                );
            }
        } catch (error) {
            console.error('Login Error:', error);
            showAlert(
                'Erro de Conexão',
                'Não foi possível conectar ao servidor. Verifique se a API está rodando no localhost:5246 e se o CORS está habilitado no backend.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View style={styles.logoBadge}>
                                <Image
                                    source={require('../../assets/icons/logo-itau.png')}
                                    style={styles.headerLogo}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.headerTitle}>Itaú Corretora</Text>
                                <Text style={styles.headerSubtitle}>Top Five</Text>
                            </View>
                        </View>
                    </View>

                    {/* Form Container */}
                    <View style={styles.formContainer}>
                        <Text style={styles.welcomeText}>Acesse sua Conta</Text>

                        {/* CPF Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>CPF</Text>
                            <Text style={styles.subLabel}>Cadastro de Pessoa Física</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="000.000.000-00"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={cpf}
                                    onChangeText={setCpf}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Senha</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="........"
                                    placeholderTextColor="#999"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>ENTRAR</Text>
                            )}
                        </TouchableOpacity>

                        {/* Biometry Button */}
                        <TouchableOpacity style={styles.biometryButton}>
                            <View style={styles.biometryLeft}>
                                <MaterialCommunityIcons name="fingerprint" size={36} color="#fff" />
                                <View style={styles.biometryTextRow}>
                                    <Text style={styles.biometryText}>Acessar com</Text>
                                    <Text style={[styles.biometryText, { fontWeight: 'bold' }]}>Biometria</Text>
                                </View>
                            </View>
                            <View style={styles.habilitarBadge}>
                                <Text style={styles.habilitarText}>Habilitar</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity>
                            <Text style={styles.footerText}>
                                Não tem conta? <Text style={styles.linkText}>Cadastrar</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingTop: 20,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBadge: {
        width: 45,
        height: 45,
        backgroundColor: ITAU_ORANGE,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerLogo: {
        width: '80%',
        height: '80%',
    },
    headerTextContainer: {
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#fff',
        fontSize: 12,
        opacity: 0.8,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 25,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        marginBottom: 2,
    },
    subLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 55,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        color: ITAU_BLUE,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    loginButton: {
        backgroundColor: ITAU_ORANGE,
        height: 55,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    biometryButton: {
        backgroundColor: ITAU_BLUE,
        height: 80,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    biometryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    biometryTextRow: {
        marginLeft: 15,
    },
    biometryText: {
        color: '#fff',
        fontSize: 16,
    },
    habilitarBadge: {
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    habilitarText: {
        color: ITAU_BLUE,
        fontSize: 12,
        fontWeight: 'bold',
    },
    footer: {
        paddingVertical: 30,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: '#666',
    },
    linkText: {
        color: ITAU_BLUE,
        fontWeight: 'bold',
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

export default LoginScreen;
