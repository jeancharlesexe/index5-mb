import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    Platform,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput
} from 'react-native';
import { Svg, G, Circle } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const ITAU_ORANGE = '#EC7000';
const ITAU_BLUE = '#003399';
const CHART_COLORS = [ITAU_BLUE, ITAU_ORANGE, '#333333', '#888888', '#BDC3C7'];
const BACKGROUND_GREY = '#F0F2F5';
const CARD_WHITE = '#FFFFFF';
const TEXT_DARK = '#333333';
const TEXT_GREY = '#666666';
const SUCCESS_GREEN = '#2E7D32';

const { width } = Dimensions.get('window');

const DonutChart = ({ data }) => {
    const size = 120;
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let totalPercentage = 0;

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${center}, ${center}`}>
                    {/* Background Circle */}
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="#EEE"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {data.map((item, index) => {
                        const strokeDashoffset = circumference - (item.portfolioComposition / 100) * circumference;
                        const rotation = (totalPercentage / 100) * 360;
                        totalPercentage += item.portfolioComposition;

                        return (
                            <Circle
                                key={index}
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                                transform={`rotate(${rotation}, ${center}, ${center})`}
                            />
                        );
                    })}
                </G>
            </Svg>
            <View style={styles.chartInnerLabel}>
                <Text style={styles.chartPercentLabel}>{Math.round(totalPercentage)}%</Text>
            </View>
        </View>
    );
};

const DashboardScreen = ({ token, client, onLogout }) => {
    const [portfolio, setPortfolio] = useState(null);
    const [engineStatus, setEngineStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');

    // New states for Monthly Value Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [currentMonthlyValue, setCurrentMonthlyValue] = useState(client?.monthlyValue || 0);
    const [newMonthlyValue, setNewMonthlyValue] = useState(client?.monthlyValue?.toString() || '');

    // Custom Alert State (avoid window.alert on React Native Web)
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', buttons: [] });

    const showAlert = (title, message, buttons) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            buttons: buttons || [{ text: 'OK', onPress: () => hideAlert() }]
        });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    const fetchPortfolio = async () => {
        try {
            const response = await fetch(`http://localhost:5246/api/v1/clients/${client.clientId}/portfolio`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (response.ok) {
                setPortfolio(result.data);
            } else {
                showAlert('Erro', 'Não foi possível carregar sua carteira.');
            }
        } catch (error) {
            console.error('Portfolio Fetch Error:', error);
            showAlert('Erro de Conexão', 'Falha ao conectar ao servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEngineStatus = async () => {
        try {
            const response = await fetch(`http://localhost:5246/api/v1/engine/status`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (response.ok) {
                setEngineStatus(result.data);
            }
        } catch (error) {
            console.error('Engine Status Fetch Error:', error);
        }
    };

    useEffect(() => {
        fetchPortfolio();
        fetchEngineStatus();
    }, []);

    const handleUpdateMonthlyValue = async () => {
        const val = parseFloat(newMonthlyValue);
        if (isNaN(val) || val < 100) {
            showAlert('Erro', 'O valor mínimo é R$ 100,00');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5246/api/v1/clients/${client.clientId}/monthly-value`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newMonthlyValue: val })
            });
            const result = await response.json();
            if (response.ok) {
                setCurrentMonthlyValue(val);
                setNewMonthlyValue(val.toString());
                setModalVisible(false);
                showAlert('Sucesso', 'Valor mensal atualizado com sucesso!');
            } else {
                showAlert('Erro', result.message || 'Erro ao atualizar.');
            }
        } catch (error) {
            showAlert('Erro', 'Falha na conexão ao servidor.');
        }
    };

    const handleExit = () => {
        showAlert(
            'Sair do Produto',
            'Deseja cancelar adesão? Suas ações atuais continuarão na sua custódia.',
            [
                { text: 'Voltar', style: 'cancel', onPress: hideAlert },
                {
                    text: 'Confirmar Saída',
                    style: 'destructive',
                    onPress: async () => {
                        hideAlert();
                        setProcessingMessage('Processando saída do plano...');
                        setIsProcessing(true);
                        try {
                            const response = await fetch(`http://localhost:5246/api/v1/clients/${client.clientId}/exit`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            setIsProcessing(false);
                            if (response.ok) {
                                showAlert('Sucesso', 'Você cancelou o produto. Redirecionando para o início...', [
                                    { text: 'OK', onPress: () => { hideAlert(); if (onLogout) onLogout(); } }
                                ]);
                            } else {
                                showAlert('Erro', 'Erro ao sair.');
                            }
                        } catch (error) {
                            setIsProcessing(false);
                            showAlert('Erro', 'Falha na conexão.');
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={ITAU_ORANGE} />
                <Text style={{ marginTop: 10, color: ITAU_BLUE, fontWeight: '500' }}>Carregando sua carteira...</Text>
            </View>
        );
    }

    const summary = portfolio?.summary || { totalInvested: 0, currentPortfolioValue: 0, profitabilityPercentage: 0, totalPL: 0 };
    const assets = portfolio?.assets || [];

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoBadge}>
                        <Image
                            source={require('../../assets/icons/logo-itau.png')}
                            style={styles.headerLogo}
                            resizeMode="contain"
                        />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Itaú Corretora</Text>
                        <Text style={styles.headerSubtitle}>Conta: {portfolio?.graphicAccount || 'FLH-000000'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notificationBtn}>
                    <Ionicons name="notifications-outline" size={24} color="#fff" />
                    <View style={styles.notificationDot} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Visão Geral do Plano */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Visão Geral do Plano</Text>
                    <Text style={styles.planName}>Investidor: {client.name}</Text>

                    <View style={[styles.valueContainer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                        <View>
                            <Text style={styles.valueLabel}>Valor Atual da Posição</Text>
                            <View style={styles.amountRow}>
                                <Text style={styles.currency}>R$</Text>
                                <Text style={styles.amount}>
                                    {summary.currentPortfolioValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end', backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8 }}>
                            <Text style={styles.valueLabel}>Valor Investido: R$ {summary.totalInvested?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Ionicons name={summary.totalPL >= 0 ? "trending-up" : "trending-down"} size={16} color={summary.totalPL >= 0 ? SUCCESS_GREEN : '#D32F2F'} />
                                <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4, color: summary.totalPL >= 0 ? SUCCESS_GREEN : '#D32F2F' }}>
                                    {summary.totalPL >= 0 ? '+' : '-'} R$ {Math.abs(summary.totalPL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({summary.profitabilityPercentage > 0 ? '+' : ''}{summary.profitabilityPercentage?.toFixed(2)}%)
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>Aporte Mensal: <Text style={styles.infoValueBold}>R$ {currentMonthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text></Text>
                            <Text style={styles.infoLabel}>Data de Início: <Text style={styles.infoValue}>{new Date(client.joinDate).toLocaleDateString('pt-BR')}</Text></Text>
                        </View>
                        <View style={styles.motorContainer}>
                            <Text style={styles.motorLabel}>Motor de Compra</Text>
                            <Text style={{ fontSize: 10, color: TEXT_GREY, marginBottom: 4 }}>
                                Próxima: {engineStatus ? new Date(engineStatus.nextPurchaseDate).toLocaleDateString('pt-BR') : '--/--/----'}
                            </Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${engineStatus?.progressPercentage || 0}%` }]} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Composição do Meu Plano - Enhanced with Real Chart */}
                <View style={styles.card}>
                    <Text style={[styles.cardTitle, { marginBottom: 20 }]}>Composição do Meu Plano</Text>
                    <View style={styles.chartCardContent}>
                        <DonutChart data={assets} />
                        <View style={styles.legendContainer}>
                            {assets.map((asset, index) => (
                                <View key={index} style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }]} />
                                    <Text style={styles.legendText}>
                                        {asset.ticker}: <Text style={{ fontWeight: 'bold' }}>{asset.portfolioComposition}%</Text>
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Minha Custódia */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Minha Custódia "Top Five"</Text>

                    {assets.length > 0 ? assets.map((item, index) => (
                        <View key={index} style={[styles.assetItem, index !== assets.length - 1 && styles.assetBottomLine]}>
                            <View style={styles.assetRowHeader}>
                                <View style={[styles.assetIndicator, { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }]} />
                                <Text style={styles.assetTicker}>{item.ticker}</Text>
                            </View>
                            <View style={styles.assetMetricsDetail}>
                                <View>
                                    <Text style={styles.assetMetricText}>{item.quantity} cotas | PM R$ {item.averagePrice.toFixed(2)}</Text>
                                    <Text style={styles.assetValueFinal}>R$ {item.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 11, color: TEXT_GREY }}>Lucro (P/L)</Text>
                                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: item.pl >= 0 ? SUCCESS_GREEN : '#D32F2F' }}>
                                        {item.pl >= 0 ? '+' : '-'} R$ {Math.abs(item.pl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({item.plPercentage > 0 ? '+' : ''}{item.plPercentage?.toFixed(2)}%)
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )) : (
                        <Text style={{ color: TEXT_GREY }}>Nenhum ativo na carteira ainda.</Text>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={24} color={ITAU_BLUE} />
                    <Text style={[styles.navText, { color: ITAU_BLUE }]}>Início</Text>
                    <View style={styles.activeIndicator} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="bar-chart-outline" size={24} color={TEXT_GREY} />
                    <Text style={styles.navText}>Investimentos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add-circle-outline" size={24} color={TEXT_GREY} />
                    <Text style={styles.navText}>Aporte</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={handleExit}>
                    <Ionicons name="log-out-outline" size={24} color={TEXT_GREY} />
                    <Text style={styles.navText}>Sair</Text>
                </TouchableOpacity>
            </View>

            {/* Modal Alterar Valor Mensal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Alterar Aporte Mensal</Text>
                        <Text style={styles.modalDesc}>O novo valor será considerado na sua próxima data de compras (dia 5, 15 ou 25).</Text>

                        <Text style={styles.modalLabel}>Novo Valor (R$)</Text>
                        <TextInput
                            style={styles.modalInput}
                            keyboardType="numeric"
                            value={newMonthlyValue}
                            onChangeText={setNewMonthlyValue}
                            placeholder="Mínimo R$ 100,00"
                        />

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalBtnTextCancel}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnSave} onPress={handleUpdateMonthlyValue}>
                                <Text style={styles.modalBtnTextSave}>Atualizar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de Alerta Customizado (Substitui window.alert Web) */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={alertConfig.visible}
                onRequestClose={hideAlert}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{alertConfig.title}</Text>
                        <Text style={[styles.modalDesc, { marginBottom: 24, paddingHorizontal: 10 }]}>{alertConfig.message}</Text>
                        <View style={styles.modalButtonRow}>
                            {alertConfig.buttons.map((btn, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        btn.style === 'cancel' ? styles.modalBtnCancel : styles.modalBtnSave,
                                        btn.style === 'destructive' && { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
                                        { marginHorizontal: 5, flex: 1, paddingVertical: 14 }
                                    ]}
                                    onPress={btn.onPress || hideAlert}
                                >
                                    <Text style={[
                                        btn.style === 'cancel' ? styles.modalBtnTextCancel : styles.modalBtnTextSave,
                                        btn.style === 'destructive' && { color: '#FFF' },
                                        { textAlign: 'center' }
                                    ]}>
                                        {btn.text}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Processing Overlay for Background Actions like Exit */}
            {isProcessing && (
                <View style={styles.processingOverlay}>
                    <View style={styles.processingBox}>
                        <ActivityIndicator size="large" color={ITAU_ORANGE} />
                        <Text style={styles.processingText}>{processingMessage}</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_GREY,
    },
    header: {
        backgroundColor: ITAU_BLUE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingTop: Platform.OS === 'android' ? 40 : 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBadge: {
        width: 38,
        height: 38,
        backgroundColor: ITAU_ORANGE,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerLogo: {
        width: '80%',
        height: '80%',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#fff',
        fontSize: 11,
        opacity: 0.8,
    },
    notificationBtn: {
        padding: 5,
    },
    notificationDot: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 10,
        height: 10,
        backgroundColor: ITAU_ORANGE,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: ITAU_BLUE,
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: CARD_WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: TEXT_DARK,
        marginBottom: 4,
    },
    planName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: ITAU_BLUE,
        marginBottom: 15,
    },
    valueLabel: {
        fontSize: 12,
        color: TEXT_GREY,
        marginBottom: 2,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 20,
        fontWeight: 'bold',
        color: ITAU_ORANGE,
        marginRight: 5,
    },
    amount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: ITAU_ORANGE,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 15,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoCol: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: TEXT_GREY,
        marginBottom: 4,
    },
    infoValueBold: {
        fontWeight: 'bold',
        color: TEXT_DARK,
    },
    motorContainer: {
        alignItems: 'flex-end',
        width: 120,
    },
    motorLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: TEXT_DARK,
        marginBottom: 5,
    },
    progressBarBg: {
        width: '100%',
        height: 6,
        backgroundColor: '#EEE',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: ITAU_ORANGE,
    },
    chartCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    legendContainer: {
        flex: 1,
        paddingLeft: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 13,
        color: TEXT_DARK,
    },
    chartInnerLabel: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartPercentLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ITAU_BLUE,
    },
    assetItem: {
        paddingVertical: 12,
    },
    assetBottomLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    assetRowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    assetIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    assetTicker: {
        fontSize: 14,
        fontWeight: 'bold',
        color: TEXT_DARK,
    },
    assetMetricsDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    assetMetricText: {
        fontSize: 12,
        color: TEXT_GREY,
    },
    assetValueFinal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: TEXT_DARK,
    },
    assetLine: {
        fontSize: 11,
        color: TEXT_DARK,
        lineHeight: 18,
    },
    assetDetails: {
        color: TEXT_GREY,
    },
    assetValue: {
        fontWeight: 'bold',
        color: TEXT_DARK,
    },
    assetItem: {
        marginBottom: 8,
    },
    chartSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    donutPlaceholder: {
        width: 60,
        height: 60,
        marginRight: 15,
    },
    donutRing: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 8,
        borderColor: '#EEE',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    donutSegment: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    donutInner: {
        width: 44,
        height: 44,
        backgroundColor: '#fff',
        borderRadius: 22,
    },
    chartTextContainer: {
        flex: 1,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: TEXT_DARK,
    },
    chartAssets: {
        fontSize: 13,
        color: TEXT_GREY,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        width: width,
        height: 70,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingBottom: 10,
    },
    navItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navText: {
        fontSize: 10,
        marginTop: 4,
        color: TEXT_GREY,
    },
    activeIndicator: {
        position: 'absolute',
        top: 0,
        width: '60%',
        height: 3,
        backgroundColor: ITAU_ORANGE,
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: width * 0.85,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ITAU_BLUE,
        marginBottom: 8
    },
    modalDesc: {
        fontSize: 13,
        color: TEXT_GREY,
        textAlign: 'center',
        marginBottom: 20
    },
    modalLabel: {
        alignSelf: 'flex-start',
        fontSize: 12,
        fontWeight: 'bold',
        color: TEXT_DARK,
        marginBottom: 6
    },
    modalInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        color: TEXT_DARK
    },
    modalButtonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    modalBtnCancel: {
        flex: 1,
        borderWidth: 1,
        borderColor: ITAU_BLUE,
        borderRadius: 8,
        padding: 12,
        marginRight: 10,
        alignItems: 'center'
    },
    modalBtnTextCancel: {
        color: ITAU_BLUE,
        fontWeight: 'bold'
    },
    modalBtnSave: {
        flex: 1,
        backgroundColor: ITAU_ORANGE,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center'
    },
    modalBtnTextSave: {
        color: '#FFF',
        fontWeight: 'bold'
    },
    processingOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        elevation: 9999
    },
    processingBox: {
        backgroundColor: '#FFF',
        padding: 30,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5
    },
    processingText: {
        marginTop: 15,
        color: ITAU_BLUE,
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default DashboardScreen;
