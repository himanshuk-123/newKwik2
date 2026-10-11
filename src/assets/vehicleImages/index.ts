/**
 * vehicleImages/index.ts
 * Vehicle-type card custom AI images mapper (2W, 3W, 4W, CV, etc.)
 */

// ── 2W (TWO WHEELER) ─────────────────────────────────────────────────────────
export const TWO_WHEELER_IMAGES = {
  frontView: require('./2WImages/01_front_view.png'),
  rearView: require('./2WImages/02_rear_view.png'),
  leftSide: require('./2WImages/03_left_side_view.png'),
  rightSide: require('./2WImages/04_right_side_view.png'),
  odometer: require('./2WImages/05_odometer_speedometer.png'),
  frontTyre: require('./2WImages/06_front_tyre.png'),
  rearTyre: require('./2WImages/07_rear_tyre.png'),
  engineBlock: require('./2WImages/08_engine_block.png'),
  chassisVin: require('./2WImages/09_chassis_vin.png'),
  fuelTank: require('./2WImages/10_fuel_tank.png'),
  seatStorage: require('./2WImages/11_seat_storage.png'),
  rcDocuments: require('./2WImages/12_rc_documents.png'),
  topView: require('./2WImages/13_top_view.png'),
  valuatorSelfie: require('./2WImages/14_valuator_selfie.png'),
};

// ── 3W (THREE WHEELER) ───────────────────────────────────────────────────────
export const THREE_WHEELER_IMAGES = {
  frontView: require('./3WImages/01_front_view.png'),
  rearView: require('./3WImages/02_rear_view.png'),
  leftSide: require('./3WImages/03_left_side_view.png'),
  rightSide: require('./3WImages/04_right_side_view.png'),
  dashboard: require('./3WImages/05_dashboard_odometer.png'),
  frontTyre: require('./3WImages/06_front_tyre.png'),
  rearLeftTyre: require('./3WImages/07_rear_left_tyre.png'),
  rearRightTyre: require('./3WImages/08_rear_right_tyre.png'),
  engineMotor: require('./3WImages/09_engine_motor.png'),
  chassisVin: require('./3WImages/10_chassis_vin.png'),
  passengerCabin: require('./3WImages/11_passenger_cabin.png'),
  rcDocuments: require('./3WImages/12_rc_documents.png'),
  valuatorSelfie: require('./3WImages/13_valuator_selfie.png'),
};

// ── 4W (FOUR WHEELER / CAR) ───────────────────────────────────────────────────
export const FOUR_WHEELER_IMAGES = {
  frontView: require('./4WImages/01_front_view.png'),
  backView: require('./4WImages/02_back_view.png'),
  leftSide: require('./4WImages/03_left_side.png'),
  rightSide: require('./4WImages/04_right_side.png'),
  engineView: require('./4WImages/05_engine_view.png'),
  chassisImprint: require('./4WImages/06_chassis_imprint.png'),
  chassisPlate: require('./4WImages/07_chassis_plate.png'),
  odometer: require('./4WImages/08_odometer.png'),
  dashboardFrontSeats: require('./4WImages/09_dashboard_front_seats.png'),
  rearSideSeats: require('./4WImages/10_rear_side_seats.png'),
  frontRightTyre: require('./4WImages/11_front_right_tyre.png'),
  frontLeftTyre: require('./4WImages/12_front_left_tyre.png'),
  rearRightTyre: require('./4WImages/13_rear_right_tyre.png'),
  rearLeftTyre: require('./4WImages/14_rear_left_tyre.png'),
  valuatorSelfie: require('./4WImages/15_valuator_selfie.png'),
};

// ── CV (COMMERCIAL VEHICLE / BUS / TRUCK / LCV / HCV) ───────────────────────────
export const CV_IMAGES = {
  frontSide: require('./CVIcons/01_front_side.png'),
  backSide: require('./CVIcons/02_back_side.png'),
  leftSide: require('./CVIcons/03_left_side.png'),
  rightSide: require('./CVIcons/04_right_side.png'),
  engineView: require('./CVIcons/05_engine_view.png'),
  chassisImprint: require('./CVIcons/06_chassis_imprint.png'),
  chassisPlate: require('./CVIcons/07_chassis_plate.png'),
  odometer: require('./CVIcons/08_odometer.png'),
  dashboard: require('./CVIcons/09_dashboard.png'),
  frontRightTyre: require('./CVIcons/10_front_right_tyre.png'),
  frontLeftTyre: require('./CVIcons/11_front_left_tyre.png'),
  rearRightTyre: require('./CVIcons/12_rear_right_tyre.png'),
  rearLeftTyre: require('./CVIcons/13_rear_left_tyre.png'),
  frontUnderCarriage: require('./CVIcons/14_front_under_carriage.png'),
  rearUnderCarriage: require('./CVIcons/15_rear_under_carriage.png'),
  valuatorSelfie: require('./CVIcons/16_valuator_selfie.png'),
};

export const COMMERCIAL_VEHICLE_IMAGES = CV_IMAGES;

