const MOCK_MICROSITE_ID = 2;

const airports = [
  {
    id: 1,
    name: "Aden Abdulle International Airport",
    code: "MGQ",
    countryId: 1,
    cityId: 1,
    country: "Somalia",
    city: "Mogadishu",
    latitude: "2.0144",
    longitude: "45.3047",
    isActive: true,
    createdDate: "2024-01-01T00:00:00",
    modifiedDate: null,
  },
  {
    id: 2,
    name: "Hargeisa Egal International Airport",
    code: "HGA",
    countryId: 1,
    cityId: 2,
    country: "Somalia",
    city: "Hargeisa",
    latitude: "9.5182",
    longitude: "44.0888",
    isActive: true,
    createdDate: "2024-01-01T00:00:00",
    modifiedDate: null,
  },
  {
    id: 3,
    name: "Jomo Kenyatta International Airport",
    code: "NBO",
    countryId: 2,
    cityId: 3,
    country: "Kenya",
    city: "Nairobi",
    latitude: "-1.3192",
    longitude: "36.9278",
    isActive: true,
    createdDate: "2024-01-01T00:00:00",
    modifiedDate: null,
  },
  {
    id: 4,
    name: "Bole International Airport",
    code: "ADD",
    countryId: 3,
    cityId: 4,
    country: "Ethiopia",
    city: "Addis Ababa",
    latitude: "8.9779",
    longitude: "38.7993",
    isActive: true,
    createdDate: "2024-01-01T00:00:00",
    modifiedDate: null,
  },
  {
    id: 5,
    name: "Dubai International Airport",
    code: "DXB",
    countryId: 4,
    cityId: 5,
    country: "United Arab Emirates",
    city: "Dubai",
    latitude: "25.2532",
    longitude: "55.3657",
    isActive: true,
    createdDate: "2024-01-01T00:00:00",
    modifiedDate: null,
  },
];

const countries = [
  { id: 1, name: "Somalia", code: "SO" },
  { id: 2, name: "Kenya", code: "KE" },
  { id: 3, name: "Ethiopia", code: "ET" },
  { id: 4, name: "United Arab Emirates", code: "AE" },
];

const airlines = [
  { id: 1, name: "Jubba Airways", code: "3J" },
  { id: 2, name: "Daallo Airlines", code: "D3" },
  { id: 3, name: "Ethiopian Airlines", code: "ET" },
  { id: 4, name: "Flydubai", code: "FZ" },
];

const paymentOptions = [
  { id: 1, name: "TaajPay" },
  { id: 2, name: "Deposit" },
  { id: 5, name: "iPayAfrica" },
];

const searchStore = new Map();
const bookingStore = new Map();
const cancellationStore = new Map();

let searchSequence = 5678;
let parentPnrSequence = 1;
let bookingSequence = 100;
let cancellationSequence = 900;

const addMinutes = (isoDateTime, minutes) => {
  const date = new Date(isoDateTime);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString().slice(0, 19);
};

const formatDate = (dateValue) => String(dateValue || "").slice(0, 10);

const formatTime = (dateTime) => String(dateTime || "").slice(11, 16);

const buildParentPnr = () => {
  const suffix = String(parentPnrSequence).padStart(4, "0");
  parentPnrSequence += 1;
  return `ATAS-2026-${suffix}`;
};

const getAirport = (code) => {
  const normalizedCode = String(code || "").trim().toUpperCase();
  return airports.find((airport) => airport.code === normalizedCode);
};

const minutesToLabel = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
};

