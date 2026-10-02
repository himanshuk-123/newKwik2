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

/**
 * Returns custom AI card image asset for vehicle type and step name.
 * Falls back to null if no custom image is defined (allowing default vector icon fallback).
 */
export const getVehicleCardImage = (cardName: string, vehicleType: string) => {
  const vType = (vehicleType || '').toUpperCase().trim();
  const n = (cardName || '').toLowerCase().trim();

  const is3W = vType.includes('3W') || vType.includes('THREE') || vType === 'AUTO' || vType === 'RICKSHAW';
  const is4W = vType.includes('4W') || vType.includes('FOUR') || vType.includes('CAR');
  const isCV = vType.includes('CV') || vType.includes('COMMERCIAL');
  const isFE = vType.includes('FE') || vType.includes('FARM');
  const isCE = vType.includes('CE') || vType.includes('CONSTRUCTION');

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
