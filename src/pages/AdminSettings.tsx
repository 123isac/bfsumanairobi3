import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
      // In Supabase JSONB columns, we want to store strings wrapped in quotes if it's purely a JSON string primitive
      // For this simple implementation, we'll assume string JSON payloads.
      let jsonPayload = newValue;
      try {
         // check if it's already valid JSON (like an array or object), otherwise wrap in quotes to represent a JSON string
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

  // Helper to format JSON stored value safely for the input component
  const getDisplayValue = (val: any) => {
    if (typeof val === 'string') return val;
    return JSON.stringify(val);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Store CMS Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage global variables and text that appear across your website.</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong>Backend Notice:</strong> Modifying these settings will immediately reflect anywhere on the frontend that fetches the <code>store_settings</code> table. Ensure values are accurate.
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden p-6 space-y-6">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading settings...</div>
        ) : settings.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No settings instantiated in database.</div>
        ) : (
          settings.map((setting) => (
            <div key={setting.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center pb-6 border-b border-border/50 last:border-0 last:pb-0">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">{setting.key.replace(/_/g, ' ')}</h3>
                <p className="text-xs text-muted-foreground mt-1 font-mono bg-slate-100 w-fit px-2 py-0.5 rounded">{setting.key}</p>
                <p className="text-sm text-slate-500 mt-2">{setting.description}</p>
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
  );
};

export default AdminSettings;
