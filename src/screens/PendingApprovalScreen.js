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

const PendingApprovalScreen = ({ onBackToLogin }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="clock-check-outline" size={80} color={ITAU_ORANGE} />
                    </View>

                    <Text style={styles.title}>Estamos analisando sua adesão!</Text>

                    <Text style={styles.message}>
                        Aguarde a aprovação dos nossos Gestores Financeiros para começar a investir.
                    </Text>

                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>STATUS: PENDENTE</Text>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={onBackToLogin}>
                        <Text style={styles.buttonText}>Voltar ao Login</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Branding Footer */}
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
        padding: 40,
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
        backgroundColor: '#FFF5EB',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    badge: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 40,
    },
    badgeText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 12,
    },
    button: {
        width: '100%',
        height: 55,
        borderWidth: 2,
        borderColor: ITAU_BLUE,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: ITAU_BLUE,
        fontSize: 16,
        fontWeight: 'bold',
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

export default PendingApprovalScreen;
