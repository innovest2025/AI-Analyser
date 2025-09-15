import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  File, 
  Download, 
  Trash2, 
  FileText, 
  Image, 
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FileRecord {
  id: string;
  bucket_id: string;
  file_path: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  description: string | null;
  tags: string[];
  is_processed: boolean;
  created_at: string;
}

export function FileManager() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedBucket, setSelectedBucket] = useState('user-uploads');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logActivity, isManager } = useAuth();
  const { toast } = useToast();

  const buckets = [
    { id: 'user-uploads', name: 'My Uploads', description: 'Personal file uploads' },
    { id: 'documents', name: 'Documents', description: 'Shared documents', adminOnly: true },
    { id: 'reports', name: 'Reports', description: 'Generated reports' },
    { id: 'data-imports', name: 'Data Imports', description: 'CSV data imports', adminOnly: true },
  ];

  const availableBuckets = buckets.filter(bucket => !bucket.adminOnly || isManager);

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user, selectedBucket, searchQuery, selectedTags]);

  const fetchFiles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('file-manager', {
        body: {
          action: 'list',
          userId: user.id,
          bucketId: selectedBucket,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          limit: 50
        }
      });

      if (error) throw error;

      let filteredFiles = data.files || [];
      
      if (searchQuery) {
        filteredFiles = filteredFiles.filter((file: FileRecord) =>
          file.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFiles(filteredFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || !user) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    if (!user) return;

    setUploadProgress(0);
    try {
      // Convert file to base64 for transmission
      const arrayBuffer = await file.arrayBuffer();
      const fileData = Array.from(new Uint8Array(arrayBuffer));

      const { data, error } = await supabase.functions.invoke('file-manager', {
        body: {
          action: 'upload',
          userId: user.id,
          bucketId: selectedBucket,
          fileName: file.name,
          fileData,
          mimeType: file.type,
          description: '',
          tags: []
        }
      });

      if (error) throw error;

      await logActivity('file_upload', `Uploaded file: ${file.name}`);
      
      toast({
        title: 'Upload Complete',
        description: `${file.name} uploaded successfully`,
      });

      fetchFiles();
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file',
        variant: 'destructive'
      });
    } finally {
      setUploadProgress(0);
    }
  };

  const downloadFile = async (file: FileRecord) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('file-manager', {
        body: {
          action: 'download',
          bucketId: file.bucket_id,
          filePath: file.file_path
        }
      });

      if (error) throw error;

      // In a real implementation, you'd handle the blob download
      await logActivity('file_download', `Downloaded file: ${file.original_name}`);
      
      toast({
        title: 'Download Started',
        description: `Downloading ${file.original_name}`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download file',
        variant: 'destructive'
      });
    }
  };

  const deleteFile = async (file: FileRecord) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('file-manager', {
        body: {
          action: 'delete',
          fileId: file.id,
          userId: user.id
        }
      });

      if (error) throw error;

      await logActivity('file_delete', `Deleted file: ${file.original_name}`);
      
      toast({
        title: 'File Deleted',
        description: `${file.original_name} has been deleted`,
      });

      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete file',
        variant: 'destructive'
      });
    }
  };

  const processCsvFile = async (file: FileRecord) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('file-manager', {
        body: {
          action: 'process_csv',
          fileId: file.id,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: 'CSV Processed',
        description: `Processed ${data.summary.total_records} records from ${file.original_name}`,
      });

      fetchFiles();
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast({
        title: 'Processing Failed',
        description: 'Failed to process CSV file',
        variant: 'destructive'
      });
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return <FileSpreadsheet className="h-4 w-4" />;
    if (mimeType.includes('text/')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allTags = Array.from(new Set(files.flatMap(file => file.tags)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">File Manager</h1>
          <p className="text-muted-foreground">
            Upload, manage, and organize your files
          </p>
        </div>
        
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
              <DialogDescription>
                Select files to upload to {buckets.find(b => b.id === selectedBucket)?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Target Bucket</Label>
                <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBuckets.map((bucket) => (
                      <SelectItem key={bucket.id} value={bucket.id}>
                        {bucket.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Select Files</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="mt-1 block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90"
                />
              </div>
              
              {uploadProgress > 0 && (
                <div>
                  <Label>Upload Progress</Label>
                  <Progress value={uploadProgress} className="mt-1" />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Search Files</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>Bucket</Label>
                <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBuckets.map((bucket) => (
                      <SelectItem key={bucket.id} value={bucket.id}>
                        {bucket.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {allTags.length > 0 && (
                <div>
                  <Label>Tags</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {allTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={tag}
                          checked={selectedTags.includes(tag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, tag]);
                            } else {
                              setSelectedTags(selectedTags.filter(t => t !== tag));
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={tag} className="text-sm">{tag}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Files List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Files ({files.length})</CardTitle>
              <CardDescription>
                {buckets.find(b => b.id === selectedBucket)?.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No files found</p>
                  <Button variant="outline" onClick={() => setShowUploadDialog(true)} className="mt-2">
                    Upload your first file
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3 flex-1">
                          {getFileIcon(file.mime_type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{file.original_name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatFileSize(file.file_size)}</span>
                              <span>•</span>
                              <span>{new Date(file.created_at).toLocaleDateString()}</span>
                              {file.is_processed && (
                                <>
                                  <span>•</span>
                                  <Badge variant="secondary" className="text-xs">Processed</Badge>
                                </>
                              )}
                            </div>
                            {file.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {file.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {file.mime_type.includes('csv') && !file.is_processed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => processCsvFile(file)}
                            >
                              Process CSV
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadFile(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteFile(file)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}