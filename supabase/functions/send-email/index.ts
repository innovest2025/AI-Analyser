import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from 'npm:resend@4.0.0';
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { RiskAlertEmail } from './_templates/risk-alert.tsx';
import { ReportReadyEmail } from './_templates/report-ready.tsx';
import { WelcomeEmail } from './_templates/welcome.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      type, 
      to, 
      data 
    } = await req.json();

    let html = '';
    let subject = '';
    
    switch (type) {
      case 'risk_alert':
        html = await renderAsync(
          React.createElement(RiskAlertEmail, {
            unitName: data.unitName,
            unitUrn: data.unitUrn,
            district: data.district,
            riskScore: data.riskScore,
            arrears: data.arrears,
            dashboardUrl: data.dashboardUrl
          })
        );
        subject = `🚨 Critical Risk Alert: ${data.unitName}`;
        break;

      case 'report_ready':
        html = await renderAsync(
          React.createElement(ReportReadyEmail, {
            reportTitle: data.reportTitle,
            reportType: data.reportType,
            reportUrl: data.reportUrl,
            generatedAt: data.generatedAt
          })
        );
        subject = `📊 Report Ready: ${data.reportTitle}`;
        break;

      case 'welcome':
        html = await renderAsync(
          React.createElement(WelcomeEmail, {
            displayName: data.displayName,
            dashboardUrl: data.dashboardUrl
          })
        );
        subject = '🎉 Welcome to TANGEDCO Risk Monitor';
        break;

      default:
        throw new Error('Invalid email type');
    }

    const { error } = await resend.emails.send({
      from: 'TANGEDCO Risk Monitor <alerts@resend.dev>',
      to: [to],
      subject,
      html,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});