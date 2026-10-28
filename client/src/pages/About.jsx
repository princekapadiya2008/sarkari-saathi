import React from 'react';
import { Database, Globe2, Route, ShieldCheck, Workflow, Server, Lock } from 'lucide-react';

export default function About() {
  return (
    <main className="page narrowPage">
      <div className="pageHeader">
        <div>
          <span className="eyebrow">About Sarkari Saathi</span>
          <h1>A Visual Guide for Government Procedures</h1>
          <p>
            Sarkari Saathi helps citizens understand complicated public services before visiting an office:
            where to go, which counter to approach, what documents matter, what happens next, and how to handle alternative paths.
          </p>
        </div>
      </div>

      <div className="aboutGrid">
        <AboutCard
          icon={Route}
          title="Visual Navigation First"
          text="Interactive steppers, progress meters, document checklists, and decision branches make each administrative process clear without robotic chatbots."
        />
        <AboutCard
          icon={ShieldCheck}
          title="Trust & Verification"
          text="Verification status, responsible departments, last verified dates, and direct official government portal links are embedded into every journey."
        />
        <AboutCard
          icon={Lock}
          title="Citizen Privacy & Isolation"
          text="Every citizen operates within their own isolated workspace. Checklists and application stages are privately saved to your account."
        />
        <AboutCard
          icon={Server}
          title="Robust Backend Architecture"
          text="Powered by an Express and SQLite data layer with HTTP-only session security, multi-tenant isolation, and real-time synchronization."
        />
      </div>

      <section className="notice">
        <Globe2 size={22} color="#92400e" />
        <div>
          <b>Important Transparency Notice</b>
          <p>
            Sarkari Saathi is an independent civic information platform designed to simplify government administrative processes.
            All guidelines and document checklists are sourced from publicly available government circulars, gazettes, and official department portals.
            Users are advised to verify fee structures and counter timings with the official state or central portal before visiting.
          </p>
        </div>
      </section>

      <section className="dataModel">
        <span className="eyebrow" style={{ color: '#93c5fd' }}>Data Architecture &amp; Future Capabilities</span>
        <h2>Structured Schema for Public Services</h2>
        <div className="tokenGrid">
          {[
            'Department & Ministry Mapping',
            'Official .gov.in Portal Links',
            'Verification Audit Trail',
            'Document Prerequisites',
            'Decision Branching Engine',
            'Role-Based Admin Governance',
            'Citizen Request Pipeline',
            'NRI Administrative Mode',
          ].map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>
    </main>
  );
}

function AboutCard({ icon: Icon, title, text }) {
  return (
    <div className="aboutCard">
      <span className="categoryIcon">
        <Icon size={20} color="#00a2f9" />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
