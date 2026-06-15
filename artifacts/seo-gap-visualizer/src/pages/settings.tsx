import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { User, Bell, Trash2, Save, Shield } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [name, setName] = useState("Jordan Davis");
  const [email, setEmail] = useState("jordan@example.com");
  const [defaultCompetitor, setDefaultCompetitor] = useState("ahrefs.com");
  const [notifs, setNotifs] = useState({
    emailReports: true,
    weeklyDigest: true,
    alertNotifications: false,
  });

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Profile</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-xl font-bold text-white">
                  JD
                </div>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    data-testid="input-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="competitor">Default Competitor URL</Label>
                <Input
                  id="competitor"
                  data-testid="input-default-competitor"
                  value={defaultCompetitor}
                  onChange={(e) => setDefaultCompetitor(e.target.value)}
                  placeholder="competitor.com"
                />
                <p className="text-xs text-muted-foreground">Pre-filled in the analysis form</p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <CardDescription>Control how you receive alerts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "emailReports", label: "Email Reports", desc: "Receive weekly analysis reports by email" },
                { key: "weeklyDigest", label: "Weekly Digest", desc: "Summary of new keyword opportunities" },
                { key: "alertNotifications", label: "Alert Notifications", desc: "Instant alerts when competitor publishes new content" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    data-testid={`switch-${key}`}
                    checked={notifs[key as keyof typeof notifs]}
                    onCheckedChange={(v) => setNotifs(prev => ({ ...prev, [key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card className="border-destructive/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-base">Data & Privacy</CardTitle>
                  <CardDescription>Manage your stored analysis data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                <div>
                  <p className="text-sm font-medium text-foreground">Delete all data</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Permanently removes all analysis history and saved reports</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button data-testid="delete-data-button" variant="destructive" size="sm" className="gap-2 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" /> Delete All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your analysis data, saved reports, and history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        data-testid="confirm-delete"
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={() => toast({ title: "Data deleted", description: "All analysis data has been removed." })}
                      >
                        Delete Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button data-testid="save-settings" onClick={handleSave} className="gap-2 px-8">
              <Save className="w-4 h-4" /> Save Settings
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
