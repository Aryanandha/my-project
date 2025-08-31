@@ .. @@
 import React, { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useUser } from '../context/UserContext';
-import { supabase } from '../lib/supabaseClient';
 import Header from '../components/Header';
 import { User, Camera, FileText, MapPin, Phone, Mail, Save } from 'lucide-react';
+import { useProfileMutations } from '../hooks/useProfiles';
+import { validateProfileData, sanitizeProfileData } from '../utils/validation';

 const ProfileUpdate: React.FC = () => {
@@ .. @@
   const navigate = useNavigate();
   const { user, setUser, loading } = useUser();
-  const [saving, setSaving] = useState(false);
-  const [saveError, setSaveError] = useState('');
+  const { updateProfile, loading: saving, error: saveError } = useProfileMutations();
   const [formData, setFormData] = useState({
@@ .. @@
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
-    setSaving(true);
-    setSaveError('');
     
-    try {
-      // Update profile in Supabase
-      const { error } = await supabase
-        .from('profiles')
-        .update({
-          name: formData.name,
-          phone: formData.phone,
-          role: formData.role,
-          service_name: formData.serviceName,
-          bio: formData.bio,
-          location: formData.location,
-          price: formData.price,
-          profile_image: formData.profileImage,
-          banner_image: formData.bannerImage
-        })
-        .eq('id', user.id);
-
-      if (error) {
-        setSaveError('Failed to update profile. Please try again.');
-        console.error('Profile update error:', error);
-      } else {
-        // Update local user state
-        const updatedUser = {
-          ...user,
-          name: formData.name,
-          phone: formData.phone,
-          role: formData.role,
-          serviceName: formData.serviceName,
-          bio: formData.bio,
-          location: formData.location,
-          price: formData.price,
-          profileImage: formData.profileImage,
-          bannerImage: formData.bannerImage
-        };
-        
-        setUser(updatedUser);
-        navigate('/dashboard');
-      }
-    } catch (error) {
-      console.error('Error updating profile:', error);
-      setSaveError('Failed to update profile. Please try again.');
+    // Validate form data
+    const sanitizedData = sanitizeProfileData(formData);
+    const validation = validateProfileData(sanitizedData);
+    
+    if (!validation.isValid) {
+      // Handle validation errors if needed
+      console.error('Validation errors:', validation.errors);
+      return;
     }
     
-    setSaving(false);
+    try {
+      const updatedProfile = await updateProfile(sanitizedData);
+      
+      // Update local user state
+      const updatedUser = {
+        ...user,
+        name: updatedProfile.name,
+        phone: updatedProfile.phone,
+        role: updatedProfile.role,
+        serviceName: updatedProfile.serviceName,
+        bio: updatedProfile.bio,
+        location: updatedProfile.location,
+        price: updatedProfile.price,
+        profileImage: updatedProfile.profileImage,
+        bannerImage: updatedProfile.bannerImage
+      };
+      
+      setUser(updatedUser);
+      navigate('/dashboard');
+    } catch (error) {
+      console.error('Profile update failed:', error);
+    }
   };