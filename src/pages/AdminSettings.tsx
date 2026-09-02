import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save, AlertCircle, Mail, Send, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sendTestEmail } from "@/utils/email";

interface SettingItem {
  id: string;
  key: string;
  value: any;
  description: string;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Email Test States
  const [testEmailAddress, setTestEmailAddress] = useState("neonnest254@gmail.com");
  const [sendingTest, setSendingTest] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .order("key");

      if (error) throw error;
      
      let currentSettings = data || [];
      
      // Auto-initialize missing settings
      const requiredSettings = [
        { key: 'manual_paybill_number', value: '4115354', description: 'The M-PESA Paybill or Till number used for manual backup payments.' },
        { key: 'support_whatsapp_number', value: '+254700000000', description: 'WhatsApp number for customers to send payment confirmation.' }
      ];

      let needsRefresh = false;
      for (const req of requiredSettings) {
        if (!currentSettings.find(s => s.key === req.key)) {
          const { error: insertError } = await supabase.from('store_settings').insert(req);
          if (!insertError) needsRefresh = true;
        }
      }

      if (needsRefresh) {
        const { data: refreshedData } = await supabase.from("store_settings").select("*").order("key");
        if (refreshedData) currentSettings = refreshedData;
      }

      setSettings(currentSettings);
    } catch (error: any) {
      toast.error("Failed to load settings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (id: string, key: string, newValue: string) => {
    setSaving(id);
    try {
      let jsonPayload = newValue;
      try {
         JSON.parse(newValue); 
      } catch {
         jsonPayload = `"${newValue.replace(/"/g, '\\"')}"`;
      }

      const { error } = await supabase
        .from("store_settings")
        .update({ value: JSON.parse(jsonPayload) })
        .eq("id", id);
        
      if (error) throw error;
      toast.success(`${key} updated successfully`);
      fetchSettings();
    } catch (error: any) {
      toast.error("Failed to save setting: " + error.message);
    } finally {
      setSaving(null);
    }
  };

  const updateLocalValue = (id: string, newVal: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value: newVal } : s));
  };

  const getDisplayValue = (val: any) => {
    if (typeof val === 'string') return val;
    return JSON.stringify(val);
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress || !testEmailAddress.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSendingTest(true);
    try {
      const res = await sendTestEmail(testEmailAddress.trim());
      if (res.success) {
        if (res.simulated) {
          toast.info("Test email simulated! Add RESEND_API_KEY in Supabase secrets to dispatch live.");
        } else {
          toast.success(`Test email dispatched successfully to ${testEmailAddress}!`);
        }
      } else {
        toast.error(res.error || "Failed to dispatch test email");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Store & System Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage global store variables and transactional integrations.</p>
      </div>

      {/* Resend Email System Integration Card */}
      <div className="bg-card rounded-2xl border border-primary/20 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Resend Email Integration</h2>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Active</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automated transactional emails for Order Confirmation, Delivery Tracking, and Staff Alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Order Confirmations
            </p>
            <p className="text-muted-foreground">Dispatches automatically upon customer checkout.</p>
          </div>
          <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Delivery Status
            </p>
            <p className="text-muted-foreground">Alerts customer when order is Shipped or Delivered.</p>
          </div>
          <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Contact Inquiries
            </p>
            <p className="text-muted-foreground">Sends notifications to admin and confirms with customer.</p>
          </div>
        </div>

        {/* Live Email Test Box */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">Send Test Email via Resend</p>
            <p className="text-xs text-muted-foreground">Verify that your email delivery is reaching inboxes.</p>
          </div>
          <form onSubmit={handleSendTestEmail} className="flex gap-2 w-full sm:w-auto">
            <Input
              type="email"
              placeholder="Your email address"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              className="text-xs w-full sm:w-64 h-9"
              required
            />
            <Button type="submit" disabled={sendingTest} size="sm" className="gap-1.5 shrink-0 h-9">
              {sendingTest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Send Test
            </Button>
          </form>
        </div>
      </div>

      {/* General CMS Settings */}
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>Backend Notice:</strong> Modifying these settings will immediately reflect anywhere on the frontend that fetches the <code>store_settings</code> table. Ensure values are accurate.
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading settings...</div>
          ) : settings.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No settings instantiated in database.</div>
          ) : (
            settings.map((setting) => (
              <div key={setting.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center pb-6 border-b border-border/50 last:border-0 last:pb-0">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">{setting.key.replace(/_/g, ' ')}</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted w-fit px-2 py-0.5 rounded">{setting.key}</p>
                  <p className="text-sm text-muted-foreground mt-2">{setting.description}</p>
                </div>
                <div className="w-full md:w-[350px] flex gap-2">
                  <Input 
                    value={getDisplayValue(setting.value)} 
                    onChange={(e) => updateLocalValue(setting.id, e.target.value)}
                  />
                  <Button 
                    onClick={() => handleUpdate(setting.id, setting.key, getDisplayValue(setting.value))} 
                    disabled={saving === setting.id}
                    className="shrink-0"
                  >
                    {saving === setting.id ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save</>}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;


