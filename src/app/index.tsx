import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface EventItem {
  eventId: string;
  eventName: string;
  totalCollected: string;
  expiryDate: number; 
  isActive: boolean;
  organizerEmail: string;
}

interface TransactionItem {
  txId: string;
  payerName: string;
  amount: string;
  phone: string;
  network: string;
  timestamp: string;
  targetEventId: string;
  status: string;
  handledBy?: string;
}

export default function App() {
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [otpToken, setOtpToken] = useState<string>('');
  const [tokenGeneratedTime, setTokenGeneratedTime] = useState<number>(Date.now());
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<'MASTER' | 'ORGANIZER'>('ORGANIZER');
  
  const [activeEvents, setActiveEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [eventSearchCode, setEventSearchCode] = useState<string>('');

  const [transactionsQueue, setTransactionsQueue] = useState<TransactionItem[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [incomingSmsInput, setIncomingSmsInput] = useState<string>('');

  useEffect(() => {
    try {
      const now = Date.now();
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

      const savedEvents = localStorage.getItem('evina_master_events');
      let currentEvents: EventItem[] = savedEvents ? JSON.parse(savedEvents) : [
        { eventId: 'EV-1001', eventName: 'Main Corporate Gala 2026', totalCollected: 'TZS 1,450,000', expiryDate: now + (10 * 24 * 60 * 60 * 1000), isActive: true, organizerEmail: 'master@evina.com' },
        { eventId: 'EV-1002', eventName: 'Community Charity Drive', totalCollected: 'TZS 620,000', expiryDate: now + (5 * 24 * 60 * 60 * 1000), isActive: true, organizerEmail: 'organizer@evina.com' },
        { eventId: 'EV-1003', eventName: 'VIP Musical Concert', totalCollected: 'TZS 850,000', expiryDate: now + (12 * 24 * 60 * 60 * 1000), isActive: true, organizerEmail: 'organizer@evina.com' }
      ];

      const filteredEvents = currentEvents.filter(ev => {
        if (!ev.isActive && (now - ev.expiryDate > oneWeekInMs)) {
          return false; 
        }
        return true;
      });

      setActiveEvents(filteredEvents);
      localStorage.setItem('evina_master_events', JSON.stringify(filteredEvents));

      const savedTransactions = localStorage.getItem('evina_master_ledger');
      if (savedTransactions) {
        const parsedTx: TransactionItem[] = JSON.parse(savedTransactions);
        setTransactionsQueue(parsedTx);
      } else {
        const initialQueue: TransactionItem[] = [
          { txId: 'TX984321', payerName: 'Baraka Juma', amount: 'TZS 50,000', phone: '0712345678', network: 'M-PESA', timestamp: '29/10/2026 05:10 AM', targetEventId: 'EV-1001', status: 'AUTO_SYNCED', handledBy: 'System' },
          { txId: 'TX984322', payerName: 'Aisha Mwinyi', amount: 'TZS 30,000', phone: '0789123456', network: 'TIGO-PESA', timestamp: '29/10/2026 05:15 AM', targetEventId: 'EV-1002', status: 'AUTO_SYNCED', handledBy: 'System' },
          { txId: 'TX984323', payerName: 'John Mark', amount: 'TZS 20,000', phone: '0755123456', network: 'AIRTEL-MONEY', timestamp: '29/10/2026 05:20 AM', targetEventId: 'EV-1003', status: 'AUTO_SYNCED', handledBy: 'System' }
        ];
        setTransactionsQueue(initialQueue);
        localStorage.setItem('evina_master_ledger', JSON.stringify(initialQueue));
      }
    } catch (e) {
      console.error('Failed to execute automated lifecycle cleanup', e);
    }
  }, []);

  const syncAndPersistTransactions = (updatedQueue: TransactionItem[]) => {
    setTransactionsQueue(updatedQueue);
    try {
      localStorage.setItem('evina_master_ledger', JSON.stringify(updatedQueue));
    } catch (e) {
      console.error('Failed to sync transaction storage', e);
    }
  };

  const handleAdminBinding = () => {
    const trimmedEmail = adminEmail.trim().toLowerCase();
    const trimmedToken = otpToken.trim();

    if (!trimmedEmail || !trimmedToken) {
      Alert.alert('Authentication Error', 'Main Evina App email and unified PIN/OTP token are required.');
      return;
    }

    const tenMinutesInMs = 10 * 60 * 1000;
    if (Date.now() - tokenGeneratedTime > tenMinutesInMs) {
      Alert.alert('Token Expired', 'Your 10-minute security token has expired. Please request a new token from the main Evina App.');
      return;
    }

    if (trimmedToken.length < 4) {
      Alert.alert('Security Violation', 'Invalid PIN or OTP length. Ensure credentials match your main Evina App account.');
      return;
    }

    if (trimmedEmail.includes('master') || trimmedEmail.includes('admin')) {
      setAdminRole('MASTER');
      if (activeEvents.length > 0) setSelectedEventId(activeEvents[0].eventId);
    } else {
      setAdminRole('ORGANIZER');
      const organizerEvents = activeEvents.filter(ev => ev.organizerEmail.toLowerCase() === trimmedEmail);
      if (organizerEvents.length > 0) {
        setSelectedEventId(organizerEvents[0].eventId);
      }
    }

    setIsAuthorized(true);
    Alert.alert('Access Granted', `Successfully synchronized with Main Evina App credentials as (${trimmedEmail.includes('master') ? 'Master Admin' : 'Event Organizer'})`);
  };

  const handleAutomatedSmsParser = () => {
    const rawSms = incomingSmsInput.trim();
    if (!rawSms) {
      Alert.alert('Parser Error', 'Please input a raw payment SMS string for automated processing.');
      return;
    }

    let detectedNetwork = 'MOBILE MONEY';
    const upperSms = rawSms.toUpperCase();
    if (upperSms.includes('MPESA') || upperSms.includes('M-PESA')) {
      detectedNetwork = 'M-PESA';
    } else if (upperSms.includes('TIGO') || upperSms.includes('TIGO-PESA')) {
      detectedNetwork = 'TIGO-PESA';
    } else if (upperSms.includes('AIRTEL') || upperSms.includes('AIRTEL-MONEY')) {
      detectedNetwork = 'AIRTEL-MONEY';
    }

    const txIdMatch = rawSms.match(/(TX[0-9A-Z]+)/i);
    const extractedTxId = txIdMatch ? txIdMatch[1].toUpperCase() : 'TX' + Math.floor(100000 + Math.random() * 900000);

    const isDuplicate = transactionsQueue.some(tx => tx.txId === extractedTxId);
    if (isDuplicate) {
      Alert.alert('Automated Security Block', `Reference code ${extractedTxId} already exists. Duplicate ingestion blocked.`);
      return;
    }

    const amountMatch = rawSms.match(/(TZS\s?[\d,]+)/i);
    const extractedAmount = amountMatch ? amountMatch[1].toUpperCase() : 'TZS 0';

    const phoneMatch = rawSms.match(/(0\d{9})/);
    const extractedPhone = phoneMatch ? phoneMatch[1] : '0700000000';

    let extractedName = 'Automated Contributor';
    const fromMatch = rawSms.match(/(?:from|kutoka kwa)\s+([A-Za-z\s]+?)(?:\s+0|\s+Ref|\s+ID|\s+tarehe|\s+on|$)/i);
    if (fromMatch && fromMatch[1]) {
      extractedName = fromMatch[1].trim();
    }

    const dateMatch = rawSms.match(/(\d{2}\/\d{2}\/\d{4}(?:\s+(?:at|saa)\s+\d{1,2}:\d{2}\s?[AP]M)?)/i);
    const extractedTimestamp = dateMatch ? dateMatch[1] : new Date().toLocaleString();

    const automatedTransaction: TransactionItem = {
      txId: extractedTxId,
      payerName: extractedName,
      amount: extractedAmount,
      phone: extractedPhone,
      network: detectedNetwork,
      timestamp: extractedTimestamp,
      targetEventId: selectedEventId,
      status: 'AUTO_ROUTED_SUCCESS',
      handledBy: adminEmail
    };

    const updatedQueue = [automatedTransaction, ...transactionsQueue];
    syncAndPersistTransactions(updatedQueue);
    setIncomingSmsInput('');
    
    Alert.alert('Auto-Routing Success', `Transaction ${extractedTxId} successfully routed to event ${selectedEventId} by ${adminEmail}!`);
  };

  const handleAdminForceVerify = (txId: string) => {
    const updatedQueue = transactionsQueue.map(tx => 
      tx.txId === txId ? { ...tx, status: `FORCE_VERIFIED (${adminEmail})` } : tx
    );
    syncAndPersistTransactions(updatedQueue);
    Alert.alert('Master Override Executed', `Transaction ${txId} manually verified by ${adminEmail}.`);
  };

  const visibleEvents = activeEvents.filter(ev => {
    if (adminRole === 'MASTER') return true;
    return ev.organizerEmail.toLowerCase() === adminEmail.trim().toLowerCase();
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.headerContainer}>
          <View style={styles.goldBadge}>
            <Text style={styles.goldBadgeText}>EVINA COMPANION • UNIFIED MAIN APP PORTAL</Text>
          </View>
          <Text style={styles.headerTitle}>Evina Companion</Text>
          <Text style={styles.headerSubtitle}>Unified Credentials & Synced Event Ledger</Text>
        </View>

        {!isAuthorized ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderStripe} />
            <Text style={styles.sectionTitle}>Main Evina App Authorization</Text>
            <Text style={styles.instructionText}>
              Enter your main Evina App registered email and unified PIN/OTP token to securely access your events and ledgers.
            </Text>

            <Text style={styles.label}>Main Evina App Registered Email</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. organizer@evina.com or master@evina.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              value={adminEmail}
              onChangeText={setAdminEmail}
            />

            <Text style={styles.label}>Unified PIN / 10-Min Event OTP Token</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter PIN or 6-digit token from main app"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              secureTextEntry={true}
              value={otpToken}
              onChangeText={setOtpToken}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleAdminBinding}>
              <Text style={styles.primaryButtonText}>Verify & Launch Companion Portal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.dashboardContainer}>
            <View style={styles.welcomeBanner}>
              <Text style={styles.welcomeText}>User: {adminEmail}</Text>
              <Text style={styles.statusSubText}>
                Role: {adminRole} • {adminRole === 'MASTER' ? 'Full Ecosystem View' : 'Isolated Event Organizer View'}
              </Text>
            </View>

            <Text style={styles.sectionHeader}>Search Your Events (e.g., EV-1002)</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Event Code or Name..."
              placeholderTextColor="#64748b"
              value={eventSearchCode}
              onChangeText={setEventSearchCode}
            />

            {visibleEvents
              .filter(ev => ev.eventId.toLowerCase().includes(eventSearchCode.toLowerCase()) || ev.eventName.toLowerCase().includes(eventSearchCode.toLowerCase()))
              .map((event) => (
                <TouchableOpacity 
                  key={event.eventId} 
                  style={[styles.eventCard, selectedEventId === event.eventId && styles.selectedCard]} 
                  onPress={() => setSelectedEventId(event.eventId)}
                >
                  <View style={styles.eventTextWrapper}>
                    <Text style={styles.eventTitle}>{event.eventName}</Text>
                    <Text style={styles.eventMeta}>ID: {event.eventId} | Total: {event.totalCollected}</Text>
                  </View>
                  <Text style={styles.actionIndicator}>
                    {selectedEventId === event.eventId ? '✔ ACTIVE TARGET' : 'Select'}
                  </Text>
                </TouchableOpacity>
            ))}

            {visibleEvents.length === 0 && (
              <Text style={styles.noEventsText}>No registered events found for {adminEmail}. Please create an event in the main Evina App first.</Text>
            )}

            {selectedEventId !== '' && (
              <View style={styles.parserCard}>
                <Text style={styles.sectionHeader}>Auto-Routing SMS Ingestion Engine (Troubleshooting)</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Paste incoming SMS to auto-route to target event..."
                  placeholderTextColor="#64748b"
                  value={incomingSmsInput}
                  onChangeText={setIncomingSmsInput}
                />
                <TouchableOpacity style={styles.secondaryButton} onPress={handleAutomatedSmsParser}>
                  <Text style={styles.secondaryButtonText}>Process & Auto-Route to Event ({selectedEventId})</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedEventId !== '' && (
              <View style={styles.ledgerSection}>
                <Text style={styles.sectionHeader}>Kamiti Leja (Targeted for: {selectedEventId})</Text>
                
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Transaction ID, Network or Payer Name..."
                  placeholderTextColor="#64748b"
                  value={searchFilter}
                  onChangeText={setSearchFilter}
                />

                {transactionsQueue
                  .filter(tx => tx.targetEventId === selectedEventId)
                  .filter(tx => 
                    tx.payerName.toLowerCase().includes(searchFilter.toLowerCase()) || 
                    tx.txId.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    tx.network.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  .map((tx) => (
                    <View key={tx.txId} style={styles.txRow}>
                      <View style={styles.txInfo}>
                        <View style={styles.txTopRow}>
                          <Text style={styles.txIdText}>{tx.txId} - {tx.payerName}</Text>
                          <View style={styles.networkBadge}>
                            <Text style={styles.networkBadgeText}>{tx.network}</Text>
                          </View>
                        </View>
                        <Text style={styles.txSubText}>{tx.phone} | {tx.amount} | Event: {tx.targetEventId}</Text>
                        <Text style={styles.txTimestampText}>📅 {tx.timestamp} • Processed by: {tx.handledBy || 'System'}</Text>
                        <Text style={[styles.statusBadge, tx.status.includes('SUCCESS') || tx.status.includes('VERIFIED') ? styles.verifiedText : styles.pendingText]}>
                          Status: {tx.status}
                        </Text>
                      </View>

                      {tx.status === 'PENDING_SMS' && (
                        <TouchableOpacity 
                          style={styles.overrideButton} 
                          onPress={() => handleAdminForceVerify(tx.txId)}
                        >
                          <Text style={styles.overrideButtonText}>Force Verify</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                ))}
              </View>
            )}

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfbf7',
  },
  scrollContainer: {
    padding: 16,
    justifyContent: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#fef3c7',
    paddingBottom: 12,
  },
  goldBadge: {
    backgroundColor: '#fffbeb',
    borderColor: '#f59e0b',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 16,
    marginBottom: 6,
  },
  goldBadgeText: {
    color: '#b45309',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#581c87',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#d97706',
    marginTop: 3,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
    shadowColor: '#581c87',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  cardHeaderStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#581c87',
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#581c87',
    marginBottom: 6,
    marginTop: 4,
  },
  instructionText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 16,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    color: '#581c87',
    marginBottom: 5,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 46,
    color: '#0f172a',
    marginBottom: 14,
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: '#581c87',
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    shadowColor: '#581c87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fde047',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: '#d97706',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 4,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dashboardContainer: {
    width: '100%',
  },
  welcomeBanner: {
    backgroundColor: '#faf5ff',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#581c87',
  },
  statusSubText: {
    fontSize: 11,
    color: '#d97706',
    marginTop: 3,
    fontWeight: '600',
  },
  parserCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#581c87',
    marginBottom: 10,
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: '#581c87',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectedCard: {
    borderColor: '#fde047',
    borderWidth: 2,
    backgroundColor: '#4c1d95',
  },
  eventTextWrapper: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  eventMeta: {
    fontSize: 11,
    color: '#fde047',
    fontWeight: '500',
  },
  actionIndicator: {
    color: '#fde047',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noEventsText: {
    color: '#b91c1c',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 15,
  },
  ledgerSection: {
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderColor: '#f59e0b',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 42,
    color: '#0f172a',
    marginBottom: 10,
    fontSize: 13,
  },
  txRow: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  txInfo: {
    flex: 1,
  },
  txTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  txIdText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#581c87',
  },
  networkBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d8b4fe',
  },
  networkBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b21a8',
  },
  txSubText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  txTimestampText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  verifiedText: {
    color: '#16a34a',
  },
  pendingText: {
    color: '#d97706',
  },
  overrideButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  overrideButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});