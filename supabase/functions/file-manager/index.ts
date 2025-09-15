import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case 'upload':
        return await handleUpload(params);
      
      case 'list':
        return await listFiles(params);
      
      case 'download':
        return await downloadFile(params);
      
      case 'delete':
        return await deleteFile(params);
      
      case 'process_csv':
        return await processCsvData(params);
      
      case 'export_report':
        return await exportReportToPdf(params);
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in file-manager function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleUpload({ userId, bucketId, fileName, fileData, mimeType, description, tags }) {
  const fileBuffer = new Uint8Array(fileData);
  const filePath = `${userId}/${Date.now()}-${fileName}`;
  
  // Upload file to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketId)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Record file metadata in database
  const { data: fileRecord, error: dbError } = await supabase
    .from('files')
    .insert({
      user_id: userId,
      bucket_id: bucketId,
      file_path: filePath,
      original_name: fileName,
      file_size: fileBuffer.length,
      mime_type: mimeType,
      description,
      tags: tags || []
    })
    .select()
    .single();

  if (dbError) throw dbError;

  return new Response(
    JSON.stringify({ 
      success: true, 
      file: fileRecord,
      storage_path: uploadData.path 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function listFiles({ userId, bucketId, tags, limit = 50 }) {
  let query = supabase
    .from('files')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (bucketId) {
    query = query.eq('bucket_id', bucketId);
  }

  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  const { data, error } = await query;

  if (error) throw error;

  return new Response(
    JSON.stringify({ files: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function downloadFile({ bucketId, filePath }) {
  const { data, error } = await supabase.storage
    .from(bucketId)
    .download(filePath);

  if (error) throw error;

  return new Response(data, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filePath.split('/').pop()}"`
    }
  });
}

async function deleteFile({ fileId, userId }) {
  // Get file record
  const { data: file, error: fetchError } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(file.bucket_id)
    .remove([file.file_path]);

  if (storageError) throw storageError;

  // Delete from database
  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

  if (dbError) throw dbError;

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processCsvData({ fileId, userId }) {
  // Get file record
  const { data: file, error: fetchError } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  // Download and parse CSV
  const { data: fileData, error: downloadError } = await supabase.storage
    .from(file.bucket_id)
    .download(file.file_path);

  if (downloadError) throw downloadError;

  const csvText = await fileData.text();
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.trim());
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      records.push(record);
    }
  }

  // Mark file as processed
  await supabase
    .from('files')
    .update({ 
      is_processed: true, 
      processed_at: new Date().toISOString(),
      metadata: { record_count: records.length, headers }
    })
    .eq('id', fileId);

  return new Response(
    JSON.stringify({ 
      success: true, 
      records,
      summary: {
        total_records: records.length,
        headers,
        file_name: file.original_name
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function exportReportToPdf({ reportId, userId }) {
  // Get report data
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (reportError) throw reportError;

  // Generate simple HTML for PDF conversion (in a real implementation, you might use Puppeteer)
  const htmlContent = generateReportHtml(report);
  
  // For now, we'll save as HTML file - in production you'd convert to PDF
  const fileName = `${report.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.html`;
  const filePath = `${userId}/reports/${fileName}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('reports')
    .upload(filePath, new Blob([htmlContent], { type: 'text/html' }), {
      contentType: 'text/html',
      upsert: true
    });

  if (uploadError) throw uploadError;

  // Update report with file URL
  await supabase
    .from('reports')
    .update({ file_url: filePath })
    .eq('id', reportId);

  return new Response(
    JSON.stringify({ 
      success: true, 
      file_path: filePath,
      download_url: `${supabaseUrl}/storage/v1/object/reports/${filePath}`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function generateReportHtml(report: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${report.title}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            .metadata { background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .data-section { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
    </head>
    <body>
        <h1>${report.title}</h1>
        
        <div class="metadata">
            <p><strong>Report Type:</strong> ${report.report_type.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Generated:</strong> ${new Date(report.generated_at || report.created_at).toLocaleString()}</p>
            <p><strong>Description:</strong> ${report.description}</p>
        </div>

        <div class="data-section">
            <h2>Report Data</h2>
            <pre>${JSON.stringify(report.data, null, 2)}</pre>
        </div>

        <div class="footer">
            <p>Generated by TANGEDCO Risk Monitoring System</p>
            <p>Tamil Nadu Electricity Board</p>
        </div>
    </body>
    </html>
  `;
}