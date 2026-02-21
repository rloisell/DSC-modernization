/*
 * Home.jsx
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Welcome landing page displayed to authenticated users after login.
 * AI-assisted: BC Gov design system component usage; reviewed and directed by Ryan Loiselle.
 */

import React from 'react'
import { Heading, Text } from '@bcgov/design-system-react-components'

export default function Home() {
  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>DSC Modernization</Heading>
        <Text elementType="p">
          Use the navigation to access Activity, Projects, and Admin workflows.
        </Text>
      </section>
    </div>
  )
}
