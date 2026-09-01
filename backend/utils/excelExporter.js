const XLSX = require('xlsx');

/**
 * Converts registrations and payment data to Excel buffer (.xlsx)
 * @param {Array} registrations - Populated EventRegistration documents
 * @param {Map} paymentsMap - Map of registrationId / userId / email to Payment document
 * @param {Map} eventsMap - Map of eventId / eventSlug to Event document
 * @param {string} baseUrl - Base URL for resolving absolute screenshot links
 * @returns {Buffer} Excel file buffer
 */
const registrationsToExcel = (registrations, paymentsMap = new Map(), eventsMap = new Map(), baseUrl = '') => {
  const data = registrations.map((r, index) => {
    const u = r.user || {};
    const t = r.team || {};

    const regId = r.registrationId || '';
    const userId = u._id ? u._id.toString() : (r.user ? r.user.toString() : '');
    const userEmail = u.email ? u.email.toLowerCase() : '';
    const userMobile = u.mobile || '';

    // Match payment by registration ID, user ID, email, or phone
    const payment = (paymentsMap instanceof Map 
      ? (paymentsMap.get(regId) || (userId && paymentsMap.get(userId)) || (userEmail && paymentsMap.get(userEmail)) || (userMobile && paymentsMap.get(userMobile)))
      : (paymentsMap[regId] || (userId && paymentsMap[userId]) || (userEmail && paymentsMap[userEmail]))) || {};

    // Resolve event
    let eventObj = r.event && typeof r.event === 'object' && r.event.name ? r.event : null;
    if (!eventObj && r.event) {
      const evIdStr = r.event._id ? r.event._id.toString() : r.event.toString();
      eventObj = eventsMap instanceof Map ? (eventsMap.get(evIdStr) || eventsMap.get(r.event)) : null;
    }
    const rawCategory = eventObj?.category || r.eventCategory || r.events?.[0]?.eventCategory || 'technical';
    const eventCategory = rawCategory.toLowerCase() === 'non-technical' ? 'Non-Technical' : 'Technical';
    const eventName = eventObj?.name || r.eventName || r.events?.[0]?.eventName || 'General Event';

    // Screenshot URL
    let screenshotLink = payment.screenshotUrl || '';
    if (screenshotLink && !screenshotLink.startsWith('http') && baseUrl) {
      screenshotLink = `${baseUrl.replace(/\/$/, '')}${screenshotLink.startsWith('/') ? '' : '/'}${screenshotLink}`;
    }

    // Payment Status
    let payStatus = r.paymentStatus || payment.status || 'unpaid';
    if (payment.status === 'verified') payStatus = 'paid';
    if (payment.status === 'rejected') payStatus = 'rejected';

    return {
      'S.No': index + 1,
      'Registration ID': regId,
      'Full Name': u.fullName || '',
      'Email Address': u.email || '',
      'Mobile Number': u.mobile || '',
      'College': u.college || '',
      'Department': u.department || '',
      'Year': u.year || '',
      'Food Preference': u.foodPreference || '',
      'Event Name': eventName,
      'Event Category': eventCategory,
      'Registration Type': r.registrationType || 'INDIVIDUAL',
      'Team Name': t.teamName || '',
      'Team Code': t.teamCode || '',
      'Registration Status': (r.status || 'registered').toUpperCase(),
      'Payment Status': payStatus.toUpperCase(),
      'Transaction ID / UTR': payment.transactionId || '',
      'Payment Phone': payment.paymentPhone || '',
      'Screenshot URL': screenshotLink,
      'Registered Date': r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Column width configurations
  worksheet['!cols'] = [
    { wch: 6 },   // S.No
    { wch: 16 },  // Reg ID
    { wch: 24 },  // Full Name
    { wch: 28 },  // Email
    { wch: 15 },  // Mobile
    { wch: 32 },  // College
    { wch: 22 },  // Department
    { wch: 12 },  // Year
    { wch: 16 },  // Food Preference
    { wch: 26 },  // Event Name
    { wch: 18 },  // Category
    { wch: 18 },  // Type
    { wch: 20 },  // Team Name
    { wch: 14 },  // Team Code
    { wch: 20 },  // Reg Status
    { wch: 16 },  // Payment Status
    { wch: 24 },  // Transaction ID
    { wch: 16 },  // Payment Phone
    { wch: 45 },  // Screenshot URL
    { wch: 22 },  // Date
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

module.exports = { registrationsToExcel };