const buildBound = ({
  departure,
  arrival,
  departureDate,
  departureTime,
  duration,
  airlineCode,
  airlineName,
  flightNumber,
  cabinClass,
  fareType,
  baggageAllowance,
}) => {
  const departureAirport = getAirport(departure);
  const arrivalAirport = getAirport(arrival);
  const departureDateTime = `${departureDate}T${departureTime}:00`;
  const arrivalDateTime = addMinutes(departureDateTime, duration);
  const arrivalDate = formatDate(arrivalDateTime);
  const arrivalTime = formatTime(arrivalDateTime);

  return {
    departure,
    arrival,
    departureAirport: departureAirport?.name || departure,
    arrivalAirport: arrivalAirport?.name || arrival,
    departureDateTime,
    arrivalDateTime,
    departureDate,
    departureTime,
    arrivalDate,
    arrivalTime,
    duration,
    baggageAllowance,
    companyCode: airlineCode,
    segments: [
      {
        departure,
        arrival,
        departureAirport: departureAirport?.name || departure,
        arrivalAirport: arrivalAirport?.name || arrival,
        departureDateTime,
        arrivalDateTime,
        duration: minutesToLabel(duration),
        airlineLogo: `https://api.atasomalia.com/logos/${airlineCode}.png`,
        airline: airlineCode,
        airlineName,
        flightNumber,
        cabinType: cabinClass,
        fareType,
      },
    ],
    fareRules: [],
  };
};

const buildFlightOption = ({
  id,
  request,
  departureTime,
  duration,
  airlineCode,
  airlineName,
  flightNumber,
  provider,
  totalAmount,
  inBound = null,
}) => {
  const cabinClass = request.cabinClass || "Economy";
  const taxesAmount = Math.round(totalAmount * 0.12 * 100) / 100;
  const ticketAmount = Math.round((totalAmount - taxesAmount) * 100) / 100;

  return {
    id,
    totalAmount,
    taxesAmount,
    ticketAmount,
    agencyMarkup: 0,
    microSiteMarkup: 0,
    afroMarkup: 0,
    currency: "USD",
    provider,
    fareType: cabinClass,
    outBound: buildBound({
      departure: String(request.departureCity || "MGQ").toUpperCase(),
      arrival: String(request.arrivalCity || "NBO").toUpperCase(),
      departureDate: formatDate(request.departureDate || "2026-04-07"),
      departureTime,
      duration,
      airlineCode,
      airlineName,
      flightNumber,
      cabinClass,
      fareType: cabinClass,
      baggageAllowance: cabinClass === "Business" ? "2x23kg" : "23kg",
    }),
    inBound,
  };
};

const buildSearchResponse = (request, forcedSearchId = null) => {
  const searchId = forcedSearchId || searchSequence;
  searchSequence = Math.max(searchSequence + 1, searchId + 1);

  const departureDate = formatDate(request.departureDate || "2026-04-07");
  const returnDate = formatDate(request.returnDate || request.departureDate);
  const tripType = request.tripType || "OneWay";
  const cabinClass = request.cabinClass || "Economy";
  const hasReturn = tripType === "RoundTrip" && Boolean(request.returnDate);

  const returnBound =
    hasReturn &&
    buildBound({
      departure: String(request.arrivalCity || "NBO").toUpperCase(),
      arrival: String(request.departureCity || "MGQ").toUpperCase(),
      departureDate: returnDate,
      departureTime: "17:15",
      duration: 150,
      airlineCode: "3J",
      airlineName: "Jubba Airways",
      flightNumber: "3J102",
      cabinClass,
      fareType: cabinClass,
      baggageAllowance: cabinClass === "Business" ? "2x23kg" : "23kg",
    });

  const flights = [
    buildFlightOption({
      id: 101,
      request: { ...request, departureDate },
      departureTime: "06:00",
      duration: 150,
      airlineCode: "3J",
      airlineName: "Jubba Airways",
      flightNumber: "3J101",
      provider: "Siliconsom",
      totalAmount: hasReturn ? 540 : 285,
      inBound: returnBound || null,
    }),
    buildFlightOption({
      id: 102,
      request: { ...request, departureDate },
      departureTime: "11:35",
      duration: 165,
      airlineCode: "D3",
      airlineName: "Daallo Airlines",
      flightNumber: "D3205",
      provider: "StarSky",
      totalAmount: hasReturn ? 590 : 315,
      inBound: hasReturn
        ? buildBound({
            departure: String(request.arrivalCity || "NBO").toUpperCase(),
            arrival: String(request.departureCity || "MGQ").toUpperCase(),
            departureDate: returnDate,
            departureTime: "20:10",
            duration: 165,
            airlineCode: "D3",
            airlineName: "Daallo Airlines",
            flightNumber: "D3206",
            cabinClass,
            fareType: cabinClass,
            baggageAllowance: cabinClass === "Business" ? "2x23kg" : "23kg",
          })
        : null,
    }),
    buildFlightOption({
      id: 103,
      request: { ...request, departureDate },
      departureTime: "15:20",
      duration: 255,
      airlineCode: "ET",
      airlineName: "Ethiopian Airlines",
      flightNumber: "ET379",
      provider: "AmadeusMock",
      totalAmount: hasReturn ? 720 : 410,
      inBound: null,
    }),
  ];

  const response = {
    id: searchId,
    tripType,
    departureCity: String(request.departureCity || "MGQ").toUpperCase(),
    arrivalCity: String(request.arrivalCity || "NBO").toUpperCase(),
    departureDate: `${departureDate}T00:00:00`,
    returnDate: request.returnDate ? `${returnDate}T00:00:00` : null,
    adults: Number(request.adults || 1),
    children: Number(request.children || 0),
    infants: Number(request.infants || 0),
    cabinClass,
    isFlexibleDates: Boolean(request.isFlexibleDates),
    isDirectFlight: Boolean(request.isDirectFlight),
    flights: Boolean(request.isDirectFlight)
      ? flights.filter((flight) => flight.outBound.segments.length === 1)
      : flights,
  };

  searchStore.set(searchId, response);
  return response;
};

