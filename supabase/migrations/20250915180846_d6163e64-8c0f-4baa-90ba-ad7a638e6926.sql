-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'manager', 'operator')),
  department TEXT,
  district_access TEXT[] DEFAULT '{}',
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('risk_alert', 'payment_overdue', 'system_update', 'report_ready')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
  read_at TIMESTAMP WITH TIME ZONE,
  sent_email BOOLEAN DEFAULT false,
  sent_sms BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table for automated report generation
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_by UUID REFERENCES public.profiles(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('daily_summary', 'weekly_analysis', 'monthly_review', 'district_performance', 'risk_assessment', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  filters JSONB DEFAULT '{}',
  data JSONB NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'failed', 'archived')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  generated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user activities table for audit trail
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (
  user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (
  user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())
);

-- Create RLS policies for reports
CREATE POLICY "Users can view accessible reports" ON public.reports FOR SELECT USING (
  generated_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (
  generated_by = auth.uid()
);

-- Create RLS policies for user activities
CREATE POLICY "Users can view own activities" ON public.user_activities FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Admins can view all activities" ON public.user_activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')  
);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role, email_notifications)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    'operator',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_reports_generated_by ON public.reports(generated_by);
CREATE INDEX idx_reports_type_status ON public.reports(report_type, status);
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);

-- Create triggers for timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();