import {
  StyleSheet,
  ToastAndroid,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  FlatList,
  Text,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { COLORS } from "../constants/Colors";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import { useAppStore } from "../store/AppStore";

// ── Offline-first service ──
import {
  getDropdowns,
  submitVehicleDetails,
  fetchCarMMV,
  type DropdownItem,
} from "../services/VehicleDetailService";
import { SyncManager } from "../services/Syncmanager";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface CarData {
  registrationId: string;
  vehicleType: string;
  yearOfManufacture: string;
  make: string;
  model: string;
  variant: string;
  vehicleFuelType: string;
  location: string;
  color: string;
  odometerReading: string;
  ownerName: string;
  HPAStatus: string;
  HPABank: string;
  summary: string;
  chassisNumber: string;
  engineNumber: string;
  customerName: string;
  ownerSerial: string;
  repoDate: any;
  remarks: string;
}

type CarDataKeys =
  | "registrationId"
  | "vehicleType"
  | "yearOfManufacture"
  | "make"
  | "model"
  | "variant"
  | "vehicleFuelType"
  | "location"
  | "color"
  | "odometerReading"
  | "ownerName"
  | "HPAStatus"
  | "HPABank"
  | "chassisNumber"
  | "engineNumber"
  | "customerName"
  | "ownerSerial"
  | "repoDate"
  | "remarks"
  | "summary";

interface RCVahan {
  OwnerName?: string;
  Manufacturedate?: string;
  chassinumber?: string;
  Enginenumber?: string;
  RCOwnerSR?: string;
  VehicleModel?: string;
  color?: string;
}

interface VehicleType extends DropdownItem {
  category: string;
}

// ============ INLINE COMPONENTS ============

const HorizontalBreak = () => <View style={styles.horizontalBreak} />;

interface SelectorProps {
  keyText: string;
  valueText: string;
  disabled?: boolean;
  onPress: () => void;
}

const Selector = ({ keyText, valueText, disabled, onPress }: SelectorProps) => {
  return (
    <TouchableOpacity
      style={[styles.selectorContainer, disabled && styles.selectorDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.selectorLabel}>{keyText}</Text>
      <Text style={styles.selectorValue}>{valueText || "Select..."}</Text>
    </TouchableOpacity>
  );
};

const InputComponent = ({
  placeholder,
  parameter: _parameter,
  onChangeText,
  value,
  disabled = false,
  autoCapitalize = 'characters', // ✅ default to capitals like CreateLeads
  numeric = false,
}: {
  parameter?: string;
  placeholder: string;
  value: string;
  onChangeText: (data: string) => void;
  disabled?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  numeric?: boolean;
}) => {
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        autoCapitalize={disabled ? 'none' : autoCapitalize} // ✅ disabled fields don't need caps
        autoCorrect={false}
        spellCheck={false}          // ✅ stops autocorrect interfering with repeated chars
        keyboardType={numeric ? 'numeric' : 'default'}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const VehicleDetails = ({ route }: { route: any }) => {
  const { carId, leadData, vehicleType, optionalInfoAnswers } = route.params || { carId: "KWC12345" };
  useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAppStore();
  const token = user?.token || "";

  // Use actual registration number from leadData
  const registrationNumber = leadData?.RegNo || leadData?.LeadUId || carId;
  const inferredChassisNumber = (leadData?.ChassisNo || leadData?.chassis_no || leadData?.chassisNumber || "").toString();

  const [filterData, setFilterData] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [carData, setCarData] = useState<CarData>({
    registrationId: registrationNumber,
    vehicleType: "",
    yearOfManufacture: "",
    make: "",
    model: "",
    variant: "",
    vehicleFuelType: "",
    location: "",
    color: "",
    odometerReading: "",
    ownerName: "Neeraj Dave",
    HPAStatus: "",
    HPABank: "",
    summary: "",
    chassisNumber: inferredChassisNumber.toUpperCase(),
    customerName: "",
    engineNumber: "",
    ownerSerial: "",
    repoDate: "",
    remarks: "",
  });
  const [fetchVahanApiData, _setFetchVahanApiData] = useState<RCVahan>({});
  const [colorType, setColorType] = useState<DropdownItem[]>([]);
  const [manualMode, setManualMode] = useState({
    make: false,
    model: false,
    variant: false,
  });
  const [makeType, setMakeType] = useState<string[]>([]);
  const [modelType, setModelType] = useState<string[]>([]);
  const [variantType, setVariantType] = useState<string[]>([]);
  const [vehicleFuelType, setVehicleFuelType] = useState<DropdownItem[]>([]);
  const [vehicleOwnershipType, setVehicleOwnershipType] = useState<VehicleType[]>([]);
  const [bottomSheetData, setBottomSheetData] = useState<{
    key: CarDataKeys;
    value: string[];
  }>();
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMake, setIsLoadingMake] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [isLoadingVariant, setIsLoadingVariant] = useState(false);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [monthYearModalVisible, setMonthYearModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [activeMonthYearField, setActiveMonthYearField] = useState<
    "yearOfManufacture" | "repoDate"
  >("yearOfManufacture");

  const monthOptions = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, index) =>
    String(currentYear - index)
  );

  // variables
  const vehicleTypeCategory = (leadData?.VehicleTypeValue || vehicleType || "").toString();
  const leadTypeName = (leadData?.LeadTypeName || "").toString();

  // ── Network listener ──
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!(state.isConnected && state.isInternetReachable));
    });
    return () => unsubscribe();
  }, []);

