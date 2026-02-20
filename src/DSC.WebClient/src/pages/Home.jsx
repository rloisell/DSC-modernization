import React from 'react'
import { Callout, Heading, Text } from '@bcgov/design-system-react-components'

export default function Home() {
  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>DSC Modernization</Heading>
        <Text elementType="p">
          This workspace ports the legacy DSC Java application to .NET 10 with a React frontend
          and MariaDB. Use the navigation to access Activity, Projects, and Admin workflows.
        </Text>
      </section>
      <section className="section">
        <Callout
          variant="lightBlue"
          title="Work in progress"
          description="UI screens are being migrated to the B.C. Design System component library."
        />
      </section>
    </div>
  )
}
