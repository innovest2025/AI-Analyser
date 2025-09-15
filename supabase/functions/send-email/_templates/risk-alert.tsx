import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface RiskAlertEmailProps {
  unitName: string;
  unitUrn: string;
  district: string;
  riskScore: number;
  arrears: number;
  dashboardUrl: string;
}

export const RiskAlertEmail = ({
  unitName,
  unitUrn,
  district,
  riskScore,
  arrears,
  dashboardUrl,
}: RiskAlertEmailProps) => (
  <Html>
    <Head />
    <Preview>Critical risk alert for unit {unitName} - Immediate attention required</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🚨 Critical Risk Alert</Heading>
        
        <Text style={text}>
          A high-risk unit requires immediate attention from the TANGEDCO operations team.
        </Text>

        <Section style={alertBox}>
          <Heading style={h2}>Unit Details</Heading>
          <Text style={detailText}><strong>Unit Name:</strong> {unitName}</Text>
          <Text style={detailText}><strong>URN:</strong> {unitUrn}</Text>
          <Text style={detailText}><strong>District:</strong> {district}</Text>
          <Text style={detailText}><strong>Risk Score:</strong> <span style={riskScore >= 90 ? criticalScore : highScore}>{riskScore}/100</span></Text>
          <Text style={detailText}><strong>Outstanding Arrears:</strong> ₹{arrears.toLocaleString()}</Text>
        </Section>

        <Text style={text}>
          <strong>Recommended Actions:</strong>
        </Text>
        <ul style={list}>
          <li>Immediate field team deployment</li>
          <li>Priority collection efforts</li>
          <li>Customer contact and payment arrangement</li>
          <li>Review for disconnection eligibility</li>
        </ul>

        <Section style={buttonContainer}>
          <Link href={dashboardUrl} style={button}>
            View in Dashboard
          </Link>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          This is an automated alert from the TANGEDCO Risk Monitoring System.
          <br />
          For technical support, contact your system administrator.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '16px 0 8px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const detailText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const alertBox = {
  backgroundColor: '#fff5f5',
  border: '2px solid #fed7d7',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const criticalScore = {
  color: '#e53e3e',
  fontWeight: 'bold',
  fontSize: '16px',
};

const highScore = {
  color: '#d69e2e',
  fontWeight: 'bold',
  fontSize: '16px',
};

const list = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  paddingLeft: '20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};