const findSelectedFlight = (selection) => {
  const searchId = Number(selection.searchId);
  let search = searchStore.get(searchId);

  if (!search && searchId === 5678) {
    search = buildSearchResponse(
      {
        tripType: "OneWay",
        departureCity: "MGQ",
        arrivalCity: "NBO",
        departureDate: "2026-04-07",
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: "Economy",
        isFlexibleDates: true,
        isDirectFlight: true,
        micrositeClientId: MOCK_MICROSITE_ID,
      },
      searchId,
    );
  }

  if (!search) return null;

  return search.flights.find((flight) => flight.id === Number(selection.flightId));
};

const normalizePassengers = (passengers) => {
  if (!Array.isArray(passengers)) return [];

  return passengers.map((passenger) => ({
    type: passenger.type || "Adult",
    title: passenger.title || passenger.courtesyTitle || "Mr",
    firstName: passenger.firstName || "",
    lastName: passenger.lastName || "",
    requestedAge: Number(passenger.requestedAge || 0),
    birthDate: passenger.birthDate || null,
    documentType: passenger.documentType || "Passport",
    documentNumber: passenger.documentNumber || "",
    documentExpiration: passenger.documentExpiration || null,
    courtesyTitle: passenger.courtesyTitle || passenger.title || "Mr",
    email: passenger.email || "",
    phoneCountryCode: passenger.phoneCountryCode || "",
    phone: passenger.phone || "",
    country: passenger.country || "",
    countryId: passenger.countryId || null,
  }));
};

const buildBookedFlight = ({ selectedFlight, passengers, bookingReference, pnr }) => ({
  ticketAmount: selectedFlight.ticketAmount,
  taxAmount: selectedFlight.taxesAmount,
  agencyMarkup: selectedFlight.agencyMarkup,
  microSiteMarkup: selectedFlight.microSiteMarkup,
  afroMarkup: selectedFlight.afroMarkup,
  totalAmount: selectedFlight.totalAmount,
  currency: selectedFlight.currency,
  pnr,
  bookingReference,
  outBound: selectedFlight.outBound,
  inBound: selectedFlight.inBound,
  passengers: passengers.map((passenger) => ({
    type: passenger.type,
    title: passenger.title,
    firstName: passenger.firstName,
    lastName: passenger.lastName,
    email: passenger.email,
    phone: passenger.phone,
    documentType: passenger.documentType,
    documentNumber: passenger.documentNumber,
  })),
});

