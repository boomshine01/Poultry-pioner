
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

// Define the profile data structure based on the Supabase profiles table
interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  farm_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  farm: string;
  bio: string;
  avatarUrl: string;
}

const UserProfile: React.FC = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    farm: '',
    bio: '',
    avatarUrl: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserData>(userData);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session, redirect to login
        navigate('/login');
        return;
      }
      
      // Get user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast({
          variant: "destructive",
          title: t("error"),
          description: "Impossible de récupérer les informations de l'utilisateur",
        });
        navigate('/login');
        return;
      }
      
      try {
        // Get profile data with type assertion to handle the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single() as { data: Profile | null, error: any };
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
          toast({
            variant: "destructive",
            title: t("error"),
            description: "Impossible de récupérer le profil de l'utilisateur",
          });
        }
        
        const userInfo = {
          name: profileData?.full_name || userData.user.user_metadata?.full_name || '',
          email: userData.user.email || '',
          phone: profileData?.phone || '',
          farm: profileData?.farm_name || '',
          bio: profileData?.bio || '',
          avatarUrl: profileData?.avatar_url || ''
        };
        
        setUserData(userInfo);
        setEditData(userInfo);
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast({
          variant: "destructive",
          title: t("error"),
          description: "Une erreur s'est produite lors du chargement du profil",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [navigate, toast, t]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }
      
      // Update profile in database with type assertion
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: editData.name,
          phone: editData.phone,
          farm_name: editData.farm,
          bio: editData.bio,
          avatar_url: editData.avatarUrl,
          updated_at: new Date().toISOString()
        } as any);
      
      if (error) throw error;
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: editData.name }
      });
      
      if (updateError) throw updateError;
      
      setUserData(editData);
      setIsEditing(false);
      
      // Refresh user context to update any stored user data
      await refreshUser();
      
      toast({
        title: t("success"),
        description: "Vos informations ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message || "Une erreur s'est produite lors de la mise à jour du profil.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
      // Force a page refresh to ensure all auth state is cleared
      window.location.href = '/login';
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message || "Une erreur s'est produite lors de la déconnexion.",
      });
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: t("error"),
          description: "Veuillez sélectionner une image valide.",
        });
        return;
      }
      setAvatarFile(file);
    }
  };
  
  const uploadAvatar = async () => {
    if (!avatarFile || !user) {
      return;
    }
    
    try {
      setUploadingAvatar(true);
      
      // Create a unique file path for the avatar
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update the avatar URL in the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setUserData(prev => ({ ...prev, avatarUrl: publicUrl }));
      setEditData(prev => ({ ...prev, avatarUrl: publicUrl }));
      
      toast({
        title: t("success"),
        description: "Votre photo de profil a été mise à jour avec succès.",
      });
      
      // Close the dialog
      setPhotoDialogOpen(false);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message || "Une erreur s'est produite lors du téléchargement de la photo.",
      });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setAvatarFile(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <p>Chargement du profil...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6 px-4">
      <h2 className="text-2xl font-bold">{t('profile')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Avatar and Basic Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t('profile')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24">
              {userData.avatarUrl ? (<AvatarImage src={userData.avatarUrl} alt={userData.name} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {userData.name ? userData.name.split(' ').map(n => n[0]).join('') : '?'}
                </AvatarFallback>
              )}
            </Avatar>
            
            <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">{t('changePhoto')}</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t('uploadProfilePhoto')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="h-11" 
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setPhotoDialogOpen(false)}
                      disabled={uploadingAvatar}
                    >
                      {t('cancel')}
                    </Button>
                    <Button 
                      onClick={uploadAvatar} 
                      disabled={!avatarFile || uploadingAvatar}
                    >
                      {uploadingAvatar ? t('uploading') : t('save')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <div>
              <h3 className="font-medium text-lg">{userData.name || "-"}</h3>
              <p className="text-muted-foreground">{userData.farm || "-"}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* User Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('personalInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('fullName')}</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={editData.name} 
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    value={editData.email} 
                    disabled
                    className="bg-gray-100 h-11"
                  />
                  <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phoneNumber')}</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    value={editData.phone} 
                    onChange={handleChange}
                    className="h-11" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="farm">{t('farmName')}</Label>
                  <Input 
                    id="farm" 
                    name="farm"
                    value={editData.farm} 
                    onChange={handleChange}
                    className="h-11" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">{t('biography')}</Label>
                  <Textarea 
                    id="bio" 
                    name="bio"
                    rows={4}
                    value={editData.bio} 
                    onChange={handleChange} 
                    className="resize-none min-h-[100px]"
                  />
                </div>
                
                <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex justify-end space-x-2'} pt-4`}>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel} 
                    disabled={loading}
                    className={isMobile ? "w-full h-11" : ""}
                  >
                    {t('cancel')}
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={loading}
                    className={isMobile ? "w-full h-11" : ""}
                  >
                    {loading ? t('updating') : t('save')}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('fullName')}</p>
                    <p>{userData.name || "-"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('email')}</p>
                    <p>{userData.email || "-"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('phoneNumber')}</p>
                    <p>{userData.phone || "-"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('farmName')}</p>
                    <p>{userData.farm || "-"}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('biography')}</p>
                  <p className="mt-1">{userData.bio || "-"}</p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className={isMobile ? "w-full h-11" : ""}
                  >
                    {t('editProfile')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Security Settings */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{t('security')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`${isMobile ? 'space-y-4' : 'flex justify-between items-center flex-wrap gap-2'}`}>
                <div>
                  <h4 className="font-medium">{t('changePassword')}</h4>
                  <p className="text-sm text-muted-foreground">{t('updateYourPassword')}</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/forgot-password')}
                  className={isMobile ? "w-full h-11" : ""}
                >
                  {t('change')}
                </Button>
              </div>
              
              <div className={`${isMobile ? 'space-y-4' : 'flex justify-between items-center flex-wrap gap-2'}`}>
                <div>
                  <h4 className="font-medium">{t('logout')}</h4>
                  <p className="text-sm text-muted-foreground">Se déconnecter de l'application</p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className={isMobile ? "w-full h-11" : ""}
                >
                  {t('logout')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
