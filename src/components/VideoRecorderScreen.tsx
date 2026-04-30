import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ToastAndroid,
  StatusBar,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Orientation from 'react-native-orientation-locker';
import Svg, { Circle } from 'react-native-svg';
import { Video } from 'react-native-video';
// ✅ NEW: import compressor
import { Video as VideoCompressor } from 'react-native-compressor';

import { getLocationAsync } from '../utils/geolocation';
import { saveVideoLocally } from '../services/Imageuploadservice';
import { saveImageCapture } from '../database/imageCaptureDb';
import { useValuationStore } from '../store/valuation.store';
import { SyncManager } from '../services/Syncmanager';
// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const RECORDING_DURATION = 60; // seconds
const VIDEO_WIDTH = 854;
const VIDEO_HEIGHT = 480;
const VIDEO_FPS = 24;
// ✅ FIX: vision-camera's videoBitRate prop is often IGNORED by the OS encoder.
//    We record at whatever the device defaults to, then compress afterward.
//    This is the same approach WhatsApp uses.

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface RouteParams {
  id: string;
  side: string;
  vehicleType: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const VideoRecorderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id: leadId, side } = route.params as RouteParams;

  const cameraRef = useRef<Camera>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingRef = useRef(false);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    { videoResolution: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT } },
    { fps: VIDEO_FPS },
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RECORDING_DURATION);
  const [isSaving, setIsSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState('Saving...');  // ✅ NEW: granular status
  const [compressionProgress, setCompressionProgress] = useState(0); // ✅ NEW: 0–1
  const [torch, setTorch] = useState<'off' | 'on'>('off');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [pendingVideoPath, setPendingVideoPath] = useState<string | null>(null);

  const { markLocalCaptured } = useValuationStore();

  // ── Orientation + StatusBar ──────────────────────────────────────────────

  useEffect(() => {
    Orientation.lockToLandscapeLeft();
    return () => {
      Orientation.lockToPortrait();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    StatusBar.setHidden(true);
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
    return () => {
      StatusBar.setHidden(false);
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor('#1181B2');
    };
  }, []);

  // ── Permission ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  // ── Core: compress → save locally → preview ─────────────────────────────
  //
  // ✅ KEY FIX:
  //   Raw camera output is typically 8–15 Mbps (≈ 60–110 MB/min).
  //   We compress it to ~700 kbps (≈ 5–7 MB/min) before saving,
  //   exactly like WhatsApp does. Only then do we store/upload.

  const handleRecordingFinished = useCallback(
    async (videoFile: { path: string; duration: number }) => {
      if (isSaving) return;
      setIsSaving(true);
      recordingRef.current = false;
      setIsRecording(false);

      const rawUri = `file://${videoFile.path}`;
      console.log(
        `[VideoRecorder] 🎬 Raw recording done: ${videoFile.duration?.toFixed(1)}s — ${videoFile.path}`,
      );

      try {
        // ── STEP 1: Compress ──────────────────────────────────────────────
        setSavingLabel('Compressing video...');
        setCompressionProgress(0);

        const compressedUri = await VideoCompressor.compress(
          rawUri,
          {
            compressionMethod: 'manual',
            bitrate: 900_000,       // 900 kbps — same as WhatsApp (700–900 kbps)
            maxSize: 960,           // longest side max px (keeps 480p output)
            minimumFileSizeForCompress: 5, // skip if already < 5 MB (safety)
          },
          (progress) => {
            // progress is 0–1
            setCompressionProgress(progress);
          },
        );

        console.log(`[VideoRecorder] ✅ Compressed: ${compressedUri}`);

        // ── STEP 2: Save compressed file permanently ──────────────────────
        setSavingLabel('Saving video...');

        const localPath = await saveVideoLocally({
          leadId,
          side,
          tempUri: compressedUri, // ✅ save COMPRESSED file, not raw
        });

        // ── STEP 3: Show preview ──────────────────────────────────────────
        setPendingVideoPath(localPath);
        setPreviewUri(localPath);
        setIsSaving(false);
        setCompressionProgress(0);
        ToastAndroid.show('Preview ready. Check and tap Use Video.', ToastAndroid.SHORT);
      } catch (e: any) {
        console.error('[VideoRecorder] Compress/Save failed:', e);
        ToastAndroid.show('Failed to save video. Try again.', ToastAndroid.LONG);
        setIsSaving(false);
        setCompressionProgress(0);
        setIsRecording(false);
      }
    },
    [isSaving, leadId, side],
  );

  // ── Confirm (Use Video) ──────────────────────────────────────────────────

  const handleUseVideo = useCallback(async () => {
    if (!pendingVideoPath || isSaving) return;
    setIsSaving(true);
    setSavingLabel('Confirming...');

    try {
      const geo = await getLocationAsync();

      await saveImageCapture({
        leadId,
        side,
        appColumn: 'Video1',
        localPath: pendingVideoPath,
        mediaType: 'video',
        latitude: geo.lat,
        longitude: geo.long,
        capturedAt: geo.timeStamp,
      });

      markLocalCaptured(side, pendingVideoPath);
      await SyncManager.refreshPendingCount();
      void SyncManager.kick();

      ToastAndroid.show('Video confirmed and queued for upload.', ToastAndroid.SHORT);
      setPreviewUri(null);
      setPendingVideoPath(null);
      setIsSaving(false);
      navigation.goBack();
    } catch (e: any) {
      console.error('[VideoRecorder] Confirm failed:', e);
      ToastAndroid.show('Failed to confirm video. Try again.', ToastAndroid.LONG);
      setIsSaving(false);
    }
  }, [pendingVideoPath, isSaving, leadId, side, markLocalCaptured, navigation]);

  // ── Start recording ──────────────────────────────────────────────────────

  const handleStartRecording = useCallback(async () => {
    if (!cameraRef.current || isRecording || recordingRef.current) return;

    try {
      setIsRecording(true);
      setSecondsLeft(RECORDING_DURATION);
      recordingRef.current = true;

      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
            if (recordingRef.current) cameraRef.current?.stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // ✅ NOTE: We no longer pass videoBitRate here because iOS/Android
      //    ignore it in many cases. Compression handles it instead.
      cameraRef.current.startRecording({
        videoCodec: 'h264',
        onRecordingFinished: handleRecordingFinished,
        onRecordingError: error => {
          console.error('[VideoRecorder] Recording error:', error);
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          recordingRef.current = false;
          setIsRecording(false);
          ToastAndroid.show('Recording failed. Try again.', ToastAndroid.LONG);
        },
      });

      console.log('[VideoRecorder] 🎬 Recording started — 60s countdown');
    } catch (e: any) {
      console.error('[VideoRecorder] Start failed:', e);
      recordingRef.current = false;
      setIsRecording(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      ToastAndroid.show('Failed to start recording', ToastAndroid.SHORT);
    }
  }, [isRecording, handleRecordingFinished]);

  // ── Countdown UI ─────────────────────────────────────────────────────────

  const renderCountdown = () => {
    const size = 100;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - secondsLeft / RECORDING_DURATION);

    return (
      <View style={styles.countdownContainer}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius}
            stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} fill="rgba(0,0,0,0.4)" />
          <Circle cx={size / 2} cy={size / 2} r={radius}
            stroke="#FF4444" strokeWidth={strokeWidth} fill="transparent"
            strokeDasharray={`${circumference}`} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" rotation="-90" origin={`${size / 2}, ${size / 2}`} />
        </Svg>
        <View style={styles.countdownTextContainer}>
          <Text style={styles.countdownNumber}>{secondsLeft}</Text>
          <Text style={styles.countdownLabel}>sec</Text>
        </View>
        <View style={styles.recIndicator}>
          <View style={styles.recDot} />
          <Text style={styles.recText}>REC</Text>
        </View>
      </View>
    );
  };

  // ── Guards ───────────────────────────────────────────────────────────────

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="camera-off" size={48} color="#999" />
        <Text style={styles.infoText}>Camera permission required</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.infoText}>Loading camera...</Text>
      </View>
    );
  }

  // ── ✅ IMPROVED Saving screen — shows compression progress ───────────────

  if (isSaving) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4444" />
        <Text style={styles.savingText}>{savingLabel}</Text>

        {/* Show compression bar only while compressing */}
        {compressionProgress > 0 && compressionProgress < 1 && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${Math.round(compressionProgress * 100)}%` }]} />
          </View>
        )}
        {compressionProgress > 0 && compressionProgress < 1 && (
          <Text style={styles.savingSubtext}>
            {Math.round(compressionProgress * 100)}%
          </Text>
        )}
        {compressionProgress === 0 && (
          <Text style={styles.savingSubtext}>Please wait</Text>
        )}
      </View>
    );
  }

  // ── Preview screen ───────────────────────────────────────────────────────

  if (previewUri) {
    return (
      <View style={styles.container}>
        <Video
          source={{ uri: previewUri }}
          style={StyleSheet.absoluteFill}
          controls
          resizeMode="contain"
        />
        <View style={styles.previewActions}>
          <TouchableOpacity
            style={[styles.permissionBtn, styles.previewRetakeBtn]}
            onPress={() => {
              setPreviewUri(null);
              setPendingVideoPath(null);
              setIsRecording(false);
              setSecondsLeft(RECORDING_DURATION);
            }}>
            <Text style={styles.permissionBtnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.permissionBtn} onPress={handleUseVideo}>
            <Text style={styles.permissionBtnText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Camera view ──────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        video
        audio
        format={format}
        torch={torch}
        // ✅ Removed videoBitRate — unreliable on both iOS/Android.
        //    react-native-compressor handles bitrate reduction instead.
      />

      {device.hasTorch && (
        <TouchableOpacity
          style={styles.flashBtn}
          onPress={() => setTorch(prev => (prev === 'off' ? 'on' : 'off'))}
          activeOpacity={0.85}>
          <MaterialCommunityIcons
            name={torch === 'on' ? 'flashlight' : 'flashlight-off'}
            size={18} color="#fff" />
          <Text style={styles.flashBtnText}>{torch === 'on' ? 'Flash On' : 'Flash Off'}</Text>
        </TouchableOpacity>
      )}

      {isRecording && renderCountdown()}

      {!isRecording && (
        <View style={styles.startOverlay}>
          <View style={styles.instructionContainer}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#fff" />
            <Text style={styles.instructionText}>60-second video recording</Text>
          </View>

          <View style={styles.startBtnWrapper}>
            <TouchableOpacity style={styles.startBtn} onPress={handleStartRecording} activeOpacity={0.8}>
              <View style={styles.startBtnInner}>
                <MaterialCommunityIcons name="video" size={32} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.startBtnLabel}>Tap to Start</Text>
          </View>

          <View style={styles.warningContainer}>
            <MaterialCommunityIcons name="timer-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.warningText}>
              Video will auto-stop after 60 seconds. No manual stop.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default VideoRecorderScreen;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', gap: 12 },
  infoText: { color: '#fff', fontSize: 16, textAlign: 'center' },

  savingText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  savingSubtext: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },

  // ✅ NEW: compression progress bar
  progressBarContainer: {
    width: 220,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF4444',
    borderRadius: 3,
  },

  startOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  instructionContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 20,
  },
  instructionText: { color: '#fff', fontSize: 15, fontWeight: '500' },

  startBtnWrapper: { alignItems: 'center', gap: 12 },
  startBtn: {
    width: 84, height: 84, borderRadius: 42, borderWidth: 4,
    borderColor: '#FF4444', justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,68,68,0.2)',
  },
  startBtnInner: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FF4444', justifyContent: 'center', alignItems: 'center',
  },
  startBtnLabel: {
    color: '#fff', fontSize: 14, fontWeight: '600',
    textShadowColor: '#000', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 },
  },

  warningContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 16,
  },
  warningText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

  flashBtn: {
    position: 'absolute', top: 20, left: 20, flexDirection: 'row',
    alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  flashBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  countdownContainer: { position: 'absolute', top: 20, right: 20, alignItems: 'center' },
  countdownTextContainer: {
    position: 'absolute', top: 0, left: 0, width: 100, height: 100,
    justifyContent: 'center', alignItems: 'center',
  },
  countdownNumber: {
    color: '#fff', fontSize: 28, fontWeight: 'bold',
    textShadowColor: '#000', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 },
  },
  countdownLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: -4 },
  recIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4444' },
  recText: { color: '#FF4444', fontSize: 13, fontWeight: 'bold' },

  permissionBtn: { backgroundColor: '#FF4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  permissionBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  previewActions: {
    position: 'absolute', bottom: 40, width: '100%',
    flexDirection: 'row', justifyContent: 'center', gap: 20,
  },
  previewRetakeBtn: { backgroundColor: '#666' },
});