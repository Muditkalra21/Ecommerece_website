export default function Footer() {
  const linkStyle = { color: '#a3b0c0', transition: 'color 0.2s', lineHeight: '2' };
  const cols = [
    { title: 'About', links: ['About Us', 'Careers', 'Press', 'Corporate Information'] },
    { title: 'Help', links: ['Payments', 'Shipping', 'Return Policy', 'FAQ'] },
    { title: 'Consumer Policy', links: ['Cancellation & Returns', 'Terms Of Use', 'Security', 'Privacy'] },
    { title: 'Social', links: ['🐦 Twitter', '📘 Facebook', '📸 YouTube', '📷 Instagram'] },
  ];

  return (
    <footer style={{ background: '#172337', color: '#a3b0c0', padding: '40px 0 24px', marginTop: '40px', fontSize: '13px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          {cols.map(({ title, links }) => (
            <div key={title}>
              <h4 style={{ color: '#637383', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                {title}
              </h4>
              <ul style={{ listStyle: 'none' }}>
                {links.map(link => (
                  <li key={link}>
                    <a href="#" style={linkStyle}
                      onMouseOver={e => e.currentTarget.style.color = 'white'}
                      onMouseOut={e => e.currentTarget.style.color = '#a3b0c0'}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #273849', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#637383' }}>Flipkart. All rights reserved. Built with ❤️ using Next.js &amp; FastAPI</p>
        </div>
      </div>
    </footer>
  );
}
