import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="footerInner">
        <div className="footerBrand">
          <img src="/logo-icon.png" alt="Sarkari Saathi" className="footerLogoImg" />
          <b>
            Sarkari <span className="brandAccent">Saathi</span>
          </b>
        </div>
        <p>Visual navigation for complicated real-world processes.</p>
        <div className="footerLinks">
          <button onClick={() => navigate('about')}>About</button>
          <button onClick={() => navigate('explore')}>Explore</button>
          <button onClick={() => navigate('builder')}>Create Journey</button>
        </div>
        <div className="footerTrust">
          <ShieldCheck size={14} /> Demo content is clearly labelled and not presented as official guidance.
        </div>
      </div>
    </footer>
  );
}