const buildBookingDetail = (booking) => {
  const firstFlight = booking.flights[0];

  return {
    ticketAmount: booking.ticketAmount,
    taxAmount: booking.taxAmount,
    agencyMarkup: booking.agencyMarkup,
    microSiteMarkup: booking.microSiteMarkup,
    afroMarkup: booking.afroMarkup,
    totalAmount: booking.totalAmount,
    currency: booking.currency,
    pnr: firstFlight?.pnr || null,
    bookingReference: firstFlight?.bookingReference || null,
    parentPnr: booking.parentPnr,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    bookingDate: booking.bookingDate,
    agency: "ATA Somalia",
    agencyId: MOCK_MICROSITE_ID,
    createdBy: booking.passengers[0]?.email || "mock@habsan.test",
    flights: booking.flights,
  };
};

const paginate = (items, query) => {
  const requestedPageSize = Number(query.PageSize || query.pageSize || 10);
  const requestedPageNumber = Number(query.PageNumber || query.pageNumber || 1);
  const pageSize = Number.isFinite(requestedPageSize)
    ? Math.max(requestedPageSize, 1)
    : 10;
  const pageNumber = Number.isFinite(requestedPageNumber)
    ? Math.max(requestedPageNumber, 1)
    : 1;
  const start = (pageNumber - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

export const login_user = async (req, res) => {
  const username = req.body.username || req.body.email || "demo@atasomalia.com";
  const nowInSeconds = Math.floor(Date.now() / 1000);

  return res.status(200).json({
    id: 1234,
    fullName: "Ahmed Mohamed",
    email: username,
    username,
    accessToken: "mock-ata-access-token",
    refreshToken: "mock-ata-refresh-token",
    expireAt: nowInSeconds + 3600,
    role: 3,
    roleSupportId: MOCK_MICROSITE_ID,
    allowedAirline: 0,
    resetPassword: false,
    allowPassengerNameChange: false,
  });
};

export const refresh_token = async (req, res) => {
  return res.status(200).json({
    accessToken: "mock-ata-access-token-refreshed",
    refreshToken: "mock-ata-refresh-token-refreshed",
    expireAt: Math.floor(Date.now() / 1000) + 3600,
  });
};

export const logout = async (req, res) => {
  return res.status(200).json({});
};

export const search_airports = async (req, res) => {
  const keyword = String(req.body.search || "").trim().toLowerCase();

  if (!keyword) {
    return res.status(200).json(airports);
  }

  return res.status(200).json(
    airports.filter((airport) => {
      return (
        airport.name.toLowerCase().includes(keyword) ||
        airport.code.toLowerCase().includes(keyword) ||
        airport.city.toLowerCase().includes(keyword) ||
        airport.country.toLowerCase().includes(keyword)
      );
    }),
  );
};

export const get_airport_by_code = async (req, res) => {
  const airport = getAirport(req.params.code);

  if (!airport) {
    return res.status(404).json({ message: "Airport not found" });
  }

  return res.status(200).json(airport);
};

export const get_airports = async (req, res) => {
  return res.status(200).json(airports);
};

export const get_countries = async (req, res) => {
  return res.status(200).json(countries);
};

export const get_airlines = async (req, res) => {
  return res.status(200).json(airlines);
};

export const get_payment_options = async (req, res) => {
  return res.status(200).json(paymentOptions);
};

export const search_flights = async (req, res) => {
  const requiredFields = ["tripType", "departureCity", "arrivalCity", "departureDate"];
  const missingField = requiredFields.find((field) => !req.body[field]);

  if (missingField) {
    return res.status(400).json({
      message: `${missingField} is required`,
    });
  }

  if (req.body.tripType === "RoundTrip" && !req.body.returnDate) {
    return res.status(400).json({
      message: "returnDate is required for RoundTrip",
    });
  }

  return res.status(200).json(buildSearchResponse(req.body));
};

export const add_booking = async (req, res) => {
  const flightSelection = Array.isArray(req.body.flightSelection)
    ? req.body.flightSelection
    : [];
  const passengers = normalizePassengers(req.body.passengers);

  if (!flightSelection.length) {
    return res.status(400).json({ message: "flightSelection is required" });
  }

  if (!passengers.length) {
    return res.status(400).json({ message: "passengers is required" });
  }

  const selectedFlights = flightSelection.map(findSelectedFlight);

  if (selectedFlights.some((flight) => !flight)) {
    return res.status(404).json({
      message: "Selected flight not found. Search flights before booking.",
    });
  }

  const parentPnr = buildParentPnr();
  const bookingReference = `REF-${String(bookingSequence).padStart(3, "0")}`;
  const pnr = `ATA${String(bookingSequence).slice(-3)}`;
  const flights = selectedFlights.map((selectedFlight, index) =>
    buildBookedFlight({
      selectedFlight,
      passengers,
      bookingReference: index === 0 ? bookingReference : `${bookingReference}-${index + 1}`,
      pnr: index === 0 ? pnr : `${pnr}${index + 1}`,
    }),
  );

  const ticketAmount = flights.reduce((total, flight) => total + flight.ticketAmount, 0);
  const taxAmount = flights.reduce((total, flight) => total + flight.taxAmount, 0);
  const totalAmount = flights.reduce((total, flight) => total + flight.totalAmount, 0);
  const paymentTypeId = Number(req.body.paymentTypeId);
  const needsRedirect = paymentTypeId === 5;
  const bookingDate = new Date().toISOString().slice(0, 19);

  const booking = {
    id: bookingSequence,
    type: needsRedirect ? "RedirectUrl" : "DirectBooking",
    redirectUrl: needsRedirect
      ? `https://mock-pay.atasomalia.com/pay/${parentPnr}`
      : null,
    ticketAmount,
    taxAmount,
    agencyMarkup: 0,
    microSiteMarkup: 0,
    afroMarkup: 0,
    totalAmount,
    currency: "USD",
    parentPnr,
    status: needsRedirect ? "Pending" : "Confirmed",
    paymentStatus: needsRedirect ? "PaymentPending" : "PaymentComplete",
    bookingDate,
    flights,
    passengers: [],
    rawPassengers: passengers,
    history: [
      {
        id: 1,
        flightBookingId: bookingSequence,
        description: "Booking created",
        createdAt: bookingDate,
        createdBy: passengers[0]?.email || "mock@habsan.test",
      },
    ],
  };

  bookingStore.set(parentPnr, booking);
  bookingSequence += 1;

  return res.status(200).json({
    type: booking.type,
    redirectUrl: booking.redirectUrl,
    ticketAmount: booking.ticketAmount,
    taxAmount: booking.taxAmount,
    agencyMarkup: booking.agencyMarkup,
    microSiteMarkup: booking.microSiteMarkup,
    afroMarkup: booking.afroMarkup,
    totalAmount: booking.totalAmount,
    currency: booking.currency,
    parentPnr: booking.parentPnr,
    status: booking.status,
    flights: booking.flights,
    passengers: booking.passengers,
  });
};

export const generate_ipay_africa_payment = async (req, res) => {
  const parentPnr = req.body.orderId || req.body.referenceId || "ATAS-2026-0001";

  return res.status(200).json({
    paymentUrl: `https://mock-pay.atasomalia.com/ipayafrica/${parentPnr}`,
    orderId: parentPnr,
    reservationId: req.body.reservationId || null,
    amount: Number(req.body.amount || 0),
    currency: req.body.currency || "USD",
    status: "Pending",
    provider: "iPayAfrica",
  });
};

export const process_payment = async (req, res) => {
  const parentPnr = req.body.parentPnr;
  const booking = bookingStore.get(parentPnr);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  booking.status = req.body.status === "SUCCESS" ? "Confirmed" : "Pending";
  booking.paymentStatus =
    req.body.status === "SUCCESS" ? "PaymentComplete" : "PaymentProcessing";
  booking.history.push({
    id: booking.history.length + 1,
    flightBookingId: booking.id,
    description: `Payment ${booking.paymentStatus} via ${req.body.transactionId || "mock"}`,
    createdAt: new Date().toISOString().slice(0, 19),
    createdBy: "system",
  });

  bookingStore.set(parentPnr, booking);

  return res.status(200).json(buildBookingDetail(booking));
};

export const get_booking_by_parent_pnr = async (req, res) => {
  const booking = bookingStore.get(req.params.parentPnr);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  return res.status(200).json(buildBookingDetail(booking));
};

export const resend_ticket_email = async (req, res) => {
  const booking = bookingStore.get(req.params.parentPnr);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  return res.status(200).json({
    message: "Ticket confirmation email sent",
    parentPnr: req.params.parentPnr,
    email: req.params.email,
  });
};

export const get_my_bookings = async (req, res) => {
  const bookings = Array.from(bookingStore.values()).map((booking) => {
    const firstFlight = booking.flights[0];
    const firstPassenger = firstFlight?.passengers[0];
    const outBound = firstFlight?.outBound;

    return {
      id: booking.id,
      ticketAmount: booking.ticketAmount,
      taxAmount: booking.taxAmount,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      parentPnr: booking.parentPnr,
      flightPnr: firstFlight?.pnr || null,
      bookingReference: firstFlight?.bookingReference || null,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      departure: outBound?.departure || null,
      arrival: outBound?.arrival || null,
      departureDateTime: outBound?.departureDateTime || null,
      arrivalDateTime: outBound?.arrivalDateTime || null,
      tripType: firstFlight?.inBound ? "RoundTrip" : "OneWay",
      bookingDate: booking.bookingDate,
      bookingId: booking.id,
      airlineName: outBound?.segments[0]?.airlineName || null,
      agency: "ATA Somalia",
      class: outBound?.segments[0]?.cabinType || "Economy",
      passenger: firstFlight?.passengers.map(
        (passenger) => `${passenger.firstName} ${passenger.lastName}`.trim(),
      ),
      passengerCount: firstFlight?.passengers.length || 0,
      passengerPhone: firstPassenger
        ? `${booking.rawPassengers[0]?.phoneCountryCode || ""}${firstPassenger.phone}`
        : null,
      passengerPassport: firstPassenger?.documentNumber || null,
      createdBy: firstPassenger?.email || "mock@habsan.test",
    };
  });

  return res.status(200).json(paginate(bookings, req.query));
};

export const get_booking_history = async (req, res) => {
  const booking = Array.from(bookingStore.values()).find(
    (item) => item.id === Number(req.params.flightBookingId),
  );

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  return res.status(200).json(booking.history);
};

export const get_fare_rules = async (req, res) => {
  const booking = bookingStore.get(req.params.parentPnr);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  return res.status(200).json([
    {
      title: "Change policy",
      description: "Date changes are allowed up to 24 hours before departure with fare difference.",
      penaltyAmount: 25,
      currency: booking.currency,
    },
    {
      title: "Cancellation policy",
      description: "Refundable before departure with airline cancellation penalty.",
      penaltyAmount: 50,
      currency: booking.currency,
    },
  ]);
};

export const request_cancellation = async (req, res) => {
  const requestId = cancellationSequence;
  cancellationSequence += 1;

  const cancellation = {
    id: requestId,
    reason: req.body.reason || "",
    bookingId: Number(req.body.bookingId),
    module: req.body.module || "Flight",
    status: "PenaltyOffered",
    penaltyAmount: 50,
    currency: "USD",
    createdAt: new Date().toISOString().slice(0, 19),
  };

  cancellationStore.set(requestId, cancellation);

  return res.status(200).json(cancellation);
};

export const accept_cancellation_penalty = async (req, res) => {
  const cancellation = cancellationStore.get(Number(req.params.requestId));

  if (!cancellation) {
    return res.status(404).json({ message: "Cancellation request not found" });
  }

  cancellation.status = "Accepted";
  cancellationStore.set(cancellation.id, cancellation);

  return res.status(200).json(cancellation);
};

export const reject_cancellation_penalty = async (req, res) => {
  const cancellation = cancellationStore.get(Number(req.params.requestId));

  if (!cancellation) {
    return res.status(404).json({ message: "Cancellation request not found" });
  }

  cancellation.status = "Rejected";
  cancellationStore.set(cancellation.id, cancellation);

  return res.status(200).json(cancellation);
};

export const get_my_cancellations = async (req, res) => {
  const cancellations = Array.from(cancellationStore.values()).filter(
    (item) => item.module === req.params.module,
  );

  return res.status(200).json(paginate(cancellations, req.query));
};
