import RNFS from 'react-native-fs';
import axios from 'axios';
import { getPendingImages, getPendingImagesForLead, markUploading, markUploaded, markFailed, getPendingAnswers, markAnswerSubmitted, CapturedImage } from '../database/imageCaptureDb';
import { apiCall } from './ApiClient';

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// API — Axios instance (timeout + maxBody like old expo)
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://inspection.kwikcheck.in/App/webservice';

interface UploadResponse {
  STATUS?: string;
  ERRORCODE?: string;
  ERROR?: string;
  Error?: string;
  error?: string;
  MESSAGE?: string;
  Message?: string;
  IMAGEPATH?: string;
  HTTPCODE?: number;
}

const hasConfirmedSuccess = (response: UploadResponse, isVideo: boolean): boolean => {
  const errorFlag = response.ERRORCODE ?? response.ERROR ?? response.Error ?? response.error;
  const statusFlag = response.STATUS;

  if (String(errorFlag) !== '0') {
    return false;
  }

  if (isVideo) {
    // For video: only ERRORCODE and IMAGEPATH matter
    if (!response.IMAGEPATH) {
      return false;
    }
    return true;
  } else {
    // For images: backend returns STATUS as either '0' or '1' depending on endpoint version.
    // With /DocumentUploadOtherImage (multipart), STATUS='0' can still be success.
    if (typeof statusFlag !== 'undefined' && String(statusFlag) !== '0' && String(statusFlag) !== '1') {
      return false;
    }
    if (!response.IMAGEPATH) {
      console.warn('[Upload] ⚠️ Server returned success without IMAGEPATH. Treating request as accepted, but upload is not verifiable from response.', response);
    }
    return true;
  }
};

/**
 * DocumentUploadOtherImage (Expo parity)
 * Multipart form-data with dynamic image field.
 *
 * Important: Some leads fail on first upload with JSON base64 payload,
 * but succeed with multipart endpoint used by Expo.
 */
const uploadImageApi = async (
  token: string,
  image: CapturedImage
): Promise<UploadResponse> => {
  const filePath = image.local_path.replace('file://', '');
  const imageField = image.app_column.endsWith('Base64')
    ? image.app_column.replace(/Base64$/i, '')
    : image.app_column;

  const stat = await RNFS.stat(filePath);
  if (Number(stat.size) > 500 * 1024) {
  throw new Error('Image too large. Must be under 500KB');
}
  
  const sizeMB = (Number(stat.size) / 1024 / 1024).toFixed(2);
  const fileName = image.local_path.split('/').pop() || `${imageField}.jpg`;

  console.log('📁 FILE PATH:', filePath);
console.log('📦 FILE SIZE BYTES:', stat.size);
console.log('📦 FILE SIZE KB:', (Number(stat.size) / 1024).toFixed(2));
console.log('📦 FILE SIZE MB:', (Number(stat.size) / 1024 / 1024).toFixed(2));
console.log('📄 FILE NAME:', fileName);
    console.log(`
[📸 Upload Image] Lead: ${image.lead_id}, Side: ${image.side}
  - app_column (DB): "${image.app_column}"
  - Field name being sent: "${imageField}"
  - File size: ${sizeMB} MB
  - Endpoint: /DocumentUploadOtherImage (multipart)
  - FileName :${fileName}
  -localPath: ${image.local_path}
  `);
  const formData = new FormData();
  formData.append('LeadId', image.lead_id);
  formData.append('TokenID', token);
  formData.append('Version', '2');
  formData.append('Latitude', String(image.latitude ?? '0'));
  formData.append('Longitude', String(image.longitude ?? '0'));
  formData.append('Timestamp', image.captured_at ?? new Date().toISOString());

  // Expo-compatible payload: same key twice (file + filename)
  formData.append(imageField, {
    uri: image.local_path,
    type: 'image/jpeg',
    name: fileName,
  } as any);
  formData.append(imageField, fileName);
  // formData.append(image.app_column, fileName);




  try {
    const response = await axios.post(`${BASE_URL}/DocumentUploadOtherImage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': '*/*',
        'TokenID': token,
        'Version': '2',
      },
      timeout: 60000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    console.log('[API] 📥 RESPONSE:', response.status, response.data);
    return response.data;

  } catch (error: any) {
    // Axios error details — server response, timeout, network etc.
    if (error.response) {
      // Server responded with non-2xx
      console.error('[API] ❌ SERVER ERROR:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        fieldName: imageField,
        leadId: image.lead_id,
      });
      throw new Error(`HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      console.error('[API] ⏰ TIMEOUT:', {
        message: 'Upload timed out after 60s',
        fieldName: imageField,
        leadId: image.lead_id,
        fileSize: `${sizeMB} MB`,
      });
      throw new Error(`Upload timeout (${sizeMB} MB image)`);
    } else {
      // Network error / other
      console.error('[API] ❌ NETWORK ERROR:', {
        message: error?.message,
        code: error?.code,
        fieldName: imageField,
        leadId: image.lead_id,
      });
      throw error;
    }
  }
};

export const uploadImageImmediately = async (params: {
  token: string;
  leadId: string;
  side: string;
  appColumn: string;
  localPath: string;
  latitude?: string | null;
  longitude?: string | null;
  capturedAt?: string | null;
}): Promise<boolean> => {
  const normalizedAppColumn = params.appColumn.endsWith('Base64')
    ? params.appColumn.replace(/Base64$/i, '')
    : params.appColumn;

  const image: CapturedImage = {
    id: 0,
    lead_id: params.leadId,
    side: params.side,
    app_column: normalizedAppColumn,
    local_path: params.localPath,
    upload_status: 'pending',
    retry_count: 0,
    media_type: 'image',
    latitude: params.latitude ?? null,
    longitude: params.longitude ?? null,
    captured_at: params.capturedAt ?? null,
    answer_data: null,
    answer_status: null,
    created_at: new Date().toISOString(),
    uploaded_at: null,
  };
console.log(`localPath: ${params.localPath}, latitude: ${params.latitude}, longitude: ${params.longitude}, capturedAt: ${params.capturedAt}`);
  try {
    const response = await uploadImageApi(params.token, image);
    return hasConfirmedSuccess(response, false);
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// QUESTIONNAIRE ANSWER SUBMIT — Image upload ke baad answer bhejo
// ─────────────────────────────────────────────────────────────────────────────

const submitAnswerForImage = async (token: string, image: CapturedImage): Promise<boolean> => {
  if (!image.answer_data) return false;
  try {
    const payload = JSON.parse(image.answer_data);
    console.log(`[Upload] 📝 Submitting answer for ${image.side} (lead: ${image.lead_id})`);
    const res = await apiCall<{ ERROR: string; MESSAGE: string }>('LeadReportDataCreateedit', token, {
      Version: '2',
      ...payload,
    });
    if (res.ERROR === '0') {
      await markAnswerSubmitted(image.id);
      console.log(`[Upload] ✅ Answer submitted: ${image.side}`);
      return true;
    } else {
      console.warn(`[Upload] ❌ Answer rejected: ${image.side}`, res);
      return false;
    }
  } catch (e: any) {
    console.error(`[Upload] ❌ Answer submit failed: ${image.side}`, e?.message);
    return false;
  }
};

/**
 * Submit all pending answers whose images are already uploaded
 * Called by SyncManager after image batch upload completes
 */
export const submitPendingAnswers = async (token: string): Promise<{ submitted: number; failed: number }> => {
  let submitted = 0;
  let failed = 0;
  try {
    const pending = await getPendingAnswers();
    if (!pending.length) return { submitted: 0, failed: 0 };
    console.log(`[Upload] 📝 Submitting ${pending.length} pending answers...`);
    for (const image of pending) {
      const ok = await submitAnswerForImage(token, image);
      if (ok) submitted++;
      else failed++;
    }
    console.log(`[Upload] 📝 Answers done: ${submitted} submitted, ${failed} failed`);
  } catch (e: any) {
    console.error('[Upload] ❌ submitPendingAnswers error:', e?.message);
  }
  return { submitted, failed };
};

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO UPLOAD — multipart/form-data (base64 nahi, file directly)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DocumentUploadVideo
 * Multipart form-data: { LeadId, Video1 (mp4 file), TokenID, Version }
 * Video ko base64 mein convert NAHI karte — file directly bhejte hain
 */
const uploadVideoApi = async (
  token: string,
  image: CapturedImage
): Promise<UploadResponse> => {
  const filePath = image.local_path.replace('file://', '');

  // File size check
  const stat = await RNFS.stat(filePath);
  const sizeMB = (Number(stat.size) / 1024 / 1024).toFixed(2);

  // Cloudflare enforces 100MB upload limit
  if (Number(sizeMB) > 100) {
    console.error(`[API] ❌ Video too large: ${sizeMB} MB (max 100MB)`);
    throw new Error(`Video file too large: ${sizeMB}MB. Max allowed is 100MB. Please re-record.`);
  }

  console.log('[API] 📤 VIDEO UPLOAD REQUEST:', {
    url: '/DocumentUploadVideo',
    LeadId: image.lead_id,
    fileSize: `${sizeMB} MB`,
  });

  const formData = new FormData();
  formData.append('LeadId', image.lead_id);
  formData.append('TokenID', token);
  formData.append('Version', '2');
  formData.append('Video1', {
    uri: image.local_path,
    type: 'video/mp4',
    name: 'Video.mp4',
  } as any);

  try {
    const response = await axios.post(`${BASE_URL}/DocumentUploadVideo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': '*/*',
        'TokenID': token,
        'Version': '2',
      },
      timeout: 180000,              // 3 min — large video upload ko time chahiye
maxBodyLength: 2 * 1024 * 1024,
maxContentLength: 2 * 1024 * 1024,
    });

    console.log('[API] 📥 VIDEO RESPONSE:', response.status, response.data);
    return response.data;

  } catch (error: any) {
    if (error.response) {
      console.error('[API] ❌ VIDEO SERVER ERROR:', {
        status: error.response.status,
        data: error.response.data,
        leadId: image.lead_id,
      });
      throw new Error(`HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else if (error.code === 'ECONNABORTED') {
      console.error('[API] ⏰ VIDEO TIMEOUT:', {
        message: 'Video upload timed out after 120s',
        leadId: image.lead_id,
        fileSize: `${sizeMB} MB`,
      });
      throw new Error(`Video upload timeout (${sizeMB} MB)`);
    } else {
      console.error('[API] ❌ VIDEO NETWORK ERROR:', {
        message: error?.message,
        leadId: image.lead_id,
      });
      throw error;
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE IMAGE/VIDEO UPLOAD
// ─────────────────────────────────────────────────────────────────────────────

export const uploadSingleImage = async (
  token: string,
  image: CapturedImage
): Promise<boolean> => {
  const isVideo = image.media_type === 'video';
  const fieldName = isVideo
    ? 'Video1'
    : (image.app_column.endsWith('Base64') ? image.app_column.replace(/Base64$/i, '') : image.app_column);
  try {
    console.log(`[Upload] ━━━ Starting: ${image.side} (${isVideo ? 'VIDEO' : 'IMAGE'}) ━━━`);
    console.log(`[Upload] id: ${image.id}, lead: ${image.lead_id}, field: ${fieldName}`);
    await markUploading(image.id);

    // File exists check
    const filePath = image.local_path.replace('file://', '');
    const exists = await RNFS.exists(filePath);
    if (!exists) {
      console.error(`[Upload] ❌ File not found: ${image.local_path}`);
      await markFailed(image.id);
      return false;
    }

    let res: UploadResponse;

    if (isVideo) {
      // VIDEO → multipart/form-data (file directly, no base64)
      res = await uploadVideoApi(token, image);
    } else {
      // IMAGE → multipart/form-data (Expo parity)
      res = await uploadImageApi(token, image);
    }

    if (hasConfirmedSuccess(res, isVideo)) {
      await markUploaded(image.id);
      console.log(`[Upload] ✅ SUCCESS: ${image.side} → ${fieldName} (lead: ${image.lead_id})`);

      // Image uploaded → now submit linked questionnaire answer if any
      if (image.answer_data && image.answer_status === 'pending') {
        await submitAnswerForImage(token, image);
      }

      return true;
    } else {
      const errorFlag = res.ERRORCODE ?? res.ERROR ?? res.Error ?? res.error;
      await markFailed(image.id);
      console.warn(`[Upload] ❌ SERVER REJECTED: ${image.side}`, {
        field: fieldName,
        leadId: image.lead_id,
        status: res.STATUS,
        imagePath: res.IMAGEPATH,
        error: errorFlag,
        message: res.MESSAGE ?? res.Message,
      });
      return false;
    }
  } catch (e: any) {
    await markFailed(image.id);
    console.error(`[Upload] ❌ FAILED: ${image.side} (${fieldName})`, {
      message: e?.message,
      code: e?.code,
      leadId: image.lead_id,
    });
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// BATCH UPLOAD — Parallel upload with concurrency limit
// 3 concurrent uploads — fast but server-friendly
// ─────────────────────────────────────────────────────────────────────────────

// Backend appears to acknowledge concurrent requests for the same lead,
// but some images do not persist. Upload serially to avoid server-side races.
const CONCURRENT_UPLOADS = 1;

let isUploading = false; // Guard — double trigger se bachne ke liye

export const uploadPendingImages = async (
  token: string,
  onProgress?: (uploaded: number, total: number) => void
): Promise<{ uploaded: number; failed: number }> => {
  if (isUploading) {
    console.log('[Upload] Already in progress, skipping...');
    return { uploaded: 0, failed: 0 };
  }

  isUploading = true;
  let uploaded = 0;
  let failed = 0;

  try {
    const pending = await getPendingImages();
    if (pending.length === 0) {
      console.log('[Upload] No pending images.');
      return { uploaded: 0, failed: 0 };
    }

    // ✅ FIX 1: Lead ke hisaab se group karo
    const groupedByLead = pending.reduce((acc, image) => {
      if (!acc[image.lead_id]) acc[image.lead_id] = [];
      acc[image.lead_id].push(image);
      return acc;
    }, {} as Record<string, CapturedImage[]>);

    const totalImages = pending.length;
    console.log(`[Upload] ${totalImages} images, ${Object.keys(groupedByLead).length} leads`);

    // ✅ FIX 2: Ek lead poori complete karo, phir next lead
    for (const [leadId, images] of Object.entries(groupedByLead)) {
      console.log(`[Upload] Lead ${leadId}: ${images.length} images`);

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const success = await uploadSingleImage(token, image);
        if (success) uploaded++;
        else failed++;

        onProgress?.(uploaded, totalImages);

        // ✅ FIX 3: Same lead ki next image se pehle server ko time do
        const isLastImageOfLead = i === images.length - 1;
        if (!isLastImageOfLead) {
          await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
        }
      }

      // ✅ FIX 4: Next lead se pehle aur wait
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
    }

    console.log(`[Upload] Done: ${uploaded} uploaded, ${failed} failed`);
    await submitPendingAnswers(token);

  } finally {
    isUploading = false;
  }

  return { uploaded, failed };
};

// ─────────────────────────────────────────────────────────────────────────────
// PER-LEAD UPLOAD — Submit se pehle sirf ek lead ki images upload karo
// isUploading guard SKIP karta hai — ye urgent sync hai submit se pehle
// ─────────────────────────────────────────────────────────────────────────────

export const uploadPendingImagesForLead = async (
  token: string,
  leadId: string,
  onProgress?: (uploaded: number, total: number) => void
): Promise<{ uploaded: number; failed: number }> => {
  let uploaded = 0;
  let failed = 0;

  try {
    const pending = await getPendingImagesForLead(leadId);

    if (pending.length === 0) {
      console.log(`[Upload] No pending images for lead ${leadId}`);
      return { uploaded: 0, failed: 0 };
    }

    console.log(`[Upload] 🔄 Pre-submit sync: ${pending.length} images for lead ${leadId} (${CONCURRENT_UPLOADS} concurrent)`);

    // Parallel upload in batches — same as main batch upload
for (let i = 0; i < pending.length; i++) {
  const image = pending[i];
  const ok = await uploadSingleImage(token, image);
  if (ok) uploaded++;
  else failed++;
  onProgress?.(uploaded, pending.length);

  // Server ko time do next image se pehle
  if (i < pending.length - 1) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
  }
}

    console.log(`[Upload] Pre-submit done for lead ${leadId}: ${uploaded} uploaded, ${failed} failed`);
  } catch (e) {
    console.error(`[Upload] Pre-submit error for lead ${leadId}:`, e);
  }

  return { uploaded, failed };
};

// ─────────────────────────────────────────────────────────────────────────────
// SAVE IMAGE TO LOCAL STORAGE
// Camera se liya image → RNFS mein save karo
// Returns: local file path (file:// URI)
// ─────────────────────────────────────────────────────────────────────────────

export const saveImageLocally = async (params: {
  leadId: string;
  side: string;
  tempUri: string;   // Camera se mila temporary URI
}): Promise<string> => {
  const { leadId, side, tempUri } = params;

  // App ke documents folder mein save karo (persistent)
  const dir = `${RNFS.DocumentDirectoryPath}/kwikcheck/leads/${leadId}`;

  // Directory create karo agar nahi hai
  const dirExists = await RNFS.exists(dir);
  if (!dirExists) {
    await RNFS.mkdir(dir);
  }

  // File name — side name + timestamp for cache busting on retake
  const safeSideName = side.replace(/\s+/g, '_').toLowerCase();
  const timestamp = Date.now();
  const destPath = `${dir}/${safeSideName}_${timestamp}.jpg`;

  // Delete old file for this side (if retake)
  const dirFiles = await RNFS.readDir(dir);
  for (const f of dirFiles) {
    if (f.name.startsWith(safeSideName) && f.name.endsWith('.jpg') && f.path !== destPath) {
      await RNFS.unlink(f.path).catch(() => {});
    }
  }

  // Copy temp file to permanent location
  const sourcePath = tempUri.replace('file://', '');
  await RNFS.copyFile(sourcePath, destPath);

  console.log(`[ImageSave] Saved ${side} → ${destPath}`);
  return `file://${destPath}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// SAVE VIDEO TO LOCAL STORAGE
// Camera se recorded video → RNFS mein save karo
// Returns: local file path (file:// URI)
// ─────────────────────────────────────────────────────────────────────────────

export const saveVideoLocally = async (params: {
  leadId: string;
  side: string;
  tempUri: string;   // Camera se mila temporary URI
}): Promise<string> => {
  const { leadId, side, tempUri } = params;

  const dir = `${RNFS.DocumentDirectoryPath}/kwikcheck/leads/${leadId}`;

  const dirExists = await RNFS.exists(dir);
  if (!dirExists) {
    await RNFS.mkdir(dir);
  }

  const safeSideName = side.replace(/\s+/g, '_').toLowerCase();
  const timestamp = Date.now();
  const destPath = `${dir}/${safeSideName}_${timestamp}.mp4`;

  // Delete old video for this side (if retake)
  const dirFiles = await RNFS.readDir(dir);
  for (const f of dirFiles) {
    if (f.name.startsWith(safeSideName) && f.name.endsWith('.mp4') && f.path !== destPath) {
      await RNFS.unlink(f.path).catch(() => {});
    }
  }

  // Copy temp file to permanent location
  const sourcePath = tempUri.replace('file://', '');
  await RNFS.copyFile(sourcePath, destPath);

  // Get file size for logging
  const stat = await RNFS.stat(destPath);
  const sizeMB = (Number(stat.size) / 1024 / 1024).toFixed(2);
  console.log(`[VideoSave] Saved ${side} → ${destPath} (${sizeMB} MB)`);
  return `file://${destPath}`;
};