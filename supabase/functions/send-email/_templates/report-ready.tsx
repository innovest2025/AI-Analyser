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

interface ReportReadyEmailProps {
  reportTitle: string;
  reportType: string;
  reportUrl: string;
  generatedAt: string;
}

export const ReportReadyEmail = ({
  reportTitle,
  reportType,
  reportUrl,
  generatedAt,
}: ReportReadyEmailProps) => (
  <Html>
    <Head />
    <Preview>Your {reportType} report is ready for download</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📊 Report Generated Successfully</Heading>
        
        <Text style={text}>
          Your requested report has been generated and is ready for download.
        </Text>

        <Section style={reportBox}>
          <Heading style={h2}>Report Details</Heading>
          <Text style={detailText}><strong>Title:</strong> {reportTitle}</Text>
          <Text style={detailText}><strong>Type:</strong> {reportType.replace('_', ' ').toUpperCase()}</Text>
          <Text style={detailText}><strong>Generated:</strong> {new Date(generatedAt).toLocaleString()}</Text>
        </Section>

        <Section style={buttonContainer}>
          <Link href={reportUrl} style={button}>
            Download Report
          </Link>
        </Section>

        <Text style={noteText}>
          <strong>Note:</strong> This report will be available for download for 30 days.
          After that, you can generate a new report from the dashboard.
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          This is an automated notification from the TANGEDCO Risk Monitoring System.
          <br />
          Tamil Nadu Electricity Board
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

const reportBox = {
  backgroundColor: '#f7fafc',
  border: '2px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#38a169',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
};

const noteText = {
  color: '#4a5568',
  fontSize: '14px',
  lineHeight: '20px',
  backgroundColor: '#edf2f7',
  padding: '12px',
  borderRadius: '4px',
  margin: '16px 0',
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