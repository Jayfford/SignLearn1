import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomBelt from './components/BottomBelt';

const COLORS = {
  background: '#F6EBDD',
  panel: '#FFFDFC',
  ink: '#2B2622',
  muted: '#7D7066',
  brown: '#A48769',
  coral: '#E36455',
  green: '#2EAF78',
  white: '#FFFFFF',
};

export default function AICamera() {
  const router = useRouter();
  const { targetSign } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const runScan = () => {
    setIsScanning(true);
    setResult('');
    setTimeout(() => {
      setIsScanning(false);
      setResult('Thank you');
    }, 1400);
  };

  if (!permission) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text style={styles.loadingText}>Preparing camera...</Text></View></SafeAreaView>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.permissionIcon}><Ionicons name="camera-outline" size={42} color={COLORS.brown} /></View>
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionText}>Allow camera access to practice signs with AI Camera.</Text>
          <Pressable style={styles.primaryButton} onPress={permission.canAskAgain ? requestPermission : () => Alert.alert('Camera unavailable', 'Enable camera access in your device settings.') }>
            <Text style={styles.primaryButtonText}>{permission.canAskAgain ? 'Allow Camera' : 'Open Settings'}</Text>
          </Pressable>
        </View>
        <BottomBelt active="ai-camera" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={25} color={COLORS.ink} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>AI Camera Viewfinder</Text>
            <Text style={styles.subtitle}>MediaPipe 21-point tracking</Text>
          </View>
          <View style={styles.activePill}><View style={styles.activeDot} /><Text style={styles.activeText}>Vision Active</Text></View>
        </View>

        <View style={styles.cameraFrame}>
          <CameraView style={StyleSheet.absoluteFill} facing="front" />
          <View style={styles.cameraOverlay}>
            <View style={styles.scanGrid} />
            <View style={styles.trackingBox}>
              <View style={[styles.corner, styles.cornerTopLeft]} /><View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} /><View style={[styles.corner, styles.cornerBottomRight]} />
              <View style={styles.trackingLine} />
            </View>
            <View style={styles.cameraStats}><Text style={styles.cameraStatsText}>FPS: 60 • LATENCY: 14ms</Text></View>
            <View style={styles.targetBar}><View><Text style={styles.targetLabel}>TARGET SIGN</Text><Text style={styles.targetValue}>{result ? `"${result.toUpperCase()}"` : targetSign ? `"${String(targetSign).toUpperCase()}"` : 'READY TO SCAN'}</Text></View><View><Text style={styles.targetLabel}>PRECISION</Text><Text style={styles.precision}>{result ? '94%' : '--'}</Text></View></View>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <Text style={styles.instruction}>Hold your hand against the camera, then extend outward smoothly toward the lens.</Text>
          <Pressable style={[styles.scanButton, isScanning && styles.scanButtonActive]} onPress={runScan} disabled={isScanning}>
            <Ionicons name={isScanning ? 'sync' : 'camera'} size={17} color={COLORS.white} />
            <Text style={styles.scanButtonText}>{isScanning ? 'Analyzing Sign...' : 'Run AI Camera Scan'}</Text>
          </Pressable>
        </View>

        {result ? <View style={styles.resultBanner}><MaterialIcons name="check-circle" size={21} color={COLORS.green} /><Text style={styles.resultText}>Recognized sign: <Text style={styles.resultStrong}>{result}</Text></Text></View> : null}
        <View style={styles.bottomSpace} />
        <BottomBelt active="ai-camera" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, paddingHorizontal: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: COLORS.background },
  loadingText: { color: COLORS.muted, fontSize: 16 },
  permissionIcon: { width: 82, height: 82, borderRadius: 41, backgroundColor: '#EBD8C1', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  permissionTitle: { color: COLORS.ink, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  permissionText: { color: COLORS.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 300, marginTop: 10, marginBottom: 22 },
  primaryButton: { backgroundColor: COLORS.brown, borderRadius: 18, paddingHorizontal: 25, paddingVertical: 14 },
  primaryButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 10 },
  backButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.panel, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  title: { color: COLORS.ink, fontSize: 21, fontWeight: '900' },
  subtitle: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#DDF6E9', borderRadius: 15, paddingHorizontal: 10, paddingVertical: 7 },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.green },
  activeText: { color: COLORS.green, fontSize: 11, fontWeight: '800' },
  cameraFrame: { height: 270, borderRadius: 23, overflow: 'hidden', backgroundColor: '#17191A', borderWidth: 5, borderColor: '#E1D1BE' },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  scanGrid: { ...StyleSheet.absoluteFillObject, opacity: 0.15, borderWidth: 1, borderColor: '#FFFFFF' },
  trackingBox: { position: 'absolute', top: 44, left: '25%', right: '25%', height: 130, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 22, height: 22, borderColor: '#DFAE8C' },
  cornerTopLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTopRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBottomLeft: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBottomRight: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
  trackingLine: { width: '85%', height: 2, backgroundColor: COLORS.green },
  cameraStats: { position: 'absolute', top: 34, alignSelf: 'center', backgroundColor: 'rgba(16,33,27,0.8)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  cameraStatsText: { color: '#7FE1B5', fontSize: 9, fontWeight: '700' },
  targetBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(4,5,6,0.9)', padding: 12, flexDirection: 'row', justifyContent: 'space-between' },
  targetLabel: { color: '#A5A5A5', fontSize: 8, fontWeight: '800' },
  targetValue: { color: '#F09B77', fontSize: 13, fontWeight: '900', marginTop: 3 },
  precision: { color: '#5AE2AB', fontSize: 15, fontWeight: '900', marginTop: 3, textAlign: 'right' },
  instructionCard: { backgroundColor: COLORS.panel, borderRadius: 18, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#E9DCCB' },
  instruction: { color: '#5D5148', fontSize: 13, lineHeight: 19, marginBottom: 10 },
  scanButton: { minHeight: 49, backgroundColor: COLORS.coral, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, borderBottomWidth: 3, borderBottomColor: '#B84D42' },
  scanButtonActive: { opacity: 0.75 },
  scanButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '900' },
  resultBanner: { marginTop: 12, backgroundColor: '#E0F6EA', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultText: { color: '#35624D', fontSize: 14 },
  resultStrong: { fontWeight: '900' },
  bottomSpace: { flex: 1 },
});
