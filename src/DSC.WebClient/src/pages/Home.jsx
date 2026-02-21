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
