/**
 * Converts an array of EventRegistration objects and payments to CSV format
 */
const registrationsToCSV = (registrations, paymentsMap = new Map(), eventsMap = new Map(), baseUrl = '') => {
  const headers = [
    'Registration ID', 'Full Name', 'Email', 'Mobile', 'College', 'Department', 'Year', 'Food Preference',
    'Event Name', 'Category', 'Registration Type', 'Team Name', 'Team Code', 'Registration Status',
    'Payment Status', 'Transaction ID / UTR', 'Payment Phone', 'Screenshot URL', 'Registered At'
  ];

  const rows = registrations.map(r => {
    const u = r.user || {};
    const t = r.team || {};

    const regId = r.registrationId || '';
    const userId = u._id ? u._id.toString() : (r.user ? r.user.toString() : '');
    const userEmail = u.email ? u.email.toLowerCase() : '';
    const userMobile = u.mobile || '';

    const payment = (paymentsMap instanceof Map 
      ? (paymentsMap.get(regId) || (userId && paymentsMap.get(userId)) || (userEmail && paymentsMap.get(userEmail)) || (userMobile && paymentsMap.get(userMobile)))
      : (paymentsMap[regId] || (userId && paymentsMap[userId]) || (userEmail && paymentsMap[userEmail]))) || {};

    let eventObj = r.event && typeof r.event === 'object' && r.event.name ? r.event : null;
    if (!eventObj && r.event) {
      const evIdStr = r.event._id ? r.event._id.toString() : r.event.toString();
      eventObj = eventsMap instanceof Map ? (eventsMap.get(evIdStr) || eventsMap.get(r.event)) : null;
    }
    const rawCategory = eventObj?.category || r.eventCategory || r.events?.[0]?.eventCategory || 'technical';
    const eventCategory = rawCategory.toLowerCase() === 'non-technical' ? 'Non-Technical' : 'Technical';
    const eventName = eventObj?.name || r.eventName || r.events?.[0]?.eventName || 'General Event';

    let screenshotLink = payment.screenshotUrl || '';
    if (screenshotLink && !screenshotLink.startsWith('http') && baseUrl) {
      screenshotLink = `${baseUrl.replace(/\/$/, '')}${screenshotLink.startsWith('/') ? '' : '/'}${screenshotLink}`;
    }

    let payStatus = r.paymentStatus || payment.status || 'unpaid';
    if (payment.status === 'verified') payStatus = 'paid';
    if (payment.status === 'rejected') payStatus = 'rejected';

    return [
      regId,
      u.fullName || '',
      u.email || '',
      u.mobile || '',
      u.college || '',
      u.department || '',
      u.year || '',
      u.foodPreference || '',
      eventName,
      eventCategory,
      r.registrationType || 'INDIVIDUAL',
      t.teamName || '',
      t.teamCode || '',
      (r.status || 'registered').toUpperCase(),
      payStatus.toUpperCase(),
      payment.transactionId || '',
      payment.paymentPhone || '',
      screenshotLink,
      r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : ''
    ].map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

module.exports = { registrationsToCSV };