// ── CE (CONSTRUCTION EQUIPMENT / JCB / EXCAVATOR / CRANE / LOADER) ───────────────
export const CE_IMAGES = {
  frontSide: require('./CEIcons/01_front_side.png'),
  backSide: require('./CEIcons/02_back_side.png'),
  leftSide: require('./CEIcons/03_left_side.png'),
  rightSide: require('./CEIcons/04_right_side.png'),
  engineView: require('./CEIcons/05_engine_view.png'),
  chassisImprint: require('./CEIcons/06_chassis_imprint.png'),
  chassisPlate: require('./CEIcons/07_chassis_plate.png'),
  odometer: require('./CEIcons/08_odometer.png'),
  dashboard: require('./CEIcons/09_dashboard.png'),
  operatorSeat: require('./CEIcons/10_operator_seat.png'),
  frontRightTyre: require('./CEIcons/11_front_right_tyre.png'),
  frontLeftTyre: require('./CEIcons/12_front_left_tyre.png'),
  rearRightTyre: require('./CEIcons/13_rear_right_tyre.png'),
  rearLeftTyre: require('./CEIcons/14_rear_left_tyre.png'),
  frontUnderCarriage: require('./CEIcons/15_front_under_carriage.png'),
  rearUnderCarriage: require('./CEIcons/16_rear_under_carriage.png'),
  valuatorSelfie: require('./CEIcons/17_valuator_selfie.png'),
};

export const CONSTRUCTION_EQUIPMENT_IMAGES = CE_IMAGES;

// ── FE (FARM EQUIPMENT / TRACTOR / HARVESTER / AGRI) ───────────────────────────
export const FE_IMAGES = {
  frontSide: require('./FEIcons/01_front_side.png'),
  backSide: require('./FEIcons/02_back_side.png'),
  leftSide: require('./FEIcons/03_left_side.png'),
  rightSide: require('./FEIcons/04_right_side.png'),
  engineView: require('./FEIcons/05_engine_view.png'),
  chassisImprint: require('./FEIcons/06_chassis_imprint.png'),
  chassisPlate: require('./FEIcons/07_chassis_plate.png'),
  odometer: require('./FEIcons/08_odometer.png'),
  dashboard: require('./FEIcons/09_dashboard.png'),
  driverSeat: require('./FEIcons/10_driver_seat.png'),
  frontRightTyre: require('./FEIcons/11_front_right_tyre.png'),
  frontLeftTyre: require('./FEIcons/12_front_left_tyre.png'),
  rearRightTyre: require('./FEIcons/13_rear_right_tyre.png'),
  rearLeftTyre: require('./FEIcons/14_rear_left_tyre.png'),
  frontUnderCarriage: require('./FEIcons/15_front_under_carriage.png'),
  rearUnderCarriage: require('./FEIcons/16_rear_under_carriage.png'),
  valuatorSelfie: require('./FEIcons/17_valuator_selfie.png'),
};

export const FARM_EQUIPMENT_IMAGES = FE_IMAGES;
export const TRACTOR_IMAGES = FE_IMAGES;

/**
 * Returns custom AI card image asset for vehicle type and step name.
 * Falls back to null if no custom image is defined (allowing default vector icon fallback).
 */
