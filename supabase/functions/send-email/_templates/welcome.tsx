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

interface WelcomeEmailProps {
  displayName: string;
  dashboardUrl: string;
}

export const WelcomeEmail = ({
  displayName,
  dashboardUrl,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to the TANGEDCO Risk Monitoring System</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Welcome to TANGEDCO Risk Monitor</Heading>
        
        <Text style={text}>
          Hello {displayName},
        </Text>

        <Text style={text}>
          Welcome to the Tamil Nadu Electricity Board Risk Monitoring System! 
          Your account has been successfully created and you now have access to our 
          AI-powered risk analysis platform.
        </Text>

        <Section style={featureBox}>
          <Heading style={h2}>What you can do:</Heading>
          <ul style={list}>
            <li>Monitor electricity consumer risk scores in real-time</li>
            <li>Receive intelligent AI-powered risk assessments</li>
            <li>Generate comprehensive reports and analytics</li>
            <li>Track district performance and trends</li>
            <li>Get automated alerts for high-risk units</li>
          </ul>
        </Section>

        <Section style={buttonContainer}>
          <Link href={dashboardUrl} style={button}>
            Access Dashboard
          </Link>
        </Section>

        <Text style={text}>
          If you have any questions or need assistance, please contact your system administrator.
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          Tamil Nadu Electricity Board (TANGEDCO)
          <br />
          Risk Monitoring System
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

const featureBox = {
  backgroundColor: '#f0fff4',
  border: '2px solid #9ae6b4',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const list = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  paddingLeft: '20px',
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3182ce',
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