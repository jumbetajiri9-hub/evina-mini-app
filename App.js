import { useState } from 'react';
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

export default function App() {
  // State Management for Authentication & Multi-Event Ecosystem
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [eventsList, setEventsList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Time-Bound OTP & Strict Account Binding Logic Simulation
  const handleVerifyOTP = () => {
    if (!organizerEmail || !otpToken) {
      Alert.alert('Error', 'Please enter both your organizer email and the time-bound OTP.');
      return;
    }

    // Simulating strict validation (OTP must be valid and time-window active)
    if (otpToken.length < 4) {
      Alert.alert('Security Alert', 'Invalid or expired OTP token. Please generate a new one from the main Evina App.');
      return;
    }

    // Successful binding & data synchronization
    setIsAuthenticated(true);
    // Mocking initial multi-event data loaded from cloud/local hybrid storage
    setEventsList([
      { id: '1', title: 'Jumbe Wedding Celebration', status: 'Active', pendingPayments: 3 },
      { id: '2', title: 'Community Fundraiser Gala', status: 'Active', pendingPayments: 1 },
    ]);

    Alert.alert('Success', 'Account securely bound and offline database synchronized.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Evina Ecosystem</Text>
          <Text style={styles.headerSubtitle}>Organizer Companion & Mini-App Portal</Text>
        </View>

        {!isAuthenticated ? (
          /* Step 2: Time-Bound OTP Onboarding & Strict Binding */
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Organizer Secure Login</Text>
            <Text style={styles.instructionText}>
              Enter your registered organizer email and the 10-minute time-bound OTP generated from your main Evina App.
            </Text>

            <Text style={styles.label}>Organizer Email</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@evina.com"
              placeholderTextColor="#666"
              autoCapitalize="none"
              value={organizerEmail}
              onChangeText={setOrganizerEmail}
            />

            <Text style={styles.label}>Time-Bound OTP Token</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 4-digit or 6-digit OTP"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              secureTextEntry={true}
              value={otpToken}
              onChangeText={setOtpToken}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOTP}>
              <Text style={styles.primaryButtonText}>Verify & Bind Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Step 5 & 6: Multi-Event Dashboard & Management Portal */
          <View style={styles.dashboardContainer}>
            <Text style={styles.welcomeText}>Welcome back, {organizerEmail}</Text>
            <Text style={styles.statusSubText}>Offline-First Hybrid Storage Active (Secure)</Text>

            <Text style={styles.sectionHeader}>Your Managed Events</Text>
            
            {eventsList.map((ev) => (
              <TouchableOpacity 
                key={ev.id} 
                style={styles.eventCard} 
                onPress={() => setSelectedEvent(ev)}
              >
                <View>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  <Text style={styles.eventDetails}>Status: {ev.status} | Pending SMS: {ev.pendingPayments}</Text>
                </View>
                <Text style={styles.arrowText}>➔</Text>
              </TouchableOpacity>
            ))}

            {selectedEvent && (
              <View style={styles.selectedEventPanel}>
                <Text style={styles.panelTitle}>Active Event: {selectedEvent.title}</Text>
                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  onPress={() => Alert.alert('Kamiti Leja / Ledger', 'Exporting ledger and syncing SMS verification queue...')}
                >
                  <Text style={styles.secondaryButtonText}>Open Kamiti Leja & SMS Audit</Text>
                </TouchableOpacity>
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
    backgroundColor: '#0f172a',
  },
  scrollContainer: {
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 20,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 48,
    color: '#f8fafc',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  dashboardContainer: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  statusSubText: {
    fontSize: 12,
    color: '#38bdf8',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 12,
  },
  eventCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  eventDetails: {
    fontSize: 12,
    color: '#94a3b8',
  },
  arrowText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedEventPanel: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 18,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#047857',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});