const setParam = (param: CarDataKeys, data: string) => {
  setCarData(prev => {
    const updated = { ...prev, [param]: data };

    if (param === 'yearOfManufacture') {
      updated.make = '';
      updated.model = '';
      updated.variant = '';
    }
    if (param === 'make') {
      updated.model = '';
      updated.variant = '';
    }
    if (param === 'model') {
      updated.variant = '';
    }
    return updated;
  });

  // Dropdown lists bhi reset karo
  if (param === 'yearOfManufacture') {
    setMakeType([]);
    setModelType([]);
    setVariantType([]);
  }
  if (param === 'make') {
    setModelType([]);
    setVariantType([]);
  }
  if (param === 'model') {
    setVariantType([]);
  }
};
  const handleSetData = (key: CarDataKeys, value: any) => {
    setCarData(prev => ({ ...prev, [key]: value }));
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
      setFilterData('');  // ✅ Add karo

  };

  const openMonthYearModal = (field: "yearOfManufacture" | "repoDate") => {
    const sourceValue =
      field === "repoDate" ? carData.repoDate : carData.yearOfManufacture;
    const [month, year] = (sourceValue || "").split("/");
    const fallbackMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    const fallbackYear = String(new Date().getFullYear());

    setActiveMonthYearField(field);
    setSelectedMonth(monthOptions.includes(month) ? month : fallbackMonth);
    setSelectedYear(yearOptions.includes(year) ? year : fallbackYear);
    setMonthYearModalVisible(true);
  };

  const closeMonthYearModal = () => {
    setMonthYearModalVisible(false);
  };

  const confirmMonthYearSelection = () => {
    if (!selectedMonth || !selectedYear) {
      ToastAndroid.show("Please select month and year", ToastAndroid.SHORT);
      return;
    }
    setParam(activeMonthYearField, `${selectedMonth}/${selectedYear}`);
    closeMonthYearModal();
  };

  const doesExist = (data?: string) => {
    return !!data && data.length !== 0;
  };

  // ── Dropdowns — Offline-first (cached locally) ──
  const fetchDropDowns = useCallback(async () => {
    if (!vehicleTypeCategory) return;
    setIsLoadingDropdowns(true);
    try {
      const [colors, ownership, fuel] = await Promise.all([
        getDropdowns(token, "ColorsType", vehicleTypeCategory),
        getDropdowns(token, "VehicleTypeMode", vehicleTypeCategory),
        getDropdowns(token, "FuelType", vehicleTypeCategory),
      ]);

      setColorType(colors || []);
      setVehicleOwnershipType((ownership || []) as VehicleType[]);
      setVehicleFuelType(fuel || []);
    } finally {
      setIsLoadingDropdowns(false);
    }
  }, [vehicleTypeCategory, token]);

  // ── CarMMV — Cache-as-you-go ──
  const carMMV = useCallback(async (request: {
    Year: string;
    Make: string;
    Model: string;
    ActionType: string;
    Variant: string;
  }) => {
    try {
      const resp = await fetchCarMMV(token, {
        ...request,
        LeadId: carId,
      });
      return resp || [];
    } catch (error) {
      console.error("CarMMV error:", error);
      return [];
    }
  }, [carId, token]);

  useEffect(() => {
    fetchDropDowns();
  }, [fetchDropDowns]);

  useEffect(() => {
    const fetchData = async () => {
      if (!carData.yearOfManufacture) return;

      const year = carData.yearOfManufacture.split("/")[1] || "";
      if (!year) return;

      setIsLoadingMake(true);
      try {
        const resp = await carMMV({
          Year: year,
          Make: "",
          Model: "",
          Variant: "",
          ActionType: "YEAR",
        });

        if (Array.isArray(resp) && resp.length) {
          setMakeType(resp.map((item: any) => item.name));
          setManualMode(prev => ({ ...prev, make: false }));
        }
      } finally {
        setIsLoadingMake(false);
      }
    };

    fetchData();
  }, [carData.yearOfManufacture, carMMV]);

  useEffect(() => {
    const fetchData = async () => {
      if (!carData.make) return;

      const year = carData.yearOfManufacture.split("/")[1] || "";
      if (!year) return;

      setIsLoadingModel(true);
      try {
        const resp = await carMMV({
          Year: year,
          Make: carData.make,
          Model: "",
          Variant: "",
          ActionType: "Make",
        });

        if (Array.isArray(resp) && resp.length) {
          setModelType(resp.map((item: any) => item.name));
          setManualMode(prev => ({ ...prev, model: false }));
        }
      } finally {
        setIsLoadingModel(false);
      }
    };

    fetchData();
  }, [carData.make, carData.yearOfManufacture, carMMV]);

  useEffect(() => {
    const fetchData = async () => {
      if (!carData.model) return;

      const year = carData.yearOfManufacture.split("/")[1] || "";
      if (!year) return;

      setIsLoadingVariant(true);
      try {
        const resp = await carMMV({
          Year: year,
          Make: carData.make,
          Model: carData.model,
          Variant: "",
          ActionType: "Model",
        });

        if (Array.isArray(resp) && resp.length) {
          setVariantType(resp.map((item: any) => item.name));
          setManualMode(prev => ({ ...prev, variant: false }));
        }
      } finally {
        setIsLoadingVariant(false);
      }
    };

    fetchData();
  }, [carData.model, carData.make, carData.yearOfManufacture, carMMV]);

  useEffect(() => {
    const backAction = () => {
      if (monthYearModalVisible) {
        closeMonthYearModal();
        return true;
      }
      if (modalVisible) {
        closeModal();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [modalVisible, monthYearModalVisible]);

  // ── Auto-sync modal data when source arrays update while modal is open ──
  useEffect(() => {
    if (!modalVisible || !bottomSheetData?.key) return;
    const dataMap: Record<string, string[]> = {
      make: makeType,
      model: modelType,
      variant: variantType,
      vehicleType: vehicleOwnershipType.map(i => i.name),
      vehicleFuelType: vehicleFuelType.map(i => i.name),
      color: colorType.map(i => i.name),
    };
    const newData = dataMap[bottomSheetData.key];
    if (newData) {
      setBottomSheetData(prev => prev ? { ...prev, value: newData } : prev);
    }
  }, [modalVisible, bottomSheetData?.key, makeType, modelType, variantType, vehicleOwnershipType, vehicleFuelType, colorType]);

  // ── Submit — Online direct / Offline queue ──
  const HandleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const chassisNumber = (fetchVahanApiData.chassinumber || carData.chassisNumber || leadData?.ChassisNo || leadData?.chassis_no || leadData?.chassisNumber || "").toString().toUpperCase();
      const engineNumber = fetchVahanApiData.Enginenumber || carData.engineNumber;
      const customerName = fetchVahanApiData.OwnerName || carData.customerName;
      const yearOfManufacture = fetchVahanApiData.Manufacturedate || carData.yearOfManufacture;
      const ownerSerial = fetchVahanApiData.RCOwnerSR || carData.ownerSerial;
      const color = fetchVahanApiData.color || carData.color;

      if (
        !color ||
        !carData.vehicleType ||
        !carData.vehicleFuelType ||
        !customerName ||
        !yearOfManufacture ||
        !carData.make ||
        !carData.model ||
        !carData.variant ||
        !engineNumber ||
        !ownerSerial
      ) {
        ToastAndroid.show("Please fill all the fields", ToastAndroid.LONG);
        return;
      }

      const colorId = colorType.find((item) => item.name === color)?.id;
      const fuelTypeId = vehicleFuelType.find(
        (item) => item.name === carData.vehicleFuelType
      )?.id;
      const vehicleTypeModeId = vehicleOwnershipType.find(
        (item) => item.name === carData.vehicleType
      )?.id;

      const vehicleModel = `${carData.model} ${carData.variant}`.trim();

      // ── Pre-submit: Image upload is handled by SyncManager ─────────────────
      const currentLeadId = String(leadData?.Id || carId);

      // ── Optional info answers → bundled with main payload for offline queue ──
      // (will be submitted by SyncManager after all images are uploaded)

      const payload = {
        Id: 1,
        LeadId: leadData?.Id || carId,
        FuelTypeId: fuelTypeId,
        ColorsTypeId: colorId,
        VehicleTypeModeId: vehicleTypeModeId,
        Summary: carData.remarks,
        LeadList: {
          ProspectNo: leadData?.ProspectNo,
          CustomerName: customerName,
          CustomerMobileNo: leadData?.CustomerMobileNo,
          Vehicle: leadData?.VehicleType || leadData?.VehicleTypeValue,
          ManufactureDate: yearOfManufacture,
          ChassisNo: chassisNumber,
          EngineNo: engineNumber,
          RepoDate: carData.repoDate,
          MakeCompany: carData.make,
          VehicleModel: vehicleModel,
        },
        MMVTable: {
          ProspectNo: leadData?.ProspectNo,
          CustomerName: customerName,
          OwnerName: customerName,
          CustomerMobileNo: leadData?.CustomerMobileNo,
          MobileNo: leadData?.CustomerMobileNo,
          Vehicle: leadData?.VehicleType || leadData?.VehicleTypeValue,
          VehicleCategory: leadData?.VehicleType || leadData?.VehicleTypeValue,
          ManufactureDate: yearOfManufacture,
          Manufacturedate: yearOfManufacture,
          ChassisNo: chassisNumber,
          chassinumber: chassisNumber,
          EngineNo: engineNumber,
          Enginenumber: engineNumber,
          MakeCompany: carData.make,
          VehicleModel: vehicleModel,
        },
        LeadStatus: "5",
      };

      const result = await submitVehicleDetails(token, payload, currentLeadId, optionalInfoAnswers);

      if (result.success) {
        ToastAndroid.show(result.message, ToastAndroid.LONG);
        // Vehicle details queue mein gaya, ab SyncManager ko bolo upload karo
        SyncManager.kick();
        navigation.pop(2);
      } else {
        ToastAndroid.show(result.message, ToastAndroid.LONG);
      }
    } catch (error) {
      console.log(error);
      ToastAndroid.show("Error saving data", ToastAndroid.SHORT);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Offline indicator */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>Offline Mode</Text>
          </View>
        )}

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        >
        <View>
          {/* <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <FontAwesome6 name="arrow-left" size={20} color={"white"} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Vehicle Details</Text>
          </View> */}
          {/* <TouchableOpacity
            style={[
              styles.fetchVahanBtn,
              (isFetchingVahan || !isOnline) && styles.fetchVahanBtnDisabled,
            ]}
            onPress={FetchVahan}
            disabled={isFetchingVahan || !isOnline}
            activeOpacity={0.7}
          >
            <Text></Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.formContainer}>
          <InputComponent
            parameter="registrationId"
            placeholder="Registration Number"
            disabled
            onChangeText={(text) =>
              setParam("registrationId", text)
            }
            value={carData.registrationId}
          />

          <Selector
            keyText="Year of Manufacturing"
            valueText={
              fetchVahanApiData.Manufacturedate
                ? fetchVahanApiData.Manufacturedate
                : carData.yearOfManufacture
            }
            disabled={doesExist(fetchVahanApiData.Manufacturedate)}
            onPress={() => openMonthYearModal("yearOfManufacture")}
          />
          <HorizontalBreak />
          {fetchVahanApiData.VehicleModel && (
            <>
              <InputComponent
                parameter="vehicleModel"
                disabled
                value={fetchVahanApiData.VehicleModel}
                onChangeText={() => { }}
                placeholder=""
              />
              <HorizontalBreak />
            </>
          )}
          {manualMode.make ? (
            <View style={styles.inputWrapper}>
              <Text style={styles.manualInputLabel}>Make (Manual)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Make (e.g. MARUTI)"
                placeholderTextColor="#999"
                value={carData.make}
                onChangeText={(text) => setParam("make", text)}
                autoCapitalize="characters"
                autoCorrect={false}
                  spellCheck={false}           // ✅ add this

              />
              <TouchableOpacity
                style={styles.manualCancelBtn}
                onPress={() => setManualMode(prev => ({ ...prev, make: false }))}
              >
                <Text style={styles.manualCancelText}>Try dropdown again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Selector
              keyText="Make"
              valueText={carData.make}
              onPress={() => {
                if (!carData.yearOfManufacture) {
                  ToastAndroid.show("Please select Year of Manufacturing first", ToastAndroid.LONG);
                  return;
                }
                if (makeType.length) {
                  openModal();
                  setBottomSheetData({ key: "make", value: makeType });
                  return;
                }
                if (isLoadingMake) {
                  openModal();
                  setBottomSheetData({ key: "make", value: [] });
                  return;
                }
                if (!isOnline) {
                  ToastAndroid.show("Offline — enter make manually", ToastAndroid.SHORT);
                  setManualMode(prev => ({ ...prev, make: true }));
                  return;
                }
                ToastAndroid.show("No makes available. Please try again.", ToastAndroid.LONG);
              }}
            />
          )}

          <HorizontalBreak />

          {manualMode.model ? (
            <View style={styles.inputWrapper}>
              <Text style={styles.manualInputLabel}>Model (Manual)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Model (e.g. SWIFT)"
                placeholderTextColor="#999"
                value={carData.model}
                onChangeText={(text) => setParam("model", text)}
                autoCapitalize="characters"
                autoCorrect={false}
                  spellCheck={false}           // ✅ add this

              />
              <TouchableOpacity
                style={styles.manualCancelBtn}
                onPress={() => setManualMode(prev => ({ ...prev, model: false }))}
              >
                <Text style={styles.manualCancelText}>Try dropdown again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Selector
              keyText="Model"
              valueText={carData.model}
              onPress={() => {
                if (!carData.make) {
                  ToastAndroid.show("Please select Make first", ToastAndroid.LONG);
                  return;
                }
                if (modelType.length) {
                  openModal();
                  setBottomSheetData({ key: "model", value: modelType });
                  return;
                }
                if (isLoadingModel) {
                  openModal();
                  setBottomSheetData({ key: "model", value: [] });
                  return;
                }
                if (!isOnline) {
                  ToastAndroid.show("Offline — enter model manually", ToastAndroid.SHORT);
                  setManualMode(prev => ({ ...prev, model: true }));
                  return;
                }
                ToastAndroid.show("No models available. Please try again.", ToastAndroid.LONG);
              }}
            />
          )}

          <HorizontalBreak />

          {manualMode.variant ? (
            <View style={styles.inputWrapper}>
              <Text style={styles.manualInputLabel}>Variant (Manual)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Variant (e.g. VXI)"
                placeholderTextColor="#999"
                value={carData.variant}
                onChangeText={(text) => setParam("variant", text)}
                autoCapitalize="characters"
                autoCorrect={false}
                spellCheck={false}
              />
              <TouchableOpacity
                style={styles.manualCancelBtn}
                onPress={() => setManualMode(prev => ({ ...prev, variant: false }))}
              >
                <Text style={styles.manualCancelText}>Try dropdown again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Selector
              keyText="Variant"
              valueText={carData.variant}
              onPress={() => {
                if (!carData.model) {
                  ToastAndroid.show("Please select Model first", ToastAndroid.LONG);
                  return;
                }
                if (variantType.length) {
                  openModal();
                  setBottomSheetData({ key: "variant", value: variantType });
                  return;
                }
                if (isLoadingVariant) {
                  openModal();
                  setBottomSheetData({ key: "variant", value: [] });
                  return;
                }
                if (!isOnline) {
                  ToastAndroid.show("Offline — enter variant manually", ToastAndroid.SHORT);
                  setManualMode(prev => ({ ...prev, variant: true }));
                  return;
                }
                ToastAndroid.show("No variants available. Please try again.", ToastAndroid.LONG);
              }}
            />
          )}

          <HorizontalBreak />
          <Selector
            keyText="Vehicle Type"
            valueText={carData.vehicleType}
            onPress={() => {
              if (!carData.variant) {
                ToastAndroid.show("Please select Variant first", ToastAndroid.LONG);
                return;
              }
              if (!vehicleOwnershipType.length) {
                if (isLoadingDropdowns) {
                  openModal();
                  setBottomSheetData({ key: "vehicleType", value: [] });
                  return;
                }
                ToastAndroid.show("No vehicle types available. Please try again.", ToastAndroid.LONG);
                return;
              }
              openModal();
              setBottomSheetData({
                key: "vehicleType",
                value: vehicleOwnershipType.map((item) => item.name),
              });
            }}
          />

          <HorizontalBreak />
          <Selector
            keyText="Fuel Type"
            valueText={carData.vehicleFuelType}
            onPress={() => {
              if (!carData.vehicleType) {
                ToastAndroid.show(
                  "Please select Vehicle Type first",
                  ToastAndroid.LONG
                );
                return;
              }
              if (!vehicleFuelType.length) {
                if (isLoadingDropdowns) {
                  openModal();
                  setBottomSheetData({ key: "vehicleFuelType", value: [] });
                  return;
                }
                ToastAndroid.show("No fuel types available. Please try again.", ToastAndroid.LONG);
                return;
              }
              openModal();
              setBottomSheetData({
                key: "vehicleFuelType",
                value: vehicleFuelType.map((item) => item.name),
              });
            }}
          />

          <HorizontalBreak />
          <InputComponent
            parameter="engineNumber"
            disabled={doesExist(fetchVahanApiData.Enginenumber)}
            placeholder="Engine Number"
            onChangeText={(text) => setParam("engineNumber", text)}
            value={
              fetchVahanApiData.Enginenumber
                ? fetchVahanApiData.Enginenumber
                : carData.engineNumber
            }
          />

          <InputComponent
            disabled={doesExist(fetchVahanApiData.OwnerName)}
            placeholder="Customer Name"
            onChangeText={(text) => setParam("customerName", text)}
            value={
              fetchVahanApiData.OwnerName
                ? fetchVahanApiData.OwnerName
                : carData.customerName
            }
          />

          <Selector
            keyText="Owner Serial"
            disabled={doesExist(fetchVahanApiData.RCOwnerSR)}
            valueText={
              fetchVahanApiData.RCOwnerSR
                ? fetchVahanApiData.RCOwnerSR
                : carData.ownerSerial
            }
            onPress={() => {
              openModal();
              setBottomSheetData({
                key: "ownerSerial",
                value: [
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10",
                  "11",
                  "12",
                ],
              });
            }}
          />

          <HorizontalBreak />
          <Selector
            keyText="Color"
            disabled={doesExist(fetchVahanApiData.color)}
            valueText={
              fetchVahanApiData.color ? fetchVahanApiData.color : carData.color
            }
            onPress={() => {
              if (!colorType.length) {
                if (isLoadingDropdowns) {
                  openModal();
                  setBottomSheetData({ key: "color", value: [] });
                  return;
                }
                ToastAndroid.show("No colors available. Please try again.", ToastAndroid.LONG);
                return;
              }
              openModal();
              setBottomSheetData({
                key: "color",
                value: colorType.map((item) => item.name),
              });
            }}
          />
          <HorizontalBreak />

          {(carData.vehicleType.toLowerCase() === "repo" ||
            leadTypeName.toLowerCase() === "repo") && (
              <>
                <Selector
                  keyText="Repo Date"
                  valueText={carData.repoDate}
                  onPress={() => openMonthYearModal("repoDate")}
                />
                <HorizontalBreak />
              </>
            )}

          <View style={styles.textAreaWrapper}>
            <TextInput  
              style={styles.textArea}
              multiline
              placeholder="Remarks"
              placeholderTextColor="#999"
              autoCapitalize="sentences"
              autoCorrect={false}
              value={carData.remarks}
              onChangeText={(e) => {
                setParam("remarks", e);
              }}
              spellCheck={false}           // ✅ add this
            />
          </View>

          <TouchableOpacity
            onPress={HandleSubmit}
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            activeOpacity={0.7}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal for selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />

            <View style={styles.searchInputWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#999"
                maxLength={50}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(value) => setFilterData(value)}
                value={filterData}
              />
            </View>

            <FlatList
              initialNumToRender={5}
              maxToRenderPerBatch={10}
              windowSize={10}
              removeClippedSubviews
              style={styles.flatList}
              data={bottomSheetData?.value.filter((item) =>
                item?.toLowerCase()?.includes(filterData.toLowerCase())
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    if (!bottomSheetData?.key) {
                      ToastAndroid.show(
                        "Something went wrong while saving data",
                        ToastAndroid.SHORT
                      );
                      return;
                    }
                    handleSetData(bottomSheetData?.key, item);
                    closeModal();
                    setFilterData("");
                  }}
                >
                  <Text style={styles.listItemText}>
                    {item.replaceAll("(Client)", "")}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(_, index) => index.toString()}
              ListEmptyComponent={
                (bottomSheetData?.key === 'make' && isLoadingMake) ||
                (bottomSheetData?.key === 'model' && isLoadingModel) ||
                (bottomSheetData?.key === 'variant' && isLoadingVariant) ||
                (['vehicleType', 'vehicleFuelType', 'color'].includes(bottomSheetData?.key || '') && isLoadingDropdowns)
                  ? <View style={styles.modalLoaderContainer}><ActivityIndicator size="large" color={COLORS.AppTheme.primary} /><Text style={styles.modalLoaderText}>Loading...</Text></View>
                  : <Text style={styles.modalEmptyText}>No results</Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={monthYearModalVisible}
        onRequestClose={closeMonthYearModal}
      >
        <TouchableOpacity
          style={styles.monthYearModalOverlay}
          activeOpacity={1}
          onPress={closeMonthYearModal}
        >
          <TouchableOpacity
            style={styles.monthYearModalCard}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.monthYearTitle}>Select Month and Year</Text>

            <View style={styles.monthYearListsRow}>
              <View style={styles.monthYearListContainer}>
                <Text style={styles.monthYearListLabel}>Month</Text>
                <ScrollView
                  style={styles.monthYearList}
                  showsVerticalScrollIndicator={false}
                >
                  {monthOptions.map((month) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.monthYearItem,
                        selectedMonth === month && styles.monthYearItemSelected,
                      ]}
                      onPress={() => setSelectedMonth(month)}
                    >
                      <Text
                        style={[
                          styles.monthYearItemText,
                          selectedMonth === month && styles.monthYearItemTextSelected,
                        ]}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.monthYearListContainer}>
                <Text style={styles.monthYearListLabel}>Year</Text>
                <ScrollView
                  style={styles.monthYearList}
                  showsVerticalScrollIndicator={false}
                >
                  {yearOptions.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.monthYearItem,
                        selectedYear === year && styles.monthYearItemSelected,
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text
                        style={[
                          styles.monthYearItemText,
                          selectedYear === year && styles.monthYearItemTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.monthYearActionRow}>
              <TouchableOpacity
                style={[styles.monthYearActionButton, styles.monthYearCancelButton]}
                onPress={closeMonthYearModal}
              >
                <Text style={styles.monthYearCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.monthYearActionButton, styles.monthYearConfirmButton]}
                onPress={confirmMonthYearSelection}
              >
                <Text style={styles.monthYearConfirmText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default VehicleDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.AppTheme.primaryBg,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  offlineBanner: {
    backgroundColor: '#FF9800',
    paddingVertical: 6,
    alignItems: 'center',
  },
  offlineBannerText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.AppTheme.primaryBg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  fetchVahanBtn: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  fetchVahanBtnDisabled: {
    opacity: 0.6,
  },
  fetchVahanText: {
    color: "black",
    fontSize: 15,
    fontWeight: "500",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  horizontalBreak: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
  selectorContainer: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: COLORS.Dashboard.bg.Grey,
    borderRadius: 8,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorDisabled: {
    opacity: 0.6,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.AppTheme.primary,
  },
  selectorValue: {
    fontSize: 14,
    color: "#666",
    maxWidth: "50%",
    textAlign: "right",
  },
  detailsListContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  detailsListCell: {
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 50,
    paddingHorizontal: 8,
  },
  detailsListHeader: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  detailsListValue: {
    fontSize: 16,
    paddingLeft: 8,
  },
  inputWrapper: {
    marginVertical: 7,
    width: "100%",
  },
  input: {
    backgroundColor: COLORS.Dashboard.bg.Grey,
    borderWidth: 0,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  manualInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.AppTheme.primary,
    marginBottom: 4,
    paddingLeft: 4,
  },
  manualCancelBtn: {
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  manualCancelText: {
    fontSize: 12,
    color: COLORS.AppTheme.primary,
    textDecorationLine: 'underline',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  textAreaWrapper: {
    marginVertical: 7,
    width: "100%",
  },
  textArea: {
    backgroundColor: COLORS.Dashboard.bg.Grey,
    borderWidth: 0,
    minHeight: 100,
    maxHeight: 150,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: COLORS.AppTheme.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '50%',
    padding: 20,
    elevation: 5,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  searchInputWrapper: {
    width: "100%",
    marginVertical: 10,
  },
  searchInput: {
    backgroundColor: COLORS.Dashboard.bg.Grey,
    borderWidth: 0,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  flatList: {
    width: "100%",
    flex: 1,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  listItemText: {
    textAlign: "center",
    fontSize: 16,
    textTransform: "capitalize",
    color: "#333",
  },
  modalLoaderContainer: {
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },
  modalLoaderText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  modalEmptyText: {
    textAlign: 'center',
    padding: 24,
    color: '#9ca3af',
  },
  monthYearModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  monthYearModalCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    maxHeight: '75%',
  },
  monthYearTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  monthYearListsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  monthYearListContainer: {
    flex: 1,
  },
  monthYearListLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  monthYearList: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    maxHeight: 240,
  },
  monthYearItem: {
    paddingVertical: 10,
    marginHorizontal: 8,
    marginVertical: 3,
    borderRadius: 8,
    alignItems: 'center',
  },
  monthYearItemSelected: {
    backgroundColor: COLORS.AppTheme.primary,
  },
  monthYearItemText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  monthYearItemTextSelected: {
    color: 'white',
  },
  monthYearActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 10,
  },
  monthYearActionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  monthYearCancelButton: {
    backgroundColor: '#e5e7eb',
  },
  monthYearConfirmButton: {
    backgroundColor: COLORS.AppTheme.primary,
  },
  monthYearCancelText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  monthYearConfirmText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
});
