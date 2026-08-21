/**
 * Converts an array of registration objects to CSV format
 */
const registrationsToCSV = (registrations) => {
  const headers = [
    'Registration ID', 'Full Name', 'Email', 'Mobile', 'College', 'Department', 'Year', 'Food Preference',
    'Event', 'Category', 'Team Name', 'Team Leader', 'Team Members', 'Status', 'Registered At'
  ];

  const rows = registrations.map(r => {
    const members = r.teamMembers ? r.teamMembers.map(m => m.name).join(' | ') : '';
    return [
      r.registrationId,
      r.fullName,
      r.email,
      r.mobile,
      r.college,
      r.department,
      r.year,
      r.foodPreference || '',
      r.eventName,
      r.eventCategory,
      r.teamName || '',
      r.teamLeader || '',
      members,
      r.status,
      new Date(r.createdAt).toLocaleString('en-IN')
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

module.exports = { registrationsToCSV };