export const getVehicleCardImage = (cardName: string, vehicleType: string) => {
  const vType = (vehicleType || '').toUpperCase().trim();
  const n = (cardName || '').toLowerCase().trim();

  const is3W = vType.includes('3W') || vType.includes('THREE') || vType === 'AUTO' || vType === 'RICKSHAW';
  const is4W = vType.includes('4W') || vType.includes('FOUR') || vType.includes('CAR');
  const isCV = vType.includes('CV') || vType.includes('COMMERCIAL') || vType.includes('TRUCK') || vType.includes('BUS') || vType.includes('LCV') || vType.includes('HCV') || vType.includes('MHCV');
  const isFE = vType.includes('FE') || vType.includes('FARM') || vType.includes('TRACTOR') || vType.includes('HARVESTER') || vType.includes('AGRI');
  const isCE = vType.includes('CE') || vType.includes('CONSTRUCTION') || vType.includes('EQUIPMENT') || vType.includes('JCB') || vType.includes('EXCAVATOR') || vType.includes('CRANE') || vType.includes('LOADER') || vType.includes('BULLDOZER') || vType.includes('ROLLER');

  // ── 3W (Three Wheeler) ──────────────────────────────────────────────────────
  if (is3W) {
    // 0. Selfie / Valuator Selfie
    if (n.includes('selfie') || n.includes('valuator') || n.includes('inspector') || n.includes('user photo') || n.includes('profile')) {
      return THREE_WHEELER_IMAGES.valuatorSelfie;
    }

    // 1. Dashboard / Speedometer / Odometer / Meter
    if (
      n.includes('odometer') ||
      n.includes('odmeter') ||
      n.includes('speedometer') ||
      n.includes('dashboard') ||
      n.includes('meter')
    ) {
      return THREE_WHEELER_IMAGES.dashboard;
    }

    // 2. Tyres (Front vs Rear Left vs Rear Right vs general)
    if (
      (n.includes('front') || n.includes('frnt')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return THREE_WHEELER_IMAGES.frontTyre;
    }
    if (
      (n.includes('rear left') || n.includes('back left') || n.includes('left rear') || n.includes('lhs tyre') || n.includes('tyre 3') || n.includes('tyre3')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return THREE_WHEELER_IMAGES.rearLeftTyre;
    }
    if (
      (n.includes('rear right') || n.includes('back right') || n.includes('right rear') || n.includes('rhs tyre') || n.includes('tyre 4') || n.includes('tyre4')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return THREE_WHEELER_IMAGES.rearRightTyre;
    }
    if (
      (n.includes('rear') || n.includes('back')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return THREE_WHEELER_IMAGES.rearLeftTyre;
    }
    if (n.includes('tyre') || n.includes('tire') || n.includes('wheel')) {
      return THREE_WHEELER_IMAGES.frontTyre;
    }

    // 3. Engine / Motor
    if (n.includes('engine') || n.includes('eng') || n.includes('motor') || n.includes('battery')) {
      return THREE_WHEELER_IMAGES.engineMotor;
    }

    // 4. Chassis / VIN / Plate / Stamper
    if (
      n.includes('chassis') ||
      n.includes('vin') ||
      n.includes('plate') ||
      n.includes('imprint') ||
      n.includes('stamper') ||
      n.includes('frame')
    ) {
      return THREE_WHEELER_IMAGES.chassisVin;
    }

    // 5. Passenger Cabin / Interior / Seating
    if (
      n.includes('passenger') ||
      n.includes('cabin') ||
      n.includes('interior') ||
      n.includes('seat') ||
      n.includes('canopy') ||
      n.includes('seating')
    ) {
      return THREE_WHEELER_IMAGES.passengerCabin;
    }

    // 6. RC / Documents
    if (
      n.includes('rc') ||
      n.includes('document') ||
      n.includes('doc') ||
      n.includes('registration') ||
      n.includes('certificate') ||
      n.includes('paper')
    ) {
      return THREE_WHEELER_IMAGES.rcDocuments;
    }

    // 7. Views / Sides (Left, Right, Rear/Back, Front)
    if (
      n.includes('left side') ||
      n.includes('left view') ||
      n.includes('left angle') ||
      n.includes('left') ||
      n.includes('lhs')
    ) {
      return THREE_WHEELER_IMAGES.leftSide;
    }
    if (
      n.includes('right side') ||
      n.includes('right view') ||
      n.includes('right angle') ||
      n.includes('right') ||
      n.includes('rhs')
    ) {
      return THREE_WHEELER_IMAGES.rightSide;
    }
    if (
      n.includes('rear side') ||
      n.includes('rear view') ||
      n.includes('rear angle') ||
      n.includes('back side') ||
      n.includes('back view') ||
      n.includes('back angle') ||
      n.includes('rear') ||
      n.includes('back')
    ) {
      return THREE_WHEELER_IMAGES.rearView;
    }
    if (
      n.includes('front side') ||
      n.includes('front view') ||
      n.includes('front angle') ||
      n.includes('front')
    ) {
      return THREE_WHEELER_IMAGES.frontView;
    }
  }

  // ── 4W (Four Wheeler / Car) ────────────────────────────────────────────────
  if (is4W) {
    // 0. Selfie / Valuator Selfie
    if (n.includes('selfie') || n.includes('valuator') || n.includes('inspector') || n.includes('user photo') || n.includes('profile')) {
      return FOUR_WHEELER_IMAGES.valuatorSelfie;
    }

    // 1. Odometer / Speedometer / Meter
    if (
      n.includes('odometer') ||
      n.includes('odmeter') ||
      n.includes('speedometer') ||
      n.includes('meter')
    ) {
      return FOUR_WHEELER_IMAGES.odometer;
    }

    // 2. Dashboard / Front Seats / Front Interior / Cabin
    if (
      n.includes('dashboard') ||
      n.includes('front seat') ||
      n.includes('steering') ||
      n.includes('front cabin') ||
      n.includes('front interior') ||
      n.includes('interior front')
    ) {
      return FOUR_WHEELER_IMAGES.dashboardFrontSeats;
    }

    // 3. Rear Seats / Back Seats / Passenger Seat / Interior Back Side / Rear Interior
    if (
      n.includes('rear seat') ||
      n.includes('back seat') ||
      n.includes('rear cabin') ||
      n.includes('passenger seat') ||
      n.includes('second row') ||
      n.includes('rear interior') ||
      n.includes('interior rear') ||
      n.includes('interior back') ||
      n.includes('back interior') ||
      (n.includes('interior') && (n.includes('back') || n.includes('rear')))
    ) {
      return FOUR_WHEELER_IMAGES.rearSideSeats;
    }

    // 4. Tyres (Front Right, Front Left, Rear Right, Rear Left, general)
    if (
      (n.includes('front right') || n.includes('frnt right') || n.includes('right front') || n.includes('rhs front') || n.includes('tyre 1') || n.includes('tyre1')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return FOUR_WHEELER_IMAGES.frontRightTyre;
    }
    if (
      (n.includes('front left') || n.includes('frnt left') || n.includes('left front') || n.includes('lhs front') || n.includes('tyre 2') || n.includes('tyre2')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return FOUR_WHEELER_IMAGES.frontLeftTyre;
    }
    if (
      (n.includes('rear right') || n.includes('back right') || n.includes('right rear') || n.includes('rhs rear') || n.includes('tyre 4') || n.includes('tyre4')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return FOUR_WHEELER_IMAGES.rearRightTyre;
    }
    if (
      (n.includes('rear left') || n.includes('back left') || n.includes('left rear') || n.includes('lhs rear') || n.includes('tyre 3') || n.includes('tyre3')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return FOUR_WHEELER_IMAGES.rearLeftTyre;
    }
    if (
      (n.includes('front') || n.includes('frnt')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return FOUR_WHEELER_IMAGES.frontRightTyre;
    }
    if (
      (n.includes('rear') || n.includes('back')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return FOUR_WHEELER_IMAGES.rearRightTyre;
    }
    if (n.includes('tyre') || n.includes('tire') || n.includes('wheel')) {
      return FOUR_WHEELER_IMAGES.frontRightTyre;
    }

    // 5. Engine View
    if (n.includes('engine') || n.includes('eng') || n.includes('bonnet') || n.includes('hood') || n.includes('motor')) {
      return FOUR_WHEELER_IMAGES.engineView;
    }

    // 6. Chassis Plate vs Chassis Imprint vs Chassis/VIN general
    if (
      n.includes('chassis plate') ||
      n.includes('vin plate') ||
      n.includes('id plate') ||
      n.includes('metal plate')
    ) {
      return FOUR_WHEELER_IMAGES.chassisPlate;
    }
    if (
      n.includes('chassis imprint') ||
      n.includes('chassis stamp') ||
      n.includes('imprint') ||
      n.includes('stamper') ||
      n.includes('vin stamp') ||
      n.includes('number imprint')
    ) {
      return FOUR_WHEELER_IMAGES.chassisImprint;
    }
    if (
      n.includes('chassis') ||
      n.includes('vin') ||
      n.includes('plate') ||
      n.includes('frame')
    ) {
      return FOUR_WHEELER_IMAGES.chassisImprint;
    }

    // 7. RC / Documents
    if (
      n.includes('rc') ||
      n.includes('document') ||
      n.includes('doc') ||
      n.includes('registration') ||
      n.includes('certificate') ||
      n.includes('paper')
    ) {
      return TWO_WHEELER_IMAGES.rcDocuments;
    }

    // 8. Views / Sides (Left, Right, Back/Rear, Front)
    if (
      n.includes('left side') ||
      n.includes('left view') ||
      n.includes('left angle') ||
      n.includes('left') ||
      n.includes('lhs')
    ) {
      return FOUR_WHEELER_IMAGES.leftSide;
    }
    if (
      n.includes('right side') ||
      n.includes('right view') ||
      n.includes('right angle') ||
      n.includes('right') ||
      n.includes('rhs')
    ) {
      return FOUR_WHEELER_IMAGES.rightSide;
    }
    if (
      n.includes('rear side') ||
      n.includes('rear view') ||
      n.includes('rear angle') ||
      n.includes('back side') ||
      n.includes('back view') ||
      n.includes('back angle') ||
      n.includes('rear') ||
      n.includes('back') ||
      n.includes('boot') ||
      n.includes('dick')
    ) {
      return FOUR_WHEELER_IMAGES.backView;
    }
    if (
      n.includes('front side') ||
      n.includes('front view') ||
      n.includes('front angle') ||
      n.includes('front')
    ) {
      return FOUR_WHEELER_IMAGES.frontView;
    }
  }

  // ── CV (Commercial Vehicle / Truck / Bus / LCV / HCV) ──────────────────────
  if (isCV) {
    // 0. Selfie / Valuator Selfie
    if (n.includes('selfie') || n.includes('valuator') || n.includes('inspector') || n.includes('user photo') || n.includes('profile')) {
      return CV_IMAGES.valuatorSelfie;
    }

    // 1. Odometer / Speedometer / Meter
    if (
      n.includes('odometer') ||
      n.includes('odmeter') ||
      n.includes('speedometer') ||
      n.includes('meter')
    ) {
      return CV_IMAGES.odometer;
    }

    // 2. Dashboard / Interior / Cabin
    if (
      n.includes('dashboard') ||
      n.includes('cabin') ||
      n.includes('interior') ||
      n.includes('steering') ||
      n.includes('front seat')
    ) {
      return CV_IMAGES.dashboard;
    }

    // 3. Under Carriage (Front vs Rear / General)
    if (
      (n.includes('front') || n.includes('frnt')) &&
      (n.includes('under') || n.includes('carriage') || n.includes('chassis bottom') || n.includes('bottom') || n.includes('underbody'))
    ) {
      return CV_IMAGES.frontUnderCarriage;
    }
    if (
      (n.includes('rear') || n.includes('back')) &&
      (n.includes('under') || n.includes('carriage') || n.includes('chassis bottom') || n.includes('bottom') || n.includes('underbody'))
    ) {
      return CV_IMAGES.rearUnderCarriage;
    }
    if (n.includes('under') || n.includes('carriage') || n.includes('underbody')) {
      return CV_IMAGES.frontUnderCarriage;
    }

    // 4. Tyres (Front Right, Front Left, Rear Right, Rear Left, general)
    if (
      (n.includes('front right') || n.includes('frnt right') || n.includes('right front') || n.includes('rhs front') || n.includes('tyre 1') || n.includes('tyre1')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return CV_IMAGES.frontRightTyre;
    }
    if (
      (n.includes('front left') || n.includes('frnt left') || n.includes('left front') || n.includes('lhs front') || n.includes('tyre 2') || n.includes('tyre2')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return CV_IMAGES.frontLeftTyre;
    }
    if (
      (n.includes('rear right') || n.includes('back right') || n.includes('right rear') || n.includes('rhs rear') || n.includes('tyre 4') || n.includes('tyre4')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return CV_IMAGES.rearRightTyre;
    }
    if (
      (n.includes('rear left') || n.includes('back left') || n.includes('left rear') || n.includes('lhs rear') || n.includes('tyre 3') || n.includes('tyre3')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return CV_IMAGES.rearLeftTyre;
    }
    if (
      (n.includes('front') || n.includes('frnt')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return CV_IMAGES.frontRightTyre;
    }
    if (
      (n.includes('rear') || n.includes('back')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return CV_IMAGES.rearRightTyre;
    }
    if (n.includes('tyre') || n.includes('tire') || n.includes('wheel')) {
      return CV_IMAGES.frontRightTyre;
    }

    // 5. Engine View
    if (n.includes('engine') || n.includes('eng') || n.includes('bonnet') || n.includes('hood') || n.includes('motor')) {
      return CV_IMAGES.engineView;
    }

    // 6. Chassis Plate vs Chassis Imprint vs Chassis/VIN general
    if (
      n.includes('chassis plate') ||
      n.includes('vin plate') ||
      n.includes('id plate') ||
      n.includes('metal plate')
    ) {
      return CV_IMAGES.chassisPlate;
    }
    if (
      n.includes('chassis imprint') ||
      n.includes('chassis stamp') ||
      n.includes('imprint') ||
      n.includes('stamper') ||
      n.includes('vin stamp') ||
      n.includes('number imprint')
    ) {
      return CV_IMAGES.chassisImprint;
    }
    if (
      n.includes('chassis') ||
      n.includes('vin') ||
      n.includes('plate') ||
      n.includes('frame')
    ) {
      return CV_IMAGES.chassisImprint;
    }

    // 7. RC / Documents
    if (
      n.includes('rc') ||
      n.includes('document') ||
      n.includes('doc') ||
      n.includes('registration') ||
      n.includes('certificate') ||
      n.includes('paper')
    ) {
      return TWO_WHEELER_IMAGES.rcDocuments;
    }

    // 8. Views / Sides (Left, Right, Back/Rear, Front)
    if (
      n.includes('left side') ||
      n.includes('left view') ||
      n.includes('left angle') ||
      n.includes('left') ||
      n.includes('lhs')
    ) {
      return CV_IMAGES.leftSide;
    }
    if (
      n.includes('right side') ||
      n.includes('right view') ||
      n.includes('right angle') ||
      n.includes('right') ||
      n.includes('rhs')
    ) {
      return CV_IMAGES.rightSide;
    }
    if (
      n.includes('rear side') ||
      n.includes('rear view') ||
      n.includes('rear angle') ||
      n.includes('back side') ||
      n.includes('back view') ||
      n.includes('back angle') ||
      n.includes('rear') ||
      n.includes('back') ||
      n.includes('cargo') ||
      n.includes('load body')
    ) {
      return CV_IMAGES.backSide;
    }
    if (
      n.includes('front side') ||
      n.includes('front view') ||
      n.includes('front angle') ||
      n.includes('front')
    ) {
      return CV_IMAGES.frontSide;
    }
  }

  // ── CE (Construction Equipment / JCB / Excavator / Crane / Loader) ─────────
  if (isCE) {
    // 0. Selfie / Valuator Selfie
    if (n.includes('selfie') || n.includes('valuator') || n.includes('inspector') || n.includes('user photo') || n.includes('profile')) {
      return CE_IMAGES.valuatorSelfie;
    }

    // 1. Odometer / Speedometer / Hour Meter / Meter
    if (
      n.includes('odometer') ||
      n.includes('odmeter') ||
      n.includes('speedometer') ||
      n.includes('hour') ||
      n.includes('meter')
    ) {
      return CE_IMAGES.odometer;
    }

    // 2. Operator Seat / Cabin Seat / Driver Seat
    if (
      n.includes('operator seat') ||
      n.includes('driver seat') ||
      n.includes('cabin seat') ||
      n.includes('operator')
    ) {
      return CE_IMAGES.operatorSeat;
    }

    // 3. Dashboard / Control Panel / Cabin / Steering
    if (
      n.includes('dashboard') ||
      n.includes('cabin') ||
      n.includes('interior') ||
      n.includes('steering') ||
      n.includes('control') ||
      n.includes('panel')
    ) {
      return CE_IMAGES.dashboard;
    }

    // 4. Under Carriage (Front vs Rear / General)
    if (
      (n.includes('front') || n.includes('frnt')) &&
      (n.includes('under') || n.includes('carriage') || n.includes('chassis bottom') || n.includes('bottom') || n.includes('underbody') || n.includes('track'))
    ) {
      return CE_IMAGES.frontUnderCarriage;
    }
    if (
      (n.includes('rear') || n.includes('back')) &&
      (n.includes('under') || n.includes('carriage') || n.includes('chassis bottom') || n.includes('bottom') || n.includes('underbody') || n.includes('track'))
    ) {
      return CE_IMAGES.rearUnderCarriage;
    }
    if (n.includes('under') || n.includes('carriage') || n.includes('underbody')) {
      return CE_IMAGES.frontUnderCarriage;
    }

    // 5. Tyres / Tracks (Front Right, Front Left, Rear Right, Rear Left, general)
    if (
      (n.includes('front right') || n.includes('frnt right') || n.includes('right front') || n.includes('rhs front') || n.includes('tyre 1') || n.includes('tyre1')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel') || n.includes('track'))
    ) {
      return CE_IMAGES.frontRightTyre;
    }
    if (
      (n.includes('front left') || n.includes('frnt left') || n.includes('left front') || n.includes('lhs front') || n.includes('tyre 2') || n.includes('tyre2')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel') || n.includes('track'))
    ) {
      return CE_IMAGES.frontLeftTyre;
    }
    if (
      (n.includes('rear right') || n.includes('back right') || n.includes('right rear') || n.includes('rhs rear') || n.includes('tyre 4') || n.includes('tyre4')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel') || n.includes('track'))
    ) {
      return CE_IMAGES.rearRightTyre;
    }
    if (
      (n.includes('rear left') || n.includes('back left') || n.includes('left rear') || n.includes('lhs rear') || n.includes('tyre 3') || n.includes('tyre3')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel') || n.includes('track'))
    ) {
      return CE_IMAGES.rearLeftTyre;
    }
    if (
      (n.includes('front') || n.includes('frnt')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel') || n.includes('track'))
    ) {
      return CE_IMAGES.frontRightTyre;
    }
    if (
      (n.includes('rear') || n.includes('back')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel') || n.includes('track'))
    ) {
      return CE_IMAGES.rearRightTyre;
    }
    if (n.includes('tyre') || n.includes('tire') || n.includes('wheel') || n.includes('track')) {
      return CE_IMAGES.frontRightTyre;
    }

    // 6. Engine View
    if (n.includes('engine') || n.includes('eng') || n.includes('bonnet') || n.includes('hood') || n.includes('motor') || n.includes('hydraulic')) {
      return CE_IMAGES.engineView;
    }

    // 7. Chassis Plate vs Chassis Imprint vs Chassis/VIN general
    if (
      n.includes('chassis plate') ||
      n.includes('vin plate') ||
      n.includes('id plate') ||
      n.includes('metal plate') ||
      n.includes('serial plate')
    ) {
      return CE_IMAGES.chassisPlate;
    }
    if (
      n.includes('chassis imprint') ||
      n.includes('chassis stamp') ||
      n.includes('imprint') ||
      n.includes('stamper') ||
      n.includes('vin stamp') ||
      n.includes('serial number stamp') ||
      n.includes('number imprint')
    ) {
      return CE_IMAGES.chassisImprint;
    }
    if (
      n.includes('chassis') ||
      n.includes('vin') ||
      n.includes('plate') ||
      n.includes('frame') ||
      n.includes('serial')
    ) {
      return CE_IMAGES.chassisImprint;
    }

    // 8. RC / Documents
    if (
      n.includes('rc') ||
      n.includes('document') ||
      n.includes('doc') ||
      n.includes('registration') ||
      n.includes('certificate') ||
      n.includes('paper')
    ) {
      return TWO_WHEELER_IMAGES.rcDocuments;
    }

    // 9. Views / Sides (Left, Right, Back/Rear, Front)
    if (
      n.includes('left side') ||
      n.includes('left view') ||
      n.includes('left angle') ||
      n.includes('left') ||
      n.includes('lhs')
    ) {
      return CE_IMAGES.leftSide;
    }
    if (
      n.includes('right side') ||
      n.includes('right view') ||
      n.includes('right angle') ||
      n.includes('right') ||
      n.includes('rhs')
    ) {
      return CE_IMAGES.rightSide;
    }
    if (
      n.includes('rear side') ||
      n.includes('rear view') ||
      n.includes('rear angle') ||
      n.includes('back side') ||
      n.includes('back view') ||
      n.includes('back angle') ||
      n.includes('rear') ||
      n.includes('back') ||
      n.includes('bucket') ||
      n.includes('arm') ||
      n.includes('boom')
    ) {
      return CE_IMAGES.backSide;
    }
    if (
      n.includes('front side') ||
      n.includes('front view') ||
      n.includes('front angle') ||
      n.includes('front')
    ) {
      return CE_IMAGES.frontSide;
    }
  }

  // ── FE (Farm Equipment / Tractor / Harvester) ──────────────────────────────
  if (isFE) {
    // 0. Selfie / Valuator Selfie
    if (n.includes('selfie') || n.includes('valuator') || n.includes('inspector') || n.includes('user photo') || n.includes('profile')) {
      return FE_IMAGES.valuatorSelfie;
    }

    // 1. Odometer / Speedometer / Hour Meter / Meter
    if (
      n.includes('odometer') ||
      n.includes('odmeter') ||
      n.includes('speedometer') ||
      n.includes('hour') ||
      n.includes('meter')
    ) {
      return FE_IMAGES.odometer;
    }

    // 2. Driver / Operator Seat / Cabin Seat
    if (
      n.includes('driver seat') ||
      n.includes('operator seat') ||
      n.includes('cabin seat') ||
      n.includes('seat') ||
      n.includes('operator')
    ) {
      return FE_IMAGES.driverSeat;
    }

    // 3. Dashboard / Control Panel / Cabin / Steering
    if (
      n.includes('dashboard') ||
      n.includes('cabin') ||
      n.includes('interior') ||
      n.includes('steering') ||
      n.includes('control') ||
      n.includes('panel')
    ) {
      return FE_IMAGES.dashboard;
    }

    // 4. Under Carriage (Front vs Rear / General)
    if (
      (n.includes('front') || n.includes('frnt')) &&
      (n.includes('under') || n.includes('carriage') || n.includes('chassis bottom') || n.includes('bottom') || n.includes('underbody') || n.includes('axle'))
    ) {
      return FE_IMAGES.frontUnderCarriage;
    }
    if (
      (n.includes('rear') || n.includes('back')) &&
      (n.includes('under') || n.includes('carriage') || n.includes('chassis bottom') || n.includes('bottom') || n.includes('underbody') || n.includes('axle') || n.includes('pto') || n.includes('hitch'))
    ) {
      return FE_IMAGES.rearUnderCarriage;
    }
    if (n.includes('under') || n.includes('carriage') || n.includes('underbody')) {
      return FE_IMAGES.frontUnderCarriage;
    }

    // 5. Tyres (Front Right, Front Left, Rear Right, Rear Left, general)
    if (
      (n.includes('front right') || n.includes('frnt right') || n.includes('right front') || n.includes('rhs front') || n.includes('tyre 1') || n.includes('tyre1')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return FE_IMAGES.frontRightTyre;
    }
    if (
      (n.includes('front left') || n.includes('frnt left') || n.includes('left front') || n.includes('lhs front') || n.includes('tyre 2') || n.includes('tyre2')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return FE_IMAGES.frontLeftTyre;
    }
    if (
      (n.includes('rear right') || n.includes('back right') || n.includes('right rear') || n.includes('rhs rear') || n.includes('tyre 4') || n.includes('tyre4')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return FE_IMAGES.rearRightTyre;
    }
    if (
      (n.includes('rear left') || n.includes('back left') || n.includes('left rear') || n.includes('lhs rear') || n.includes('tyre 3') || n.includes('tyre3')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return FE_IMAGES.rearLeftTyre;
    }
    if (
      (n.includes('front') || n.includes('frnt')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return FE_IMAGES.frontRightTyre;
    }
    if (
      (n.includes('rear') || n.includes('back')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return FE_IMAGES.rearRightTyre;
    }
    if (n.includes('tyre') || n.includes('tire') || n.includes('wheel')) {
      return FE_IMAGES.frontRightTyre;
    }

    // 6. Engine View
    if (n.includes('engine') || n.includes('eng') || n.includes('bonnet') || n.includes('hood') || n.includes('motor')) {
      return FE_IMAGES.engineView;
    }

    // 7. Chassis Plate vs Chassis Imprint vs Chassis/VIN general
    if (
      n.includes('chassis plate') ||
      n.includes('vin plate') ||
      n.includes('id plate') ||
      n.includes('metal plate') ||
      n.includes('serial plate')
    ) {
      return FE_IMAGES.chassisPlate;
    }
    if (
      n.includes('chassis imprint') ||
      n.includes('chassis stamp') ||
      n.includes('imprint') ||
      n.includes('stamper') ||
      n.includes('vin stamp') ||
      n.includes('serial number stamp') ||
      n.includes('number imprint')
    ) {
      return FE_IMAGES.chassisImprint;
    }
    if (
      n.includes('chassis') ||
      n.includes('vin') ||
      n.includes('plate') ||
      n.includes('frame') ||
      n.includes('serial')
    ) {
      return FE_IMAGES.chassisImprint;
    }

    // 8. RC / Documents
    if (
      n.includes('rc') ||
      n.includes('document') ||
      n.includes('doc') ||
      n.includes('registration') ||
      n.includes('certificate') ||
      n.includes('paper')
    ) {
      return TWO_WHEELER_IMAGES.rcDocuments;
    }

    // 9. Views / Sides (Left, Right, Back/Rear, Front)
    if (
      n.includes('left side') ||
      n.includes('left view') ||
      n.includes('left angle') ||
      n.includes('left') ||
      n.includes('lhs')
    ) {
      return FE_IMAGES.leftSide;
    }
    if (
      n.includes('right side') ||
      n.includes('right view') ||
      n.includes('right angle') ||
      n.includes('right') ||
      n.includes('rhs')
    ) {
      return FE_IMAGES.rightSide;
    }
    if (
      n.includes('rear side') ||
      n.includes('rear view') ||
      n.includes('rear angle') ||
      n.includes('back side') ||
      n.includes('back view') ||
      n.includes('back angle') ||
      n.includes('rear') ||
      n.includes('back') ||
      n.includes('pto') ||
      n.includes('hitch')
    ) {
      return FE_IMAGES.backSide;
    }
    if (
      n.includes('front side') ||
      n.includes('front view') ||
      n.includes('front angle') ||
      n.includes('front')
    ) {
      return FE_IMAGES.frontSide;
    }
  }

  // ── 2W (Two Wheeler) ────────────────────────────────────────────────────────
  const is2W =
    vType.includes('2W') ||
    vType.includes('TWO') ||
    vType.includes('BIKE') ||
    vType.includes('SCOOTER') ||
    vType.includes('MOTORCYCLE') ||
    vType === 'TW' ||
    vType === '1' ||
    (!is3W && !is4W && !isCV && !isFE && !isCE);

  if (is2W) {
    // 0. Selfie / Valuator Selfie
    if (n.includes('selfie') || n.includes('valuator') || n.includes('inspector') || n.includes('user photo') || n.includes('profile')) {
      return TWO_WHEELER_IMAGES.valuatorSelfie;
    }

    // 1. Odometer / Speedometer / Dashboard / Meter
    if (
      n.includes('odometer') ||
      n.includes('odmeter') ||
      n.includes('speedometer') ||
      n.includes('dashboard') ||
      n.includes('meter')
    ) {
      return TWO_WHEELER_IMAGES.odometer;
    }

    // 2. Tyres (Front vs Rear vs general)
    if (
      (n.includes('front') || n.includes('frnt')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return TWO_WHEELER_IMAGES.frontTyre;
    }
    if (
      (n.includes('rear') || n.includes('back') || n.includes('rr')) &&
      (n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
    ) {
      return TWO_WHEELER_IMAGES.rearTyre;
    }
    if (n.includes('tyre') || n.includes('tire') || n.includes('wheel')) {
      return TWO_WHEELER_IMAGES.frontTyre;
    }

    // 3. Engine Block
    if (n.includes('engine') || n.includes('eng')) {
      return TWO_WHEELER_IMAGES.engineBlock;
    }

    // 4. Chassis / VIN / Plate / Stamper
    if (
      n.includes('chassis') ||
      n.includes('vin') ||
      n.includes('plate') ||
      n.includes('imprint') ||
      n.includes('stamper') ||
      n.includes('frame')
    ) {
      return TWO_WHEELER_IMAGES.chassisVin;
    }

    // 5. Fuel Tank
    if (n.includes('tank') || n.includes('fuel') || n.includes('petrol')) {
      return TWO_WHEELER_IMAGES.fuelTank;
    }

    // 6. Seat / Storage / Dikky / Helmet / Interior
    if (
      n.includes('seat') ||
      n.includes('storage') ||
      n.includes('dicky') ||
      n.includes('dikky') ||
      n.includes('helmet') ||
      n.includes('boot') ||
      n.includes('interior')
    ) {
      return TWO_WHEELER_IMAGES.seatStorage;
    }

    // 7. RC / Documents
    if (
      n.includes('rc') ||
      n.includes('document') ||
      n.includes('doc') ||
      n.includes('registration') ||
      n.includes('certificate') ||
      n.includes('paper')
    ) {
      return TWO_WHEELER_IMAGES.rcDocuments;
    }

    // 8. Views / Sides (Top, Left, Right, Rear/Back, Front)
    if (
      n.includes('top side') ||
      n.includes('top view') ||
      n.includes('top angle') ||
      n.includes('top') ||
      n.includes('roof')
    ) {
      return TWO_WHEELER_IMAGES.topView;
    }
    if (
      n.includes('left side') ||
      n.includes('left view') ||
      n.includes('left angle') ||
      n.includes('left') ||
      n.includes('lhs')
    ) {
      return TWO_WHEELER_IMAGES.leftSide;
    }
    if (
      n.includes('right side') ||
      n.includes('right view') ||
      n.includes('right angle') ||
      n.includes('right') ||
      n.includes('rhs')
    ) {
      return TWO_WHEELER_IMAGES.rightSide;
    }
    if (
      n.includes('rear side') ||
      n.includes('rear view') ||
      n.includes('rear angle') ||
      n.includes('back side') ||
      n.includes('back view') ||
      n.includes('back angle') ||
      n.includes('rear') ||
      n.includes('back')
    ) {
      return TWO_WHEELER_IMAGES.rearView;
    }
    if (
      n.includes('front side') ||
      n.includes('front view') ||
      n.includes('front angle') ||
      n.includes('front')
    ) {
      return TWO_WHEELER_IMAGES.frontView;
    }
  }

  return null;
};
