import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#222222', color: '#cccccc' }}>
      {/* Top accent line */}
      <div style={{ height: '4px', backgroundColor: '#C40001' }} />

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #C40001 0%, #A80000 100%)' }}
              >
                <span className="text-white font-display font-bold text-sm">TF</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-medium" style={{ color: '#C40001' }}>VVCOE</p>
                <p className="text-base font-display font-bold text-white">
                  TECH FEST <span style={{ color: '#C40001' }}>'26</span>
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#999999' }}>
              Annual Technical Symposium organized by the Department of Computer Science and Engineering,
              V V College of Engineering.
            </p>
            <div className="flex items-start gap-2 text-sm" style={{ color: '#999999' }}>
              <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: '#C40001' }} />
              <p>V V Nagar, Arasoor, Tisaiyanvilai,<br />Sathankulam Taluk, Tuticorin District - 628 656</p>
            </div>
          </div>

          {/* Events */}
          <div>
            <h3
              className="font-display font-semibold text-sm uppercase tracking-wider mb-4"
              style={{ color: '#FFFFFF' }}
            >
              Events
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Paper Presentation', to: '/events/paper-presentation' },
                { label: 'Dev & Deploy', to: '/events/dev-deploy' },
                { label: 'Bug Buster', to: '/events/bug-buster' },
                { label: 'Treasure Hunt 2.0', to: '/events/treasure-hunt' },
                { label: 'Connect & Sketch', to: '/events/connect-sketch' },
                { label: 'Adaptune', to: '/events/adaptune' },
              ].map(e => (
                <li key={e.to}>
                  <Link
                    to={e.to}
                    className="text-sm transition-colors duration-150"
                    style={{ color: '#999999' }}
                    onMouseEnter={ev => { ev.currentTarget.style.color = '#C40001'; }}
                    onMouseLeave={ev => { ev.currentTarget.style.color = '#999999'; }}
                  >
                    {e.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #333333' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-center sm:text-left" style={{ color: '#666666' }}>
            &copy; 2026 V V College of Engineering. All Rights Reserved.
          </p>
          <p className="text-xs flex items-center gap-1" style={{ color: '#666666' }}>
            Approved By AICTE, New Delhi | Affiliated To Anna University Chennai
          </p>
        </div>
      </div>
    </footer>
  );
}
