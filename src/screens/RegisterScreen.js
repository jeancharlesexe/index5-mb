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
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { translateError } from '../utils/errorHelper';

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

const RegisterScreen = ({ onBack, onRegisterSuccess }) => {
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        onCloseCallback: null
    });

    const showAlert = (title, message, callback = null) => {
        setAlertConfig({ visible: true, title, message, onCloseCallback: callback });
    };

    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const validateCpf = (cpf) => {
        const cleanCpf = cpf.replace(/\D/g, '');
        return cleanCpf.length === 11;
    };

    const handleRegister = async () => {
        // Basic validations
        if (!name || !cpf || !email || !password || !birthDate) {
            showAlert('Atenção', 'Por favor, preencha todos os campos.');
            return;
        }

        if (!validateCpf(cpf)) {
            showAlert('CPF Inválido', 'O CPF deve conter 11 dígitos.');
            return;
        }

        if (!validateEmail(email)) {
            showAlert('E-mail Inválido', 'Por favor, insira um e-mail válido.');
            return;
        }

        if (password.length < 6) {
            showAlert('Senha Curta', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        // Simple BirthDate validation (expects YYYY-MM-DD for API, but let's assume user types DD/MM/YYYY)
        // Here we just check if it's potentially valid.
        const birthDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!birthDateRegex.test(birthDate)) {
            showAlert('Data Inválida', 'Use o formato DD/MM/AAAA.');
            return;
        }

        setIsLoading(true);

        const cleanCpf = cpf.replace(/\D/g, '');

        // Convert DD/MM/YYYY to YYYY-MM-DD
        const [day, month, year] = birthDate.split('/');
        const formattedBirthDate = `${year}-${month}-${day}`;

        try {
            const response = await fetch('http://localhost:5246/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    cpf: cleanCpf,
                    email,
                    password,
                    birthDate: formattedBirthDate,
                    role: 'CLIENT'
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                data = { message: 'Erro ao processar resposta do servidor.' };
            }

            if (response.ok || response.status === 201) {
                showAlert('Sucesso', 'Conta criada com sucesso! Agora você pode entrar.', () => {
                    onRegisterSuccess();
                });
            } else {
                const errorCode = data?.data?.code || data?.message;
                showAlert(
                    'Falha no Cadastro',
                    translateError(errorCode, data.message || 'Não foi possível criar sua conta.')
                );
            }
        } catch (error) {
            console.error('Register Error:', error);
            showAlert(
                'Erro de Conexão',
                translateError('NETWORK_ERROR')
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
                onClose={() => {
                    setAlertConfig({ ...alertConfig, visible: false });
                    if (alertConfig.onCloseCallback) alertConfig.onCloseCallback();
                }}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} style={styles.backArrow}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBadge}>
                                <Image
                                    source={require('../../assets/icons/logo-itau.png')}
                                    style={styles.headerLogo}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.headerTitle}>Criar Conta</Text>
                        </View>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <Text style={styles.subtext}>Preencha seus dados para começar a investir com a Itaú Corretora.</Text>

                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nome Completo</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: João Silva"
                                    value={name}
                                    onChangeText={setName}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* CPF Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>CPF</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="000.000.000-00"
                                    keyboardType="numeric"
                                    value={cpf}
                                    onChangeText={(text) => {
                                        let v = text.replace(/\D/g, '');
                                        if (v.length > 11) v = v.substring(0, 11);
                                        if (v.length >= 10) {
                                            v = v.substring(0, 3) + '.' + v.substring(3, 6) + '.' + v.substring(6, 9) + '-' + v.substring(9);
                                        } else if (v.length >= 7) {
                                            v = v.substring(0, 3) + '.' + v.substring(3, 6) + '.' + v.substring(6);
                                        } else if (v.length >= 4) {
                                            v = v.substring(0, 3) + '.' + v.substring(3);
                                        }
                                        setCpf(v);
                                    }}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>E-mail</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="seu@email.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* BirthDate Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Data de Nascimento</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="DD/MM/AAAA"
                                    keyboardType="numeric"
                                    value={birthDate}
                                    onChangeText={(text) => {
                                        // Simple auto-slash
                                        let v = text.replace(/\D/g, '');
                                        if (v.length > 8) v = v.substring(0, 8);
                                        if (v.length >= 5) {
                                            v = v.substring(0, 2) + '/' + v.substring(2, 4) + '/' + v.substring(4);
                                        } else if (v.length >= 3) {
                                            v = v.substring(0, 2) + '/' + v.substring(2);
                                        }
                                        setBirthDate(v);
                                    }}
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
                                    placeholder="Mínimo 6 caracteres"
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

                        {/* Register Button */}
                        <TouchableOpacity
                            style={[styles.registerButton, isLoading && { opacity: 0.7 }]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.registerButtonText}>CADASTRAR</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
                            <Text style={styles.cancelButtonText}>Já tenho uma conta. Entrar</Text>
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
        paddingTop: 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    backArrow: {
        marginBottom: 20,
    },
    logoContainer: {
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
        marginRight: 15,
    },
    headerLogo: {
        width: '80%',
        height: '80%',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    formContainer: {
        padding: 20,
        paddingTop: 25,
    },
    subtext: {
        fontSize: 16,
        color: '#666',
        marginBottom: 25,
        lineHeight: 22,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 55,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    registerButton: {
        backgroundColor: ITAU_ORANGE,
        height: 55,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    cancelButtonText: {
        color: ITAU_BLUE,
        fontWeight: 'bold',
        fontSize: 15,
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

export default RegisterScreen;
