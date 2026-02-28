import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ITAU_ORANGE = '#EC7000';
const ITAU_BLUE = '#003399';
const BACKGROUND_GREY = '#F6F7F9';

const AccountExitedScreen = ({ onRejoin, onBackToLogin }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="account-off-outline" size={80} color="#666" />
                    </View>

                    <Text style={styles.title}>Conta Encerrada / Inativa</Text>

                    <Text style={styles.message}>
                        Sua adesão anterior foi encerrada. Caso queira voltar a investir conosco, você pode realizar uma nova adesão agora.
                    </Text>

                    <TouchableOpacity style={styles.primaryButton} onPress={onRejoin}>
                        <Text style={styles.primaryButtonText}>REALIZAR NOVA ADESÃO</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={onBackToLogin}>
                        <Text style={styles.secondaryButtonText}>Voltar ao Login</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.logoBadge}>
                    <Image
                        source={require('../../assets/icons/logo-itau.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.footerText}>Itaú Corretora</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_GREY,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 30,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    iconContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#F5F5F5',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 35,
    },
    primaryButton: {
        width: '100%',
        height: 55,
        backgroundColor: ITAU_ORANGE,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        width: '100%',
        height: 55,
        borderWidth: 1.5,
        borderColor: ITAU_BLUE,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: ITAU_BLUE,
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        padding: 40,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    logoBadge: {
        width: 30,
        height: 30,
        backgroundColor: ITAU_ORANGE,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logo: {
        width: '80%',
        height: '80%',
    },
    footerText: {
        color: ITAU_BLUE,
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default AccountExitedScreen